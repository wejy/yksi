import { jsonResponse } from '@/lib/api-utils'
import { and, eq, gte, lte, isNotNull } from 'drizzle-orm'
import { getDb, tasks, pushTokens } from '@yksi/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const now = new Date()
  const windowStart = new Date(now.getTime() - 60 * 1000)
  const windowEnd = new Date(now.getTime() + 60 * 1000)

  const dueReminders = await db
    .select()
    .from(tasks)
    .where(
      and(
        isNotNull(tasks.reminderAt),
        gte(tasks.reminderAt, windowStart),
        lte(tasks.reminderAt, windowEnd),
        eq(tasks.status, 'open'),
      ),
    )

  const notifications = []

  for (const task of dueReminders) {
    const tokens = await db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.userId, task.userId))

    for (const token of tokens) {
      notifications.push({
        to: token.token,
        title: 'Muistutus',
        body: task.title,
        data: { taskId: task.id },
      })
    }
  }

  if (notifications.length > 0 && process.env.EXPO_ACCESS_TOKEN) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(notifications),
    })
  }

  return jsonResponse({ sent: notifications.length, reminders: dueReminders.length })
}
