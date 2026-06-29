import {
  mapLinearPriority,
  mapLinearStatus,
  getLinearYhteispintaName,
  YKSI_LINEAR_OAUTH_CLIENT_ID,
  type LinearIssue,
} from '@yksi/core'

export const LINEAR_AUTH_URL = 'https://linear.app/oauth/authorize'
export const LINEAR_TOKEN_URL = 'https://api.linear.app/oauth/token'
export const LINEAR_API_URL = 'https://api.linear.app/graphql'

export function getLinearOAuthClientId(): string | undefined {
  const fromEnv = process.env.LINEAR_CLIENT_ID?.trim()
  if (fromEnv) return fromEnv
  if (YKSI_LINEAR_OAUTH_CLIENT_ID.trim()) return YKSI_LINEAR_OAUTH_CLIENT_ID.trim()
  return undefined
}

export function isLinearOAuthConfigured(): boolean {
  return !!getLinearOAuthClientId()
}

export function getLinearAuthUrl(
  redirectUri: string,
  state: string,
  codeChallenge?: string,
): string {
  const clientId = getLinearOAuthClientId()
  if (!clientId) {
    throw new Error('Linear OAuth client ID not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read,write,issues:create',
    state,
  })

  if (codeChallenge) {
    params.set('code_challenge', codeChallenge)
    params.set('code_challenge_method', 'S256')
  }

  return `${LINEAR_AUTH_URL}?${params}`
}

export async function exchangeLinearCode(
  code: string,
  redirectUri: string,
  options?: { codeVerifier?: string },
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const clientId = getLinearOAuthClientId()
  if (!clientId) throw new Error('Linear OAuth client ID not configured')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
  })

  if (options?.codeVerifier) {
    body.set('code_verifier', options.codeVerifier)
  } else if (process.env.LINEAR_CLIENT_SECRET) {
    body.set('client_secret', process.env.LINEAR_CLIENT_SECRET)
  } else {
    throw new Error('Linear OAuth requires PKCE verifier or client secret')
  }

  const res = await fetch(LINEAR_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
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

export async function validateLinearApiKey(apiKey: string): Promise<boolean> {
  const res = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query: '{ viewer { id } }' }),
  })
  if (!res.ok) return false
  const json = (await res.json()) as { errors?: unknown[] }
  return !json.errors?.length
}

async function linearGraphql<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Linear API error: ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: unknown[] }
  if (json.errors?.length) throw new Error('Linear GraphQL error')
  if (!json.data) throw new Error('Linear GraphQL returned no data')
  return json.data
}

export async function fetchLinearIssues(
  accessToken: string,
  since?: Date,
): Promise<LinearIssue[]> {
  const query = since
    ? `
    query Issues($since: DateTime!) {
      issues(filter: { updatedAt: { gte: $since } }, first: 100) {
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
    : `
    query Issues {
      issues(first: 100) {
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

  const data = await linearGraphql<{ issues?: { nodes: LinearIssue[] } }>(
    accessToken,
    query,
    since ? { since: since.toISOString() } : undefined,
  )
  return data.issues?.nodes ?? []
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
  await linearGraphql(
    accessToken,
    `
    mutation UpdateIssueStatus($issueId: String!, $stateId: String!) {
      issueUpdate(id: $issueId, input: { stateId: $stateId }) {
        success
      }
    }
  `,
    { issueId, stateId },
  )
}

export async function updateLinearIssuePriority(
  accessToken: string,
  issueId: string,
  priority: number,
): Promise<void> {
  await linearGraphql(
    accessToken,
    `
    mutation UpdateIssuePriority($issueId: String!, $priority: Int!) {
      issueUpdate(id: $issueId, input: { priority: $priority }) {
        success
      }
    }
  `,
    { issueId, priority },
  )
}

const TASK_TO_LINEAR_STATE_TYPE: Record<string, string> = {
  open: 'unstarted',
  in_progress: 'started',
  done: 'completed',
  cancelled: 'canceled',
}

export async function resolveLinearStateId(
  accessToken: string,
  issueId: string,
  status: string,
): Promise<string | null> {
  const targetType = TASK_TO_LINEAR_STATE_TYPE[status]
  if (!targetType) return null

  const query = `
    query IssueStates($issueId: String!) {
      issue(id: $issueId) {
        team {
          states {
            nodes { id type name }
          }
        }
      }
    }
  `

  const data = await linearGraphql<{
    issue?: {
      team?: {
        states?: { nodes: { id: string; type: string; name: string }[] }
      }
    }
  }>(accessToken, query, { issueId })

  const states = data.issue?.team?.states?.nodes ?? []
  const match = states.find((s) => s.type === targetType)
  return match?.id ?? null
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
