import { canAddIntegration } from '@yksi/core'
import { eq, count } from 'drizzle-orm'
import { getDb, users, integrationConnections } from '@yksi/db'
import { ApiError } from './api-utils'

export async function checkIntegrationLimit(userId: string) {
  const db = getDb()
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Käyttäjää ei löydy')

  if (user.subscriptionTier === 'premium') return

  const [result] = await db
    .select({ count: count() })
    .from(integrationConnections)
    .where(eq(integrationConnections.userId, userId))

  if (!canAddIntegration(user.subscriptionTier, result?.count ?? 0)) {
    throw new ApiError(
      403,
      'INTEGRATION_LIMIT_REACHED',
      'Ilmainen tili tukee max 3 integraatiota. Päivitä Premiumiin.',
    )
  }
}

export async function getUserSubscription(userId: string) {
  const db = getDb()
  const [user] = await db
    .select({
      subscriptionTier: users.subscriptionTier,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return user
}
