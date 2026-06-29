import { requireAuth, apiError, jsonResponse, ApiError } from '@/lib/api-utils'
import { eq, and, isNotNull } from 'drizzle-orm'
import { getDb, users, accounts } from '@yksi/db'
import { logActivitySafe } from '@/lib/activity'
import { buildProfileUpdatedSummary } from '@yksi/core'
import { z } from 'zod'
import { isLocale } from '@yksi/i18n'

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  locale: z.enum(['fi', 'en']).optional(),
})

async function getUserProfile(userId: string) {
  const db = getDb()
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      subscriptionTier: users.subscriptionTier,
      timezone: users.timezone,
      locale: users.locale,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  const [credential] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.providerId, 'credential'),
        isNotNull(accounts.password),
      ),
    )
    .limit(1)

  return {
    ...user,
    hasCredentialAccount: Boolean(credential),
  }
}

export async function GET() {
  try {
    const session = await requireAuth()
    const user = await getUserProfile(session.user.id)
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Käyttäjää ei löydy')
    return jsonResponse(user)
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth()
    const body = patchSchema.parse(await request.json())
    const db = getDb()

    const changes: string[] = []
    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    }
    if (body.name !== undefined) {
      updates.name = body.name
      changes.push('name')
    }
    if (body.locale !== undefined && isLocale(body.locale)) {
      updates.locale = body.locale
      changes.push('locale')
    }

    if (Object.keys(updates).length === 1) {
      throw new ApiError(400, 'NO_CHANGES', 'Ei päivitettäviä kenttiä')
    }

    await db.update(users).set(updates).where(eq(users.id, session.user.id))

    logActivitySafe(session.user.id, {
      type: 'profile_updated',
      summary: buildProfileUpdatedSummary(changes),
      metadata: { changes },
      entityType: 'user',
      entityId: session.user.id,
    })

    const user = await getUserProfile(session.user.id)
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Käyttäjää ei löydy')
    return jsonResponse(user)
  } catch (error) {
    return apiError(error)
  }
}
