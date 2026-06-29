import { checkIntegrationLimit } from '@/lib/freemium'
import { ApiError } from '@/lib/api-utils'
import {
  generateOAuthState,
  buildOAuthStateCookie,
  oauthStateCookieOptions,
  OAUTH_STATE_COOKIE,
} from '@/lib/oauth-state'
import { generatePkcePair, OAUTH_PKCE_COOKIE } from '@/lib/oauth-pkce'
import {
  getLinearAuthUrl,
  isLinearOAuthConfigured,
} from '@yksi/integrations/linear'
import { getNotionAuthUrl, isNotionOAuthConfigured } from '@yksi/integrations/notion'
import { getGoogleCalendarAuthUrl } from '@yksi/integrations/google-calendar'
import { YKSI_DEV_URL, type IntegrationProvider } from '@yksi/core'
import { NextResponse } from 'next/server'

const PROVIDERS: IntegrationProvider[] = ['linear', 'notion', 'google_calendar']

const PROVIDER_ENV_KEYS: Record<
  IntegrationProvider,
  { clientId: string; clientSecret: string; label: string }
> = {
  linear: {
    clientId: 'LINEAR_CLIENT_ID',
    clientSecret: 'LINEAR_CLIENT_SECRET',
    label: 'Linear',
  },
  notion: {
    clientId: 'NOTION_CLIENT_ID',
    clientSecret: 'NOTION_CLIENT_SECRET',
    label: 'Notion',
  },
  google_calendar: {
    clientId: 'GOOGLE_CLIENT_ID',
    clientSecret: 'GOOGLE_CLIENT_SECRET',
    label: 'Google Calendar',
  },
}

export function assertProviderConfigured(provider: IntegrationProvider) {
  if (provider === 'linear') {
    if (!isLinearOAuthConfigured()) {
      throw new ApiError(
        503,
        'LINEAR_USE_API_KEY',
        'Linear OAuth ei ole käytössä. Käytä API-avainta.',
      )
    }
    return
  }

  if (provider === 'notion') {
    if (!isNotionOAuthConfigured()) {
      throw new ApiError(
        503,
        'NOTION_USE_API_KEY',
        'Notion OAuth ei ole käytössä. Käytä integraatioavainta.',
      )
    }
    return
  }

  const config = PROVIDER_ENV_KEYS[provider]
  if (!process.env[config.clientId] || !process.env[config.clientSecret]) {
    throw new ApiError(
      503,
      'INTEGRATION_NOT_CONFIGURED',
      `${config.label} ei ole konfiguroitu palvelimella.`,
    )
  }
}

export function getOAuthRedirectUri(provider: string) {
  const base = process.env.BETTER_AUTH_URL ?? YKSI_DEV_URL
  return `${base}/api/integrations/${provider}/callback`
}

export function isValidIntegrationProvider(
  provider: string,
): provider is IntegrationProvider {
  return PROVIDERS.includes(provider as IntegrationProvider)
}

export async function startIntegrationOAuth(
  provider: IntegrationProvider,
  userId: string,
): Promise<NextResponse> {
  await checkIntegrationLimit(userId)
  assertProviderConfigured(provider)

  const state = generateOAuthState()
  const redirectUri = getOAuthRedirectUri(provider)

  let authUrl: string
  let pkceVerifier: string | undefined

  switch (provider) {
    case 'linear': {
      const pkce = generatePkcePair()
      pkceVerifier = pkce.codeVerifier
      authUrl = getLinearAuthUrl(redirectUri, state, pkce.codeChallenge)
      break
    }
    case 'notion':
      authUrl = getNotionAuthUrl(redirectUri, state)
      break
    case 'google_calendar':
      authUrl = getGoogleCalendarAuthUrl(redirectUri, state)
      break
  }

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(
    OAUTH_STATE_COOKIE,
    buildOAuthStateCookie(provider, state),
    oauthStateCookieOptions,
  )

  if (pkceVerifier) {
    response.cookies.set(OAUTH_PKCE_COOKIE, pkceVerifier, oauthStateCookieOptions)
  }

  return response
}
