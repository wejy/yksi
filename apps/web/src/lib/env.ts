const DEV_AUTH_SECRET = 'dev-secret-change-in-production'

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function getAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim()
  if (secret) return secret
  if (isProduction()) {
    throw new Error('BETTER_AUTH_SECRET is required in production')
  }
  return DEV_AUTH_SECRET
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

export function requireEnvInProduction(name: string): string | undefined {
  const value = process.env[name]?.trim()
  if (!value && isProduction()) {
    throw new Error(`${name} is required in production`)
  }
  return value
}
