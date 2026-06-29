import type { IntegrationProvider } from './types'

export type ActivityEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'integration_sync'
  | 'integration_connected'
  | 'profile_updated'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  summary: string
  metadata: Record<string, unknown>
  entityType: string | null
  entityId: string | null
  createdAt: string
}

export interface ActivityDayGroup {
  dateKey: string
  label: string
  isToday: boolean
  events: ActivityEvent[]
}

const INTEGRATION_LABELS: Record<IntegrationProvider, string> = {
  linear: 'Linear',
  notion: 'Notion',
  google_calendar: 'Google Calendar',
}

const ACTIVITY_ICONS: Record<ActivityEventType, string> = {
  task_created: 'add_task',
  task_updated: 'edit_note',
  task_deleted: 'delete',
  integration_sync: 'sync',
  integration_connected: 'link',
  profile_updated: 'person',
}

const TASK_FIELD_LABELS: Record<string, string> = {
  title: 'otsikko',
  description: 'kuvaus',
  status: 'tila',
  priority: 'prioriteetti',
  dueAt: 'deadline',
  reminderAt: 'muistutus',
  yhteispintaId: 'intressi',
}

export function getActivityIcon(type: ActivityEventType): string {
  return ACTIVITY_ICONS[type]
}

export function getIntegrationLabel(provider: IntegrationProvider | string): string {
  if (provider in INTEGRATION_LABELS) {
    return INTEGRATION_LABELS[provider as IntegrationProvider]
  }
  return provider
}

export function formatActivityTime(iso: string, locale = 'fi-FI'): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

export function formatActivityDayLabel(dateKey: string, locale = 'fi-FI'): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year!, month! - 1, day)
  const todayKey = toActivityDateKey(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toActivityDateKey(yesterday)

  if (dateKey === todayKey) return locale.startsWith('en') ? 'Today' : 'Tänään'
  if (dateKey === yesterdayKey) return locale.startsWith('en') ? 'Yesterday' : 'Eilen'

  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}

export function toActivityDateKey(date: Date, timezone = 'Europe/Helsinki'): string {
  return date.toLocaleDateString('en-CA', { timeZone: timezone })
}

export function groupActivityEventsByDay(
  events: ActivityEvent[],
  timezone = 'Europe/Helsinki',
  locale = 'fi-FI',
): ActivityDayGroup[] {
  const todayKey = toActivityDateKey(new Date(), timezone)
  const groups = new Map<string, ActivityEvent[]>()

  for (const event of events) {
    const dateKey = toActivityDateKey(new Date(event.createdAt), timezone)
    const bucket = groups.get(dateKey) ?? []
    bucket.push(event)
    groups.set(dateKey, bucket)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayEvents]) => ({
      dateKey,
      label: formatActivityDayLabel(dateKey, locale),
      isToday: dateKey === todayKey,
      events: dayEvents,
    }))
}

export function formatTaskChangeLabels(changes: string[]): string {
  if (changes.length === 0) return ''
  return changes.map((field) => TASK_FIELD_LABELS[field] ?? field).join(', ')
}

export function buildTaskCreatedSummary(title: string): string {
  return `Luotiin tehtävä «${title}»`
}

export function buildTaskUpdatedSummary(title: string, changes: string[]): string {
  const fields = formatTaskChangeLabels(changes)
  if (changes.includes('status')) {
    return `Päivitettiin tehtävää «${title}»`
  }
  return fields
    ? `Muokattiin tehtävää «${title}» (${fields})`
    : `Muokattiin tehtävää «${title}»`
}

export function buildTaskDeletedSummary(title: string): string {
  return `Poistettiin tehtävä «${title}»`
}

export function buildIntegrationSyncSummary(
  provider: IntegrationProvider | string,
  created: number,
  updated: number,
  status: 'success' | 'error' | 'partial' = 'success',
): string {
  const label = getIntegrationLabel(provider)
  if (status === 'error') return `${label}-synkronointi epäonnistui`
  if (created === 0 && updated === 0) return `Synkronoitiin ${label} (ei muutoksia)`
  const parts: string[] = []
  if (created > 0) parts.push(`${created} uutta`)
  if (updated > 0) parts.push(`${updated} päivitettyä`)
  return `Synkronoitiin ${label}: ${parts.join(', ')}`
}

export function buildIntegrationConnectedSummary(provider: IntegrationProvider | string): string {
  return `Yhdistettiin ${getIntegrationLabel(provider)}`
}

export function buildProfileUpdatedSummary(changes: string[]): string {
  const labels: Record<string, string> = { name: 'nimi', locale: 'kieli' }
  const fields = changes.map((c) => labels[c] ?? c).join(', ')
  return fields ? `Päivitettiin profiilia (${fields})` : 'Päivitettiin profiilia'
}
