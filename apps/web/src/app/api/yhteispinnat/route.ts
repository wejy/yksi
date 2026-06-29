import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { eq, sql } from 'drizzle-orm'
import { getDb, tasks, yhteispinnat } from '@yksi/db'
import { z } from 'zod'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const db = getDb()
    const usedInTasks = request.nextUrl.searchParams.get('usedInTasks') === 'true'

    if (usedInTasks) {
      const rows = await db
        .select({
          id: yhteispinnat.id,
          name: yhteispinnat.name,
          color: yhteispinnat.color,
          icon: yhteispinnat.icon,
          taskCount: sql<number>`count(${tasks.id})::int`,
        })
        .from(yhteispinnat)
        .innerJoin(tasks, eq(tasks.yhteispintaId, yhteispinnat.id))
        .where(eq(yhteispinnat.userId, session.user.id))
        .groupBy(yhteispinnat.id, yhteispinnat.name, yhteispinnat.color, yhteispinnat.icon)
        .orderBy(sql`count(${tasks.id}) desc`, yhteispinnat.name)

      return jsonResponse({ intressit: rows })
    }

    const rows = await db
      .select()
      .from(yhteispinnat)
      .where(eq(yhteispinnat.userId, session.user.id))
      .orderBy(yhteispinnat.sortOrder)

    return jsonResponse({ intressit: rows })
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
