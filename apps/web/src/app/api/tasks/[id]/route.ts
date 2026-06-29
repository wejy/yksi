import { requireAuth, apiError, jsonResponse, ApiError } from '@/lib/api-utils'
import { getTaskById, updateTask, deleteTask } from '@/lib/tasks'
import {
  getDecryptedToken,
  updateLinearIssueStatus,
  updateLinearIssuePriority,
  resolveLinearStateId,
  toLinearPriority,
} from '@yksi/integrations'
import { eq, and } from 'drizzle-orm'
import { getDb, integrationConnections } from '@yksi/db'
import { z } from 'zod'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['open', 'in_progress', 'done', 'cancelled']).optional(),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
  yhteispintaId: z.string().uuid().nullable().optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const task = await getTaskById(session.user.id, id)
    if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Tehtävää ei löydy')
    return jsonResponse(task)
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = patchSchema.parse(await request.json())

    const existing = await getTaskById(session.user.id, id)
    if (!existing) throw new ApiError(404, 'TASK_NOT_FOUND', 'Tehtävää ei löydy')

    const task = await updateTask(session.user.id, id, {
      ...body,
      dueAt: body.dueAt !== undefined ? (body.dueAt ? new Date(body.dueAt) : null) : undefined,
      reminderAt:
        body.reminderAt !== undefined
          ? body.reminderAt
            ? new Date(body.reminderAt)
            : null
          : undefined,
    })

    if (existing.source === 'linear' && existing.externalId) {
      const db = getDb()
      const [conn] = await db
        .select()
        .from(integrationConnections)
        .where(
          and(
            eq(integrationConnections.userId, session.user.id),
            eq(integrationConnections.provider, 'linear'),
          ),
        )
        .limit(1)

      if (conn) {
        const token = await getDecryptedToken(conn.id)
        if (body.status) {
          const stateId = await resolveLinearStateId(
            token,
            existing.externalId,
            body.status,
          )
          if (stateId) {
            await updateLinearIssueStatus(token, existing.externalId, stateId)
          }
        }
        if (body.priority) {
          await updateLinearIssuePriority(
            token,
            existing.externalId,
            toLinearPriority(body.priority),
          )
        }
      }
    }

    return jsonResponse(task)
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const deleted = await deleteTask(session.user.id, id)
    if (!deleted) throw new ApiError(404, 'TASK_NOT_FOUND', 'Tehtävää ei löydy tai ei voi poistaa')
    return new Response(null, { status: 204 })
  } catch (error) {
    return apiError(error)
  }
}
