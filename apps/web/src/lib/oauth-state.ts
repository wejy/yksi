import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const OAUTH_STATE_COOKIE = 'yksi_oauth_state'
const MAX_AGE_SECONDS = 600

function getSecret() {
  return process.env.BETTER_AUTH_SECRET ?? 'dev-secret-change-in-production'
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

export function generateOAuthState(): string {
  return randomBytes(16).toString('hex')
}

export function buildOAuthStateCookie(provider: string, state: string): string {
  const payload = `${provider}:${state}`
  return `${payload}:${sign(payload)}`
}

export function verifyOAuthStateCookie(
  cookieValue: string | undefined,
  provider: string,
  state: string,
): boolean {
  if (!cookieValue || !state) return false

  const parts = cookieValue.split(':')
  if (parts.length !== 3) return false

  const [cookieProvider, cookieState, signature] = parts
  if (!cookieProvider || !cookieState || !signature) return false
  if (cookieProvider !== provider || cookieState !== state) return false

  const expected = sign(`${cookieProvider}:${cookieState}`)
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export const oauthStateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: MAX_AGE_SECONDS,
  path: '/',
}
