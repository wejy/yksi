import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { eq } from 'drizzle-orm'
import { getDb, pushTokens } from '@yksi/db'
import { z } from 'zod'

const bodySchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = bodySchema.parse(await request.json())
    const db = getDb()

    await db
      .insert(pushTokens)
      .values({
        userId: session.user.id,
        token: body.token,
        platform: body.platform,
      })
      .onConflictDoNothing()

    return jsonResponse({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
