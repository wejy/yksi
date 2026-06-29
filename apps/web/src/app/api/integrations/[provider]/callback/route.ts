import { requireAuth } from '@/lib/api-utils'
import { getOAuthRedirectUri } from '@/lib/integration-oauth'
import {
  verifyOAuthStateCookie,
  oauthStateCookieOptions,
  OAUTH_STATE_COOKIE,
} from '@/lib/oauth-state'
import { OAUTH_PKCE_COOKIE } from '@/lib/oauth-pkce'
import { encryptToken, syncConnection } from '@yksi/integrations'
import { logActivitySafe } from '@/lib/activity'
import {
  buildIntegrationConnectedSummary,
  buildIntegrationSyncSummary,
  YKSI_DEV_URL,
  type IntegrationProvider,
} from '@yksi/core'
import { exchangeLinearCode } from '@yksi/integrations/linear'
import { exchangeNotionCode, searchNotionDatabases } from '@yksi/integrations/notion'
import { exchangeGoogleCode, listGoogleCalendars } from '@yksi/integrations/google-calendar'
import { getDb, integrationConnections } from '@yksi/db'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function profileRedirect(path: string, request: NextRequest) {
  const base = process.env.BETTER_AUTH_URL ?? YKSI_DEV_URL
  return NextResponse.redirect(new URL(path, base))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set(OAUTH_STATE_COOKIE, '', { ...oauthStateCookieOptions, maxAge: 0 })
    response.cookies.set(OAUTH_PKCE_COOKIE, '', { ...oauthStateCookieOptions, maxAge: 0 })
    return response
  }

  try {
    const { provider } = await params
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')
    const oauthError = request.nextUrl.searchParams.get('error')

    if (oauthError) {
      return clearStateCookie(profileRedirect('/profile?error=oauth_denied', request))
    }

    const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value
    if (
      !code ||
      !state ||
      !verifyOAuthStateCookie(stateCookie, provider, state)
    ) {
      return clearStateCookie(profileRedirect('/profile?error=oauth_failed', request))
    }

    const session = await requireAuth()
    const redirectUri = getOAuthRedirectUri(provider)
    const db = getDb()

    let accessToken: string
    let refreshToken: string | null = null
    let tokenExpiresAt: Date | null = null
    let metadata: Record<string, unknown> = {}

    switch (provider as IntegrationProvider) {
      case 'linear': {
        const codeVerifier = request.cookies.get(OAUTH_PKCE_COOKIE)?.value
        const tokens = await exchangeLinearCode(code, redirectUri, { codeVerifier })
        accessToken = tokens.accessToken
        refreshToken = tokens.refreshToken ?? null
        if (tokens.expiresIn) {
          tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000)
        }
        break
      }
      case 'notion': {
        const tokens = await exchangeNotionCode(code, redirectUri)
        accessToken = tokens.accessToken
        const databases = await searchNotionDatabases(accessToken)
        metadata = {
          workspaceId: tokens.workspaceId,
          workspaceName: tokens.workspaceName,
          databases: databases.map((db) => ({
            id: db.id,
            name: db.title?.[0]?.plain_text ?? 'Untitled',
          })),
        }
        break
      }
      case 'google_calendar': {
        const tokens = await exchangeGoogleCode(code, redirectUri)
        accessToken = tokens.accessToken
        refreshToken = tokens.refreshToken ?? null
        if (tokens.expiresIn) {
          tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000)
        }
        const calendars = await listGoogleCalendars(accessToken)
        metadata = {
          calendarIds: calendars.map((c) => ({
            id: c.id,
            name: c.summary,
            primary: c.primary ?? false,
          })),
        }
        break
      }
      default:
        return clearStateCookie(profileRedirect('/profile?error=invalid_provider', request))
    }

    const [connection] = await db
      .insert(integrationConnections)
      .values({
        userId: session.user.id,
        provider: provider as IntegrationProvider,
        accessTokenEncrypted: encryptToken(accessToken),
        refreshTokenEncrypted: refreshToken ? encryptToken(refreshToken) : null,
        tokenExpiresAt,
        status: 'active',
        metadata,
      })
      .onConflictDoUpdate({
        target: [integrationConnections.userId, integrationConnections.provider],
        set: {
          accessTokenEncrypted: encryptToken(accessToken),
          refreshTokenEncrypted: refreshToken ? encryptToken(refreshToken) : null,
          tokenExpiresAt,
          status: 'active',
          metadata,
          updatedAt: new Date(),
        },
      })
      .returning()

    let syncResult = { created: 0, updated: 0 }
    if (connection) {
      logActivitySafe(session.user.id, {
        type: 'integration_connected',
        summary: buildIntegrationConnectedSummary(provider),
        metadata: { provider },
        entityType: 'integration',
        entityId: provider,
      })

      try {
        syncResult = await syncConnection(
          connection.id,
          provider as IntegrationProvider,
          session.user.id,
        )
        logActivitySafe(session.user.id, {
          type: 'integration_sync',
          summary: buildIntegrationSyncSummary(
            provider,
            syncResult.created,
            syncResult.updated,
            'success',
          ),
          metadata: {
            provider,
            tasksCreated: syncResult.created,
            tasksUpdated: syncResult.updated,
            status: 'success',
            initial: true,
          },
          entityType: 'integration',
          entityId: provider,
        })
      } catch (syncError) {
        console.error('Initial sync after OAuth failed:', syncError)
        logActivitySafe(session.user.id, {
          type: 'integration_sync',
          summary: buildIntegrationSyncSummary(provider, 0, 0, 'error'),
          metadata: {
            provider,
            status: 'error',
            errorMessage: syncError instanceof Error ? syncError.message : 'Unknown error',
            initial: true,
          },
          entityType: 'integration',
          entityId: provider,
        })
      }
    }

    const queryParams = new URLSearchParams({
      connected: provider,
      created: String(syncResult.created),
      updated: String(syncResult.updated),
    })
    return clearStateCookie(profileRedirect(`/profile?${queryParams.toString()}`, request))
  } catch (error) {
    console.error('OAuth callback error:', error)
    const response = profileRedirect('/profile?error=oauth_failed', request)
    response.cookies.set(OAUTH_STATE_COOKIE, '', { ...oauthStateCookieOptions, maxAge: 0 })
    return response
  }
}
