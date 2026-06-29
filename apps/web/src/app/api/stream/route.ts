import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { listActivityEvents } from '@/lib/activity'
import { z } from 'zod'
import type { NextRequest } from 'next/server'

const querySchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const { limit, offset } = querySchema.parse(params)
    const result = await listActivityEvents(session.user.id, { limit, offset })
    return jsonResponse(result)
  } catch (error) {
    return apiError(error)
  }
}
