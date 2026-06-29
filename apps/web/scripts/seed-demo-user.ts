import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq, count, sql } from 'drizzle-orm'
import { getDb, users, tasks } from '@yksi/db'
import { DEMO_USER } from '../src/lib/demo-user'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../.env') })

async function migrateAuthSchema() {
  const db = getDb()
  try {
    await db.execute(sql`
      ALTER TABLE users
      ALTER COLUMN email_verified TYPE boolean
      USING (
        CASE
          WHEN email_verified IS NULL THEN false
          ELSE true
        END
      )
    `)
    console.log('Migrated users.email_verified to boolean')
  } catch {
    // Column already boolean or table empty with correct type
  }
}

async function ensureDemoUser(auth: Awaited<typeof import('../src/lib/auth')>['auth']) {
  const db = getDb()
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_USER.email))
    .limit(1)

  if (existing) {
    console.log(`Demo user already exists: ${DEMO_USER.email}`)
    return existing.id
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      name: DEMO_USER.name,
    },
  })

  if (!result.user?.id) {
    throw new Error('Failed to create demo user')
  }

  console.log(`Created demo user: ${DEMO_USER.email}`)
  return result.user.id
}

async function seedDemoTasks(userId: string) {
  const db = getDb()
  const [row] = await db
    .select({ total: count() })
    .from(tasks)
    .where(eq(tasks.userId, userId))

  if ((row?.total ?? 0) > 0) {
    console.log('Demo tasks already exist, skipping')
    return
  }

  const now = new Date()
  const todayMorning = new Date(now)
  todayMorning.setHours(10, 0, 0, 0)
  const todayAfternoon = new Date(now)
  todayAfternoon.setHours(14, 30, 0, 0)
  const todayEvening = new Date(now)
  todayEvening.setHours(17, 0, 0, 0)

  const demoTasks = [
    {
      title: 'Tarkista sähköposti',
      description: 'Käy läpi tärkeimmät viestit',
      status: 'open' as const,
      priority: 'medium' as const,
      dueAt: todayMorning,
    },
    {
      title: 'Suunnittele viikon tehtävät',
      description: 'Priorisoi Linear- ja Notion-tehtävät',
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueAt: todayAfternoon,
    },
    {
      title: 'Päivitä projektidokumentaatio',
      description: 'Lisää viimeisimmät muutokset',
      status: 'open' as const,
      priority: 'low' as const,
      dueAt: todayEvening,
    },
    {
      title: 'Aamukahvi tiimin kanssa',
      description: null,
      status: 'done' as const,
      priority: 'none' as const,
      dueAt: todayMorning,
      completedAt: todayMorning,
    },
  ]

  await db.insert(tasks).values(
    demoTasks.map((task) => ({
      userId,
      source: 'native' as const,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueAt: task.dueAt,
      completedAt: task.completedAt ?? null,
    })),
  )

  console.log(`Seeded ${demoTasks.length} demo tasks`)
}

async function main() {
  const { auth } = await import('../src/lib/auth')
  await migrateAuthSchema()
  const userId = await ensureDemoUser(auth)
  await seedDemoTasks(userId)
  console.log('Done. Login with:', DEMO_USER.email, '/', DEMO_USER.password)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
