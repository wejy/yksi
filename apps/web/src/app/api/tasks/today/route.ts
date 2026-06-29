import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { getTodayTasks } from '@/lib/tasks'

export async function GET() {
  try {
    const session = await requireAuth()
    const result = await getTodayTasks(session.user.id)
    return jsonResponse(result)
  } catch (error) {
    return apiError(error)
  }
}
