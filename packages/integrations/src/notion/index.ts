import { extractNotionTitle, type NotionPage, type NotionPropertyMapping } from '@yksi/core'

export const NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize'
export const NOTION_TOKEN_URL = 'https://api.notion.com/v1/oauth/token'
export const NOTION_API_URL = 'https://api.notion.com/v1'
export const NOTION_VERSION = '2022-06-28'

export function getNotionAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    owner: 'user',
    state,
  })
  return `${NOTION_AUTH_URL}?${params}`
}

export async function exchangeNotionCode(
  code: string,
  redirectUri: string,
): Promise<{ accessToken: string; workspaceId: string; workspaceName: string }> {
  const credentials = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`,
  ).toString('base64')

  const res = await fetch(NOTION_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) throw new Error(`Notion token exchange failed: ${res.status}`)
  const data = (await res.json()) as {
    access_token: string
    workspace_id: string
    workspace_name: string
  }
  return {
    accessToken: data.access_token,
    workspaceId: data.workspace_id,
    workspaceName: data.workspace_name,
  }
}

export async function searchNotionDatabases(accessToken: string) {
  const res = await fetch(`${NOTION_API_URL}/search`, {
    method: 'POST',
    headers: notionHeaders(accessToken),
    body: JSON.stringify({ filter: { property: 'object', value: 'database' } }),
  })
  if (!res.ok) throw new Error(`Notion search failed: ${res.status}`)
  const data = (await res.json()) as { results: { id: string; title: { plain_text: string }[] }[] }
  return data.results as { id: string; title: { plain_text: string }[] }[]
}

export async function queryNotionDatabase(
  accessToken: string,
  databaseId: string,
  since?: Date,
) {
  const body: Record<string, unknown> = { page_size: 100 }
  if (since) {
    body.filter = {
      timestamp: 'last_edited_time',
      last_edited_time: { after: since.toISOString() },
    }
  }

  const res = await fetch(`${NOTION_API_URL}/databases/${databaseId}/query`, {
    method: 'POST',
    headers: notionHeaders(accessToken),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Notion query failed: ${res.status}`)
  const data = (await res.json()) as { results: NotionPage[] }
  return data.results as NotionPage[]
}

function notionHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

function extractRichText(prop: unknown): string | null {
  const p = prop as { rich_text?: { plain_text: string }[] } | undefined
  return p?.rich_text?.map((t) => t.plain_text).join('') ?? null
}

function extractStatus(prop: unknown): string | null {
  const p = prop as { status?: { name: string }; select?: { name: string } } | undefined
  return p?.status?.name ?? p?.select?.name ?? null
}

function extractDate(prop: unknown): Date | null {
  const p = prop as { date?: { start?: string; end?: string } } | undefined
  const value = p?.date?.end ?? p?.date?.start
  return value ? new Date(value) : null
}

function extractLabels(prop: unknown): string[] {
  const p = prop as { multi_select?: { name: string }[] } | undefined
  return p?.multi_select?.map((s) => s.name) ?? []
}

const STATUS_MAP: Record<string, 'open' | 'in_progress' | 'done' | 'cancelled'> = {
  'Not started': 'open',
  'To Do': 'open',
  'In progress': 'in_progress',
  'In Progress': 'in_progress',
  Done: 'done',
  Complete: 'done',
  Cancelled: 'cancelled',
}

export function normalizeNotionPage(
  page: NotionPage,
  userId: string,
  databaseName: string,
  mapping: NotionPropertyMapping,
) {
  const props = page.properties
  const statusRaw = mapping.statusKey ? extractStatus(props[mapping.statusKey]) : null

  return {
    userId,
    source: 'notion' as const,
    externalId: page.id,
    externalUrl: page.url,
    title: extractNotionTitle(props, mapping.titleKey),
    description: mapping.descriptionKey
      ? extractRichText(props[mapping.descriptionKey])
      : null,
    status: statusRaw ? (STATUS_MAP[statusRaw] ?? 'open') : 'open',
    priority: 'none' as const,
    dueAt: mapping.dueDateKey ? extractDate(props[mapping.dueDateKey]) : null,
    startAt: mapping.startDateKey ? extractDate(props[mapping.startDateKey]) : null,
    endAt: null,
    reminderAt: null,
    labels: mapping.labelsKey ? extractLabels(props[mapping.labelsKey]) : [],
    rawPayload: page as unknown as Record<string, unknown>,
    yhteispintaName: databaseName,
    yhteispintaMapping: { notionDatabaseId: page.id.split('-')[0] },
  }
}

export function defaultNotionMapping(
  properties: Record<string, unknown>,
): NotionPropertyMapping {
  const keys = Object.keys(properties)
  const findType = (type: string) =>
    keys.find((k) => (properties[k] as { type: string }).type === type)

  return {
    titleKey: findType('title') ?? keys[0]!,
    descriptionKey: findType('rich_text'),
    statusKey: findType('status') ?? findType('select'),
    dueDateKey: findType('date'),
    labelsKey: findType('multi_select'),
  }
}
