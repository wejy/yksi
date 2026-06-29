import { requireAuth, apiError, jsonResponse, ApiError } from '@/lib/api-utils'
import { checkIntegrationLimit } from '@/lib/freemium'
import { encryptToken, syncConnection } from '@yksi/integrations'
import { logActivitySafe } from '@/lib/activity'
import {
  buildIntegrationConnectedSummary,
  buildIntegrationSyncSummary,
} from '@yksi/core'
import {
  validateNotionApiKey,
  searchNotionDatabases,
} from '@yksi/integrations/notion'
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

    const valid = await validateNotionApiKey(trimmed)
    if (!valid) {
      throw new ApiError(
        400,
        'INVALID_API_KEY',
        'Notion-integraatioavain ei kelpaa. Tarkista avain ja että olet jakanut tietokannat integraatiolle.',
      )
    }

    const databases = await searchNotionDatabases(trimmed)
    const metadata = {
      authType: 'api_key',
      databases: databases.map((db) => ({
        id: db.id,
        name: db.title?.[0]?.plain_text ?? 'Untitled',
      })),
    }

    const db = getDb()
    const [connection] = await db
      .insert(integrationConnections)
      .values({
        userId: session.user.id,
        provider: 'notion',
        accessTokenEncrypted: encryptToken(trimmed),
        status: 'active',
        metadata,
      })
      .onConflictDoUpdate({
        target: [integrationConnections.userId, integrationConnections.provider],
        set: {
          accessTokenEncrypted: encryptToken(trimmed),
          refreshTokenEncrypted: null,
          tokenExpiresAt: null,
          status: 'active',
          metadata,
          updatedAt: new Date(),
        },
      })
      .returning()

    let syncResult = { created: 0, updated: 0 }
    if (connection) {
      logActivitySafe(session.user.id, {
        type: 'integration_connected',
        summary: buildIntegrationConnectedSummary('notion'),
        metadata: { provider: 'notion', authType: 'api_key' },
        entityType: 'integration',
        entityId: 'notion',
      })
      try {
        syncResult = await syncConnection(connection.id, 'notion', session.user.id)
        logActivitySafe(session.user.id, {
          type: 'integration_sync',
          summary: buildIntegrationSyncSummary('notion', syncResult.created, syncResult.updated),
          metadata: {
            provider: 'notion',
            tasksCreated: syncResult.created,
            tasksUpdated: syncResult.updated,
            status: 'success',
          },
          entityType: 'integration',
          entityId: 'notion',
        })
      } catch (syncError) {
        console.error('Initial Notion API key sync failed:', syncError)
        logActivitySafe(session.user.id, {
          type: 'integration_sync',
          summary: buildIntegrationSyncSummary('notion', 0, 0, 'error'),
          metadata: {
            provider: 'notion',
            status: 'error',
            errorMessage: syncError instanceof Error ? syncError.message : 'Unknown error',
          },
          entityType: 'integration',
          entityId: 'notion',
        })
      }
    }

    return jsonResponse({ ok: true, databaseCount: databases.length, ...syncResult })
  } catch (error) {
    return apiError(error)
  }
}
