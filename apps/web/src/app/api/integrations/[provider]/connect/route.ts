import { apiError, requireAuth, ApiError } from '@/lib/api-utils'
import {
  isValidIntegrationProvider,
  startIntegrationOAuth,
} from '@/lib/integration-oauth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const session = await requireAuth()
    const { provider } = await params

    if (!isValidIntegrationProvider(provider)) {
      throw new ApiError(400, 'INVALID_PROVIDER', 'Tuntematon integraatio')
    }

    return startIntegrationOAuth(provider, session.user.id)
  } catch (error) {
    return apiError(error)
  }
}
