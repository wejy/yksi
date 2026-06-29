import { createHash, randomBytes } from 'node:crypto'

export const OAUTH_PKCE_COOKIE = 'yksi_oauth_pkce'

export function generatePkcePair() {
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}
