import {
  and,
  eq,
  gte,
  lte,
  ilike,
  or,
  sql,
  desc,
  asc,
} from 'drizzle-orm'
import { getDb, tasks, yhteispinnat } from '@yksi/db'
import type { TaskFilters, TaskContentDocument, TaskSource, TaskSortBy, TaskSortOrder } from '@yksi/core'
import { normalizeTaskContent, taskContentFromMarkdown, taskContentToPlainText, getLinearTaskSourceDetail } from '@yksi/core'

function mapTaskRow<T extends {
  task: {
    source: TaskSource
    externalId: string | null
    rawPayload: unknown
    labels: string[]
    description: string | null
    contentDocument: unknown
  }
  yhteispinta: { id: string; name: string; color: string | null } | null
}>(row: T) {
  return hydrateTaskContent({
    ...row.task,
    yhteispinta: row.yhteispinta
      ? { id: row.yhteispinta.id, name: row.yhteispinta.name, color: row.yhteispinta.color }
      : null,
    labels: row.task.labels ?? [],
    sourceDetail:
      row.task.source === 'linear'
        ? getLinearTaskSourceDetail(row.task.rawPayload as Record<string, unknown>)
        : null,
  })
}

function hydrateTaskContent<T extends { description: string | null; contentDocument: unknown }>(
  task: T,
): T & { contentDocument: TaskContentDocument | null } {
  if (Array.isArray(task.contentDocument) && task.contentDocument.length > 0) {
    return { ...task, contentDocument: task.contentDocument as TaskContentDocument }
  }
  if (task.description?.trim()) {
    return { ...task, contentDocument: taskContentFromMarkdown(task.description) }
  }
  return { ...task, contentDocument: null }
}

function buildTaskOrder(sortBy?: TaskSortBy, sortOrder?: TaskSortOrder) {
  const tiebreaker = asc(tasks.id)

  if (!sortBy) {
    return [desc(tasks.priority), asc(tasks.dueAt), tiebreaker]
  }

  const dir = sortOrder === 'asc' ? asc : desc

  switch (sortBy) {
    case 'created_at':
      return [dir(tasks.createdAt), tiebreaker]
    case 'due_at':
      return [dir(tasks.dueAt), tiebreaker]
    case 'priority':
      return [dir(tasks.priority), tiebreaker]
    case 'source':
      return [dir(tasks.source), tiebreaker]
    default:
      return [desc(tasks.priority), asc(tasks.dueAt), tiebreaker]
  }
}

export async function listTasks(userId: string, filters: TaskFilters = {}) {
  const db = getDb()
  const conditions = [eq(tasks.userId, userId)]

  if (filters.status) conditions.push(eq(tasks.status, filters.status))
  if (filters.source) conditions.push(eq(tasks.source, filters.source))
  if (filters.priority) conditions.push(eq(tasks.priority, filters.priority))
  if (filters.yhteispintaId)
    conditions.push(eq(tasks.yhteispintaId, filters.yhteispintaId))
  if (filters.dueBefore) conditions.push(lte(tasks.dueAt, filters.dueBefore))
  if (filters.dueAfter) conditions.push(gte(tasks.dueAt, filters.dueAfter))
  if (filters.search) {
    conditions.push(
      or(
        ilike(tasks.title, `%${filters.search}%`),
        ilike(tasks.description, `%${filters.search}%`),
      )!,
    )
  }

  const limit = Math.min(filters.limit ?? 50, 100)
  const offset = filters.offset ?? 0

  const [taskRows, countResult] = await Promise.all([
    db
      .select({
        task: tasks,
        yhteispinta: yhteispinnat,
      })
      .from(tasks)
      .leftJoin(yhteispinnat, eq(tasks.yhteispintaId, yhteispinnat.id))
      .where(and(...conditions))
      .orderBy(...buildTaskOrder(filters.sortBy, filters.sortOrder))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(and(...conditions)),
  ])

  return {
    tasks: taskRows.map((row) => mapTaskRow(row)),
    total: countResult[0]?.count ?? 0,
    limit,
    offset,
  }
}

export async function getTodayTasks(userId: string, timezone = 'Europe/Helsinki') {
  const db = getDb()
  const now = new Date()
  const startOfDay = new Date(now.toLocaleDateString('en-CA', { timeZone: timezone }))
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  const taskRows = await db
    .select({
      task: tasks,
      yhteispinta: yhteispinnat,
    })
    .from(tasks)
    .leftJoin(yhteispinnat, eq(tasks.yhteispintaId, yhteispinnat.id))
    .where(
      and(
        eq(tasks.userId, userId),
        or(
          and(gte(tasks.dueAt, startOfDay), lte(tasks.dueAt, endOfDay)),
          and(gte(tasks.reminderAt, startOfDay), lte(tasks.reminderAt, endOfDay)),
          and(gte(tasks.startAt, startOfDay), lte(tasks.startAt, endOfDay)),
        ),
      ),
    )
    .orderBy(desc(tasks.priority), asc(tasks.dueAt))

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }
  const sorted = taskRows
    .map(({ task, yhteispinta }) => ({
      ...task,
      yhteispinta: yhteispinta
        ? { id: yhteispinta.id, name: yhteispinta.name, color: yhteispinta.color }
        : null,
    }))
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority],
    )

  const completed = sorted.filter((t) => t.status === 'done').length

  return {
    tasks: sorted,
    summary: {
      total: sorted.length,
      completed,
      remaining: sorted.length - completed,
    },
  }
}

export async function getTaskById(userId: string, taskId: string) {
  const db = getDb()
  const [row] = await db
    .select({ task: tasks, yhteispinta: yhteispinnat })
    .from(tasks)
    .leftJoin(yhteispinnat, eq(tasks.yhteispintaId, yhteispinnat.id))
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1)

  if (!row) return null

  return mapTaskRow(row)
}

export async function createTask(
  userId: string,
  data: {
    title: string
    description?: string | null
    contentDocument?: TaskContentDocument | null
    priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent'
    dueAt?: Date | null
    reminderAt?: Date | null
    yhteispintaId?: string | null
  },
) {
  const db = getDb()
  const normalized = data.contentDocument
    ? normalizeTaskContent({ blocks: data.contentDocument, plainText: data.description })
    : normalizeTaskContent({ plainText: data.description })

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      source: 'native',
      title: data.title,
      description: normalized.description,
      contentDocument: normalized.contentDocument,
      priority: data.priority ?? 'none',
      dueAt: data.dueAt ?? null,
      reminderAt: data.reminderAt ?? null,
      yhteispintaId: data.yhteispintaId ?? null,
    })
    .returning()
  return task
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<{
    title: string
    description: string | null
    contentDocument: TaskContentDocument | null
    status: 'open' | 'in_progress' | 'done' | 'cancelled'
    priority: 'none' | 'low' | 'medium' | 'high' | 'urgent'
    dueAt: Date | null
    reminderAt: Date | null
    yhteispintaId: string | null
  }>,
) {
  const db = getDb()
  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }

  if (data.contentDocument !== undefined) {
    const normalized = normalizeTaskContent({
      blocks: data.contentDocument,
      plainText: data.description ?? undefined,
    })
    updateData.contentDocument = normalized.contentDocument
    updateData.description = normalized.description
  } else if (data.description !== undefined) {
    updateData.description = taskContentToPlainText(
      normalizeTaskContent({ plainText: data.description }).contentDocument,
      500,
    ) || null
  }

  if (data.status === 'done') {
    updateData.completedAt = new Date()
  } else if (data.status) {
    updateData.completedAt = null
  }

  const [task] = await db
    .update(tasks)
    .set(updateData)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning()

  return task ?? null
}

export async function deleteTask(userId: string, taskId: string) {
  const db = getDb()
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1)

  if (!task) return false
  if (task.source !== 'native') return false

  await db.delete(tasks).where(eq(tasks.id, taskId))
  return true
}
