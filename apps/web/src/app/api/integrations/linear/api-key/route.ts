import { requireAuth, apiError, jsonResponse, ApiError } from '@/lib/api-utils'
import { checkIntegrationLimit } from '@/lib/freemium'
import { encryptToken, syncConnection } from '@yksi/integrations'
import { logActivitySafe } from '@/lib/activity'
import {
  buildIntegrationConnectedSummary,
  buildIntegrationSyncSummary,
} from '@yksi/core'
import { validateLinearApiKey } from '@yksi/integrations/linear'
import { getDb, integrationConnections } from '@yksi/db'
import { z } from 'zod'

const bodySchema = z.object({
  apiKey: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    await checkIntegrationLimit(session.user.id)

    const { apiKey } = bodySchema.parse(await request.json())
    const trimmed = apiKey.trim()

    const valid = await validateLinearApiKey(trimmed)
    if (!valid) {
      throw new ApiError(400, 'INVALID_API_KEY', 'Linear API-avain ei kelpaa. Tarkista avain.')
    }

    const db = getDb()
    const [connection] = await db
      .insert(integrationConnections)
      .values({
        userId: session.user.id,
        provider: 'linear',
        accessTokenEncrypted: encryptToken(trimmed),
        status: 'active',
        metadata: { authType: 'api_key' },
      })
      .onConflictDoUpdate({
        target: [integrationConnections.userId, integrationConnections.provider],
        set: {
          accessTokenEncrypted: encryptToken(trimmed),
          refreshTokenEncrypted: null,
          tokenExpiresAt: null,
          status: 'active',
          metadata: { authType: 'api_key' },
          updatedAt: new Date(),
        },
      })
      .returning()

    let syncResult = { created: 0, updated: 0 }
    if (connection) {
      logActivitySafe(session.user.id, {
        type: 'integration_connected',
        summary: buildIntegrationConnectedSummary('linear'),
        metadata: { provider: 'linear', authType: 'api_key' },
        entityType: 'integration',
        entityId: 'linear',
      })
      try {
        syncResult = await syncConnection(connection.id, 'linear', session.user.id)
        logActivitySafe(session.user.id, {
          type: 'integration_sync',
          summary: buildIntegrationSyncSummary('linear', syncResult.created, syncResult.updated),
          metadata: {
            provider: 'linear',
            tasksCreated: syncResult.created,
            tasksUpdated: syncResult.updated,
            status: 'success',
          },
          entityType: 'integration',
          entityId: 'linear',
        })
      } catch (syncError) {
        console.error('Initial Linear API key sync failed:', syncError)
        logActivitySafe(session.user.id, {
          type: 'integration_sync',
          summary: buildIntegrationSyncSummary('linear', 0, 0, 'error'),
          metadata: {
            provider: 'linear',
            status: 'error',
            errorMessage: syncError instanceof Error ? syncError.message : 'Unknown error',
          },
          entityType: 'integration',
          entityId: 'linear',
        })
      }
    }

    return jsonResponse({ ok: true, ...syncResult })
  } catch (error) {
    return apiError(error)
  }
}
