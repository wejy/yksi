import type { TaskPriority, TaskStatus } from './types'

const LINEAR_STATUS_MAP: Record<string, TaskStatus> = {
  backlog: 'open',
  unstarted: 'open',
  started: 'in_progress',
  completed: 'done',
  canceled: 'cancelled',
}

const LINEAR_PRIORITY_MAP: Record<number, TaskPriority> = {
  0: 'none',
  1: 'urgent',
  2: 'high',
  3: 'medium',
  4: 'low',
}

export interface LinearIssue {
  id: string
  title: string
  description?: string | null
  url: string
  dueDate?: string | null
  priority: number
  state: { type: string; name: string }
  labels?: { nodes: { name: string }[] }
  project?: { id: string; name: string } | null
  team?: { id: string; name: string } | null
}

export function mapLinearStatus(stateType: string): TaskStatus {
  return LINEAR_STATUS_MAP[stateType] ?? 'open'
}

export function mapLinearPriority(priority: number): TaskPriority {
  return LINEAR_PRIORITY_MAP[priority] ?? 'none'
}

export function getLinearYhteispintaName(issue: LinearIssue): string {
  return issue.project?.name ?? issue.team?.name ?? 'Linear'
}

export interface NotionPage {
  id: string
  url: string
  properties: Record<string, unknown>
}

export interface NotionPropertyMapping {
  titleKey: string
  descriptionKey?: string
  statusKey?: string
  dueDateKey?: string
  startDateKey?: string
  labelsKey?: string
}

export function extractNotionTitle(
  properties: Record<string, unknown>,
  titleKey: string,
): string {
  const prop = properties[titleKey] as { title?: { plain_text: string }[] } | undefined
  return prop?.title?.[0]?.plain_text ?? 'Untitled'
}

export interface GoogleCalendarEvent {
  id: string
  summary?: string
  description?: string
  htmlLink?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  reminders?: {
    overrides?: { method: string; minutes: number }[]
  }
}

export function parseGoogleDate(
  field: { dateTime?: string; date?: string } | undefined,
): Date | null {
  if (!field) return null
  const value = field.dateTime ?? field.date
  return value ? new Date(value) : null
}

export function computeReminderAt(event: GoogleCalendarEvent): Date | null {
  const start = parseGoogleDate(event.start)
  if (!start) return null
  const override = event.reminders?.overrides?.[0]
  if (!override) return null
  return new Date(start.getTime() - override.minutes * 60 * 1000)
}
