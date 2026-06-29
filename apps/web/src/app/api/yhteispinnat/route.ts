import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { eq } from 'drizzle-orm'
import { getDb, yhteispinnat } from '@yksi/db'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await requireAuth()
    const db = getDb()
    const rows = await db
      .select()
      .from(yhteispinnat)
      .where(eq(yhteispinnat.userId, session.user.id))
      .orderBy(yhteispinnat.sortOrder)

    return jsonResponse({ yhteispinnat: rows })
  } catch (error) {
    return apiError(error)
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = createSchema.parse(await request.json())
    const db = getDb()

    const [row] = await db
      .insert(yhteispinnat)
      .values({
        userId: session.user.id,
        name: body.name,
        color: body.color ?? null,
        icon: body.icon ?? null,
      })
      .returning()

    return jsonResponse(row, 201)
  } catch (error) {
    return apiError(error)
  }
}
