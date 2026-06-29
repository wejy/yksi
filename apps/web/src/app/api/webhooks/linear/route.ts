import { jsonResponse } from '@/lib/api-utils'
import { syncLinearConnection } from '@yksi/integrations'
import { eq } from 'drizzle-orm'
import { getDb, integrationConnections } from '@yksi/db'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

function verifyLinearSignature(body: string, signature: string | null): boolean {
  const secret = process.env.LINEAR_WEBHOOK_SECRET?.trim()
  if (!secret || !signature) return false
  const computed = createHmac('sha256', secret).update(body).digest('hex')
  const provided = Buffer.from(signature)
  const expected = Buffer.from(computed)
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('linear-signature')

  if (!verifyLinearSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body)
  const issueId = payload?.data?.id

  if (!issueId) {
    return jsonResponse({ ok: true, skipped: true })
  }

  const db = getDb()
  const connections = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.provider, 'linear'))

  for (const conn of connections) {
    try {
      await syncLinearConnection(conn.id, conn.userId)
    } catch (error) {
      console.error(`Webhook sync failed for ${conn.id}:`, error)
    }
  }

  return jsonResponse({ ok: true })
}
