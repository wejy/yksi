import {
  parseGoogleDate,
  computeReminderAt,
  normalizeTaskContent,
  type GoogleCalendarEvent,
} from '@yksi/core'

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
export const GCAL_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

export function getGoogleCalendarAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GCAL_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params}`
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`)
  const data = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

export async function refreshGoogleToken(refreshToken: string) {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in?: number }
  return { accessToken: data.access_token, expiresIn: data.expires_in }
}

export async function listGoogleCalendars(accessToken: string) {
  const res = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Google calendar list failed: ${res.status}`)
  const data = (await res.json()) as { items: { id: string; summary: string; primary?: boolean }[] }
  return data.items as { id: string; summary: string; primary?: boolean }[]
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) throw new Error(`Google events fetch failed: ${res.status}`)
  const data = (await res.json()) as { items?: GoogleCalendarEvent[] }
  return data.items ?? []
}

export function normalizeGoogleEvent(
  event: GoogleCalendarEvent,
  userId: string,
  calendarName: string,
) {
  const startAt = parseGoogleDate(event.start)
  const endAt = parseGoogleDate(event.end)
  const now = new Date()
  const { contentDocument, description } = normalizeTaskContent({
    plainText: event.description,
  })

  return {
    userId,
    source: 'google_calendar' as const,
    externalId: event.id,
    externalUrl: event.htmlLink ?? null,
    title: event.summary ?? 'Ei otsikkoa',
    description,
    contentDocument,
    status: endAt && endAt < now ? ('done' as const) : ('open' as const),
    priority: 'none' as const,
    dueAt: null,
    startAt,
    endAt,
    reminderAt: computeReminderAt(event),
    labels: [],
    rawPayload: event as unknown as Record<string, unknown>,
    yhteispintaName: calendarName,
    yhteispintaMapping: { googleCalendarId: event.id?.split('@')[0] },
  }
}
