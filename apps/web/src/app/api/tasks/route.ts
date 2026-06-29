import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { listTasks, createTask } from '@/lib/tasks'
import { z } from 'zod'
import type { NextRequest } from 'next/server'

const querySchema = z.object({
  status: z.enum(['open', 'in_progress', 'done', 'cancelled']).optional(),
  source: z.enum(['linear', 'notion', 'google_calendar', 'native']).optional(),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional(),
  yhteispintaId: z.string().uuid().optional(),
  yhteispintaIds: z.string().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  search: z.string().optional(),
  sources: z.string().optional(),
  sortBy: z.enum(['created_at', 'due_at', 'priority', 'source']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
})

const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  contentDocument: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  reminderAt: z.string().datetime().nullable().optional(),
  yhteispintaId: z.string().uuid().nullable().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const filters = querySchema.parse(params)
    const sources = filters.sources
      ?.split(',')
      .map((s) => s.trim())
      .filter((s): s is 'linear' | 'notion' | 'google_calendar' | 'native' =>
        ['linear', 'notion', 'google_calendar', 'native'].includes(s),
      )
    const yhteispintaIds = filters.yhteispintaIds
      ?.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    const result = await listTasks(session.user.id, {
      ...filters,
      sources: sources?.length ? sources : undefined,
      source: sources?.length ? undefined : filters.source,
      yhteispintaIds: yhteispintaIds?.length ? yhteispintaIds : undefined,
      yhteispintaId: yhteispintaIds?.length ? undefined : filters.yhteispintaId,
      dueBefore: filters.dueBefore ? new Date(filters.dueBefore) : undefined,
      dueAfter: filters.dueAfter ? new Date(filters.dueAfter) : undefined,
    })

    return jsonResponse(result)
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = bodySchema.parse(await request.json())

    const task = await createTask(session.user.id, {
      title: body.title,
      description: body.description,
      contentDocument: (body.contentDocument ?? null) as import('@yksi/core').TaskContentDocument | null,
      priority: body.priority,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      reminderAt: body.reminderAt ? new Date(body.reminderAt) : null,
      yhteispintaId: body.yhteispintaId,
    })

    return jsonResponse(task, 201)
  } catch (error) {
    return apiError(error)
  }
}
