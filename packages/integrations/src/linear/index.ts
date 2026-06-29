import {
  mapLinearPriority,
  mapLinearStatus,
  getLinearYhteispintaName,
  type LinearIssue,
} from '@yksi/core'

export const LINEAR_AUTH_URL = 'https://linear.app/oauth/authorize'
export const LINEAR_TOKEN_URL = 'https://api.linear.app/oauth/token'
export const LINEAR_API_URL = 'https://api.linear.app/graphql'

export function getLinearAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.LINEAR_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read,write,issues:create',
    state,
  })
  return `${LINEAR_AUTH_URL}?${params}`
}

export async function exchangeLinearCode(
  code: string,
  redirectUri: string,
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const res = await fetch(LINEAR_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.LINEAR_CLIENT_ID!,
      client_secret: process.env.LINEAR_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) throw new Error(`Linear token exchange failed: ${res.status}`)
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

export async function fetchLinearIssues(
  accessToken: string,
  since?: Date,
): Promise<LinearIssue[]> {
  const filter = since
    ? `filter: { updatedAt: { gte: "${since.toISOString()}" } }`
    : ''

  const query = `
    query {
      issues(${filter}, first: 100) {
        nodes {
          id title description url dueDate priority
          state { type name }
          labels { nodes { name } }
          project { id name }
          team { id name }
        }
      }
    }
  `

  const res = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) throw new Error(`Linear API error: ${res.status}`)
  const json = (await res.json()) as { data?: { issues?: { nodes: LinearIssue[] } } }
  return json.data?.issues?.nodes ?? []
}

export function normalizeLinearIssue(issue: LinearIssue, userId: string) {
  return {
    userId,
    source: 'linear' as const,
    externalId: issue.id,
    externalUrl: issue.url,
    title: issue.title,
    description: issue.description ?? null,
    status: mapLinearStatus(issue.state.type),
    priority: mapLinearPriority(issue.priority),
    dueAt: issue.dueDate ? new Date(issue.dueDate) : null,
    startAt: null,
    endAt: null,
    reminderAt: null,
    labels: issue.labels?.nodes.map((l) => l.name) ?? [],
    rawPayload: issue as unknown as Record<string, unknown>,
    yhteispintaName: getLinearYhteispintaName(issue),
    yhteispintaMapping: issue.project
      ? { linearProjectId: issue.project.id }
      : issue.team
        ? { linearTeamId: issue.team.id }
        : null,
  }
}

export async function updateLinearIssueStatus(
  accessToken: string,
  issueId: string,
  stateId: string,
): Promise<void> {
  const mutation = `
    mutation {
      issueUpdate(id: "${issueId}", input: { stateId: "${stateId}" }) {
        success
      }
    }
  `
  const res = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query: mutation }),
  })
  if (!res.ok) throw new Error(`Linear update failed: ${res.status}`)
}

export async function updateLinearIssuePriority(
  accessToken: string,
  issueId: string,
  priority: number,
): Promise<void> {
  const mutation = `
    mutation {
      issueUpdate(id: "${issueId}", input: { priority: ${priority} }) {
        success
      }
    }
  `
  const res = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query: mutation }),
  })
  if (!res.ok) throw new Error(`Linear priority update failed: ${res.status}`)
}

const PRIORITY_REVERSE: Record<string, number> = {
  none: 0,
  urgent: 1,
  high: 2,
  medium: 3,
  low: 4,
}

export function toLinearPriority(priority: string): number {
  return PRIORITY_REVERSE[priority] ?? 0
}
