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
