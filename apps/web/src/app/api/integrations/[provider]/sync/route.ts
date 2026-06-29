import { requireAuth, apiError, jsonResponse, ApiError } from '@/lib/api-utils'
import { syncConnection } from '@yksi/integrations'
import { logActivitySafe } from '@/lib/activity'
import { buildIntegrationSyncSummary } from '@yksi/core'
import { eq, and } from 'drizzle-orm'
import { getDb, integrationConnections, syncLogs } from '@yksi/db'
import type { IntegrationProvider } from '@yksi/core'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const session = await requireAuth()
    const { provider } = await params
    const db = getDb()

    const [conn] = await db
      .select()
      .from(integrationConnections)
      .where(
        and(
          eq(integrationConnections.userId, session.user.id),
          eq(integrationConnections.provider, provider as IntegrationProvider),
        ),
      )
      .limit(1)

    if (!conn) throw new ApiError(404, 'CONNECTION_NOT_FOUND', 'Integraatiota ei löydy')

    const [log] = await db
      .insert(syncLogs)
      .values({ connectionId: conn.id, status: 'success' })
      .returning()

    try {
      const result = await syncConnection(
        conn.id,
        provider as IntegrationProvider,
        session.user.id,
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

      logActivitySafe(session.user.id, {
        type: 'integration_sync',
        summary: buildIntegrationSyncSummary(provider, result.created, result.updated, 'success'),
        metadata: {
          provider,
          tasksCreated: result.created,
          tasksUpdated: result.updated,
          status: 'success',
        },
        entityType: 'integration',
        entityId: provider,
      })

      return jsonResponse(result)
    } catch (syncError) {
      const errorMessage = syncError instanceof Error ? syncError.message : 'Unknown error'
      await db
        .update(syncLogs)
        .set({
          status: 'error',
          errorMessage,
          completedAt: new Date(),
        })
        .where(eq(syncLogs.id, log!.id))

      logActivitySafe(session.user.id, {
        type: 'integration_sync',
        summary: buildIntegrationSyncSummary(provider, 0, 0, 'error'),
        metadata: { provider, status: 'error', errorMessage },
        entityType: 'integration',
        entityId: provider,
      })

      throw syncError
    }
  } catch (error) {
    return apiError(error)
  }
}
