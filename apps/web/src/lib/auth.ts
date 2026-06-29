import { YKSI_DEV_URL } from '@yksi/core'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { getDb, users, sessions, accounts, verifications } from '@yksi/db'
import { getAuthSecret } from '@/lib/env'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  secret: getAuthSecret(),
  baseURL: process.env.BETTER_AUTH_URL ?? YKSI_DEV_URL,
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  plugins: [nextCookies()],
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? YKSI_DEV_URL,
    process.env.EXPO_PUBLIC_API_URL ?? YKSI_DEV_URL,
  ],
})

export type Session = typeof auth.$Infer.Session
