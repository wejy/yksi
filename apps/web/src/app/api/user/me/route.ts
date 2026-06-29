import { requireAuth, apiError, jsonResponse, ApiError } from '@/lib/api-utils'
import { eq, and } from 'drizzle-orm'
import { getDb, users } from '@yksi/db'

export async function GET() {
  try {
    const session = await requireAuth()
    const db = getDb()
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        subscriptionTier: users.subscriptionTier,
        timezone: users.timezone,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'Käyttäjää ei löydy')
    return jsonResponse(user)
  } catch (error) {
    return apiError(error)
  }
}
