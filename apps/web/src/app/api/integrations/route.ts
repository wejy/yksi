import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { isLinearOAuthConfigured } from '@yksi/integrations/linear'
import { isNotionOAuthConfigured } from '@yksi/integrations/notion'
import { eq } from 'drizzle-orm'
import { getDb, integrationConnections } from '@yksi/db'

export async function GET() {
  try {
    const session = await requireAuth()
    const db = getDb()
    const connections = await db
      .select({
        id: integrationConnections.id,
        provider: integrationConnections.provider,
        status: integrationConnections.status,
        lastSyncedAt: integrationConnections.lastSyncedAt,
        metadata: integrationConnections.metadata,
      })
      .from(integrationConnections)
      .where(eq(integrationConnections.userId, session.user.id))

    return jsonResponse({
      connections,
      capabilities: {
        linear: {
          oauth: isLinearOAuthConfigured(),
          apiKey: true,
        },
        notion: {
          oauth: isNotionOAuthConfigured(),
          apiKey: true,
        },
      },
    })
  } catch (error) {
    return apiError(error)
  }
}
