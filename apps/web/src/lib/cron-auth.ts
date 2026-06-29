import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireEnvInProduction } from '@/lib/env'

export function verifyCronRequest(request: Request): NextResponse | null {
  const secret = requireEnvInProduction('CRON_SECRET')
  if (!secret) {
    // Dev: allow cron without secret; production requires CRON_SECRET.
    if (process.env.NODE_ENV !== 'production') return null
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authHeader = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`

  const provided = Buffer.from(authHeader)
  const expectedBuf = Buffer.from(expected)

  if (
    provided.length !== expectedBuf.length ||
    !timingSafeEqual(provided, expectedBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
