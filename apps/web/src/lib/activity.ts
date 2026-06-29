import { desc, eq } from 'drizzle-orm'
import { activityEvents, getDb } from '@yksi/db'
import type { ActivityEventType } from '@yksi/core'

export interface LogActivityInput {
  type: ActivityEventType
  summary: string
  metadata?: Record<string, unknown>
  entityType?: string
  entityId?: string
}

export async function logActivity(userId: string, input: LogActivityInput) {
  const db = getDb()
  await db.insert(activityEvents).values({
    userId,
    type: input.type,
    summary: input.summary,
    metadata: input.metadata ?? {},
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
  })
}

export function logActivitySafe(userId: string, input: LogActivityInput) {
  void logActivity(userId, input).catch((error) => {
    console.error('Failed to log activity:', error)
  })
}

export async function listActivityEvents(
  userId: string,
  options: { limit?: number; offset?: number } = {},
) {
  const db = getDb()
  const limit = Math.min(options.limit ?? 50, 100)
  const offset = options.offset ?? 0

  const rows = await db
    .select()
    .from(activityEvents)
    .where(eq(activityEvents.userId, userId))
    .orderBy(desc(activityEvents.createdAt))
    .limit(limit)
    .offset(offset)

  return {
    events: rows.map((row) => ({
      id: row.id,
      type: row.type,
      summary: row.summary,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt.toISOString(),
    })),
    limit,
    offset,
  }
}
