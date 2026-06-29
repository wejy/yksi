import { apiError, jsonResponse, requireAuth, ApiError } from '@/lib/api-utils'
import { checkIntegrationLimit } from '@/lib/freemium'
import { encryptToken } from '@yksi/integrations'
import {
  getLinearAuthUrl,
  exchangeLinearCode,
} from '@yksi/integrations/linear'
import {
  getNotionAuthUrl,
  exchangeNotionCode,
  searchNotionDatabases,
} from '@yksi/integrations/notion'
import {
  getGoogleCalendarAuthUrl,
  exchangeGoogleCode,
  listGoogleCalendars,
} from '@yksi/integrations/google-calendar'
import { eq, and } from 'drizzle-orm'
import { getDb, integrationConnections } from '@yksi/db'
import type { IntegrationProvider } from '@yksi/core'
import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'

const PROVIDERS: IntegrationProvider[] = ['linear', 'notion', 'google_calendar']

function getRedirectUri(provider: string) {
  const base = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
  return `${base}/api/integrations/${provider}/callback`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const session = await requireAuth()
    const { provider } = await params

    if (!PROVIDERS.includes(provider as IntegrationProvider)) {
      throw new ApiError(400, 'INVALID_PROVIDER', 'Tuntematon integraatio')
    }

    await checkIntegrationLimit(session.user.id)

    const state = randomBytes(16).toString('hex')
    const redirectUri = getRedirectUri(provider)

    let authUrl: string
    switch (provider) {
      case 'linear':
        authUrl = getLinearAuthUrl(redirectUri, state)
        break
      case 'notion':
        authUrl = getNotionAuthUrl(redirectUri, state)
        break
      case 'google_calendar':
        authUrl = getGoogleCalendarAuthUrl(redirectUri, state)
        break
      default:
        throw new ApiError(400, 'INVALID_PROVIDER', 'Tuntematon integraatio')
    }

    return NextResponse.redirect(authUrl)
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const session = await requireAuth()
    const { provider } = await params
    const db = getDb()

    await db
      .delete(integrationConnections)
      .where(
        and(
          eq(integrationConnections.userId, session.user.id),
          eq(integrationConnections.provider, provider as IntegrationProvider),
        ),
      )

    return new Response(null, { status: 204 })
  } catch (error) {
    return apiError(error)
  }
}
