import { apiError } from '@/lib/api-utils'
import { encryptToken } from '@yksi/integrations'
import { exchangeLinearCode } from '@yksi/integrations/linear'
import { exchangeNotionCode, searchNotionDatabases } from '@yksi/integrations/notion'
import { exchangeGoogleCode, listGoogleCalendars } from '@yksi/integrations/google-calendar'
import { eq } from 'drizzle-orm'
import { getDb, integrationConnections } from '@yksi/db'
import type { IntegrationProvider } from '@yksi/core'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getRedirectUri(provider: string) {
  const base = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
  return `${base}/api/integrations/${provider}/callback`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params
    const code = request.nextUrl.searchParams.get('code')
    const userId = request.nextUrl.searchParams.get('userId')

    if (!code || !userId) {
      return NextResponse.redirect('/profile?error=oauth_failed')
    }

    const redirectUri = getRedirectUri(provider)
    const db = getDb()

    let accessToken: string
    let refreshToken: string | null = null
    let tokenExpiresAt: Date | null = null
    let metadata: Record<string, unknown> = {}

    switch (provider as IntegrationProvider) {
      case 'linear': {
        const tokens = await exchangeLinearCode(code, redirectUri)
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
        return NextResponse.redirect('/profile?error=invalid_provider')
    }

    await db
      .insert(integrationConnections)
      .values({
        userId,
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

    return NextResponse.redirect(`/profile?connected=${provider}`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect('/profile?error=oauth_failed')
  }
}
