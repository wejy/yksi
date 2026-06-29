const PROVIDER_LABELS: Record<string, string> = {
  linear: 'Linear',
  notion: 'Notion',
  google_calendar: 'Google Calendar',
}

export function getProviderLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider
}

export interface SyncResult {
  created: number
  updated: number
}

export function formatSyncResult(provider: string, result: SyncResult): string {
  const name = getProviderLabel(provider)
  if (result.created === 0 && result.updated === 0) {
    return `${name}: synkka valmis — ei uusia tai päivitettyjä tehtäviä.`
  }
  return `${name}: ${result.created} uutta, ${result.updated} päivitettyä tehtävää.`
}

export function formatSyncError(provider: string, message: string): string {
  return `${getProviderLabel(provider)}: ${message}`
}

export function formatLastSyncedBadge(
  iso: string | Date | null | undefined,
  locale: 'fi' | 'en' = 'fi',
): string | null {
  if (!iso) return null
  const date = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(date.getTime())) return null

  const localeTag = locale === 'en' ? 'en-GB' : 'fi-FI'
  const time = date.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' })
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (locale === 'en') {
    if (isToday) return `Synced today at ${time}`
    if (isYesterday) return `Synced yesterday at ${time}`
    const day = date.toLocaleDateString(localeTag, { day: 'numeric', month: 'short' })
    return `Synced ${day} at ${time}`
  }

  if (isToday) return `Synkattu tänään klo ${time}`
  if (isYesterday) return `Synkattu eilen klo ${time}`
  const day = date.toLocaleDateString(localeTag, { day: 'numeric', month: 'short' })
  return `Synkattu ${day} klo ${time}`
}
