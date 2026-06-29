import { apiError, requireAuth, ApiError } from '@/lib/api-utils'
import { isValidIntegrationProvider } from '@/lib/integration-oauth'
import { eq, and } from 'drizzle-orm'
import { getDb, integrationConnections } from '@yksi/db'
import type { IntegrationProvider } from '@yksi/core'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const session = await requireAuth()
    const { provider } = await params

    if (!isValidIntegrationProvider(provider)) {
      throw new ApiError(400, 'INVALID_PROVIDER', 'Tuntematon integraatio')
    }

    const db = getDb()
    await db
      .delete(integrationConnections)
      .where(
        and(
          eq(integrationConnections.userId, session.user.id),
          eq(integrationConnections.provider, provider as IntegrationProvider),
        ),
      )

    return new Response(null, { status: 204 })
  } catch (error) {
    return apiError(error)
  }
}
