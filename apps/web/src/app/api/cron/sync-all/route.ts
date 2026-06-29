import { jsonResponse } from '@/lib/api-utils'
import { verifyCronRequest } from '@/lib/cron-auth'
import { syncConnection } from '@yksi/integrations'
import { eq } from 'drizzle-orm'
import { getDb, integrationConnections, syncLogs } from '@yksi/db'
import type { IntegrationProvider } from '@yksi/core'

export async function POST(request: Request) {
  const unauthorized = verifyCronRequest(request)
  if (unauthorized) return unauthorized

  const db = getDb()
  const connections = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.status, 'active'))

  const results = []

  for (const conn of connections) {
    const [log] = await db
      .insert(syncLogs)
      .values({ connectionId: conn.id, status: 'success' })
      .returning()

    try {
      const result = await syncConnection(
        conn.id,
        conn.provider as IntegrationProvider,
        conn.userId,
      )
      await db
        .update(syncLogs)
        .set({
          status: 'success',
          tasksCreated: result.created,
          tasksUpdated: result.updated,
          completedAt: new Date(),
        })
        .where(eq(syncLogs.id, log!.id))
      results.push({ connectionId: conn.id, ...result, status: 'success' })
    } catch (error) {
      await db
        .update(syncLogs)
        .set({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown',
          completedAt: new Date(),
        })
        .where(eq(syncLogs.id, log!.id))
      results.push({
        connectionId: conn.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }
  }

  return jsonResponse({ synced: results.length, results })
}
