import type { IntegrationProvider } from '@yksi/core'
import { normalizeTaskContent, type TaskContentDocument } from '@yksi/core'
import { and, eq } from 'drizzle-orm'
import { getDb, integrationConnections } from '@yksi/db'
import { decryptToken, encryptToken } from './crypto'
import { IntegrationError } from './errors'
import { fetchLinearIssues, normalizeLinearIssue } from './linear'
import { queryNotionDatabase, normalizeNotionPage, defaultNotionMapping, fetchNotionPageBlocks } from './notion'
import {
  fetchGoogleCalendarEvents,
  normalizeGoogleEvent,
  refreshGoogleToken,
} from './google-calendar'

export * from './crypto'
export * from './errors'
export * from './linear'
export * from './notion'
export * from './google-calendar'

interface NormalizedTaskInput {
  userId: string
  source: 'linear' | 'notion' | 'google_calendar' | 'native'
  externalId: string | null
  externalUrl: string | null
  title: string
  description: string | null
  contentDocument: TaskContentDocument | null
  status: 'open' | 'in_progress' | 'done' | 'cancelled'
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
  dueAt: Date | null
  startAt: Date | null
  endAt: Date | null
  reminderAt: Date | null
  labels: string[]
  rawPayload: Record<string, unknown>
  yhteispintaId?: string | null
  yhteispintaName?: string
  yhteispintaMapping?: Record<string, unknown> | null
}

async function resolveYhteispintaId(
  userId: string,
  input: Pick<
    NormalizedTaskInput,
    'yhteispintaId' | 'yhteispintaName' | 'yhteispintaMapping'
  >,
): Promise<string | null> {
  if (input.yhteispintaId) return input.yhteispintaId
  if (!input.yhteispintaName?.trim()) return null

  const db = getDb()
  const { yhteispinnat } = await import('@yksi/db')
  const name = input.yhteispintaName.trim()
  const mapping = input.yhteispintaMapping

  if (mapping) {
    const rows = await db
      .select()
      .from(yhteispinnat)
      .where(eq(yhteispinnat.userId, userId))

    for (const row of rows) {
      const existing = row.sourceMapping as Record<string, unknown> | null
      if (!existing) continue
      if (
        mapping.linearProjectId &&
        existing.linearProjectId === mapping.linearProjectId
      ) {
        return row.id
      }
      if (mapping.linearTeamId && existing.linearTeamId === mapping.linearTeamId) {
        return row.id
      }
      if (
        mapping.notionDatabaseId &&
        existing.notionDatabaseId === mapping.notionDatabaseId
      ) {
        return row.id
      }
      if (
        mapping.googleCalendarId &&
        existing.googleCalendarId === mapping.googleCalendarId
      ) {
        return row.id
      }
    }
  }

  const [byName] = await db
    .select()
    .from(yhteispinnat)
    .where(and(eq(yhteispinnat.userId, userId), eq(yhteispinnat.name, name)))
    .limit(1)

  if (byName) {
    if (mapping && !byName.sourceMapping) {
      await db
        .update(yhteispinnat)
        .set({ sourceMapping: mapping, updatedAt: new Date() })
        .where(eq(yhteispinnat.id, byName.id))
    }
    return byName.id
  }

  const [created] = await db
    .insert(yhteispinnat)
    .values({
      userId,
      name,
      sourceMapping: mapping ?? null,
    })
    .returning()

  return created?.id ?? null
}

export async function getDecryptedToken(connectionId: string): Promise<string> {
  const db = getDb()
  const [conn] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1)

  if (!conn) {
    throw new IntegrationError('CONNECTION_NOT_FOUND', 'Integraatiota ei löydy.', 404)
  }

  let token: string
  try {
    token = decryptToken(conn.accessTokenEncrypted)
  } catch {
    throw new IntegrationError(
      'TOKEN_DECRYPT_FAILED',
      'Integraation salausavain on virheellinen tai muuttunut. Yhdistä integraatio uudelleen profiilissa.',
      500,
    )
  }
  return token
}

export async function syncLinearConnection(
  connectionId: string,
  userId: string,
  since?: Date,
): Promise<{ created: number; updated: number }> {
  const token = await getDecryptedToken(connectionId)
  const issues = await fetchLinearIssues(token, since)
  let created = 0
  let updated = 0

  for (const issue of issues) {
    const normalized = normalizeLinearIssue(issue, userId)
    const result = await upsertTask(normalized)
    if (result === 'created') created++
    else updated++
  }

  await updateLastSynced(connectionId)
  return { created, updated }
}

export async function syncNotionConnection(
  connectionId: string,
  userId: string,
  since?: Date,
): Promise<{ created: number; updated: number }> {
  const db = getDb()
  const [conn] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1)

  if (!conn) throw new Error('Connection not found')

  const token = decryptToken(conn.accessTokenEncrypted)
  const metadata = conn.metadata as {
    databases?: { id: string; name: string; mapping?: Record<string, string> }[]
  }

  let created = 0
  let updated = 0

  for (const dbConfig of metadata.databases ?? []) {
    const pages = await queryNotionDatabase(token, dbConfig.id, since)
    const mapping = dbConfig.mapping
      ? {
          titleKey: dbConfig.mapping.titleKey ?? 'Name',
          descriptionKey: dbConfig.mapping.descriptionKey,
          statusKey: dbConfig.mapping.statusKey,
          dueDateKey: dbConfig.mapping.dueDateKey,
          startDateKey: dbConfig.mapping.startDateKey,
          labelsKey: dbConfig.mapping.labelsKey,
        }
      : defaultNotionMapping({})

    for (const page of pages) {
      let notionBlocks = null
      try {
        notionBlocks = await fetchNotionPageBlocks(token, page.id)
      } catch {
        notionBlocks = null
      }
      const normalized = normalizeNotionPage(
        page,
        userId,
        dbConfig.name,
        mapping,
        notionBlocks ?? undefined,
        dbConfig.id,
      )
      const result = await upsertTask(normalized)
      if (result === 'created') created++
      else updated++
    }
  }

  await updateLastSynced(connectionId)
  return { created, updated }
}

export async function syncGoogleCalendarConnection(
  connectionId: string,
  userId: string,
  since?: Date,
): Promise<{ created: number; updated: number }> {
  const db = getDb()
  const [conn] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1)

  if (!conn) throw new Error('Connection not found')

  let token = decryptToken(conn.accessTokenEncrypted)

  if (conn.tokenExpiresAt && conn.tokenExpiresAt < new Date() && conn.refreshTokenEncrypted) {
    const refreshToken = decryptToken(conn.refreshTokenEncrypted)
    const refreshed = await refreshGoogleToken(refreshToken)
    token = refreshed.accessToken
    await db
      .update(integrationConnections)
      .set({
        accessTokenEncrypted: encryptToken(refreshed.accessToken),
        tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn! * 1000),
        updatedAt: new Date(),
      })
      .where(eq(integrationConnections.id, connectionId))
  }

  const metadata = conn.metadata as {
    calendarIds?: { id: string; name: string }[]
  }

  const timeMin = since ?? new Date()
  const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  let created = 0
  let updated = 0

  for (const cal of metadata.calendarIds ?? []) {
    const events = await fetchGoogleCalendarEvents(token, cal.id, timeMin, timeMax)
    for (const event of events) {
      const normalized = normalizeGoogleEvent(event, userId, cal.name)
      const result = await upsertTask(normalized)
      if (result === 'created') created++
      else updated++
    }
  }

  await updateLastSynced(connectionId)
  return { created, updated }
}

export async function syncConnection(
  connectionId: string,
  provider: IntegrationProvider,
  userId: string,
): Promise<{ created: number; updated: number }> {
  const db = getDb()
  const [conn] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1)

  const since = conn?.lastSyncedAt ?? undefined

  switch (provider) {
    case 'linear':
      return syncLinearConnection(connectionId, userId, since)
    case 'notion':
      return syncNotionConnection(connectionId, userId, since)
    case 'google_calendar':
      return syncGoogleCalendarConnection(connectionId, userId, since)
  }
}

async function upsertTask(input: NormalizedTaskInput): Promise<'created' | 'updated'> {
  const db = getDb()
  const { tasks } = await import('@yksi/db')
  const yhteispintaId = await resolveYhteispintaId(input.userId, input)

  const taskValues = {
    title: input.title,
    description: input.description,
    contentDocument: input.contentDocument,
    status: input.status,
    priority: input.priority,
    dueAt: input.dueAt,
    startAt: input.startAt,
    endAt: input.endAt,
    reminderAt: input.reminderAt,
    labels: input.labels,
    rawPayload: input.rawPayload,
    yhteispintaId,
    syncedAt: new Date(),
    updatedAt: new Date(),
    completedAt: input.status === 'done' ? new Date() : null,
  }

  if (input.externalId) {
    const existing = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, input.userId),
          eq(tasks.source, input.source),
          eq(tasks.externalId, input.externalId),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(tasks)
        .set(taskValues)
        .where(eq(tasks.id, existing[0]!.id))
      return 'updated'
    }
  }

  await db.insert(tasks).values({
    userId: input.userId,
    source: input.source,
    externalId: input.externalId,
    externalUrl: input.externalUrl,
    ...taskValues,
  })

  return 'created'
}

async function updateLastSynced(connectionId: string) {
  const db = getDb()
  await db
    .update(integrationConnections)
    .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
    .where(eq(integrationConnections.id, connectionId))
}
