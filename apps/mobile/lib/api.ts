import { YKSI_DEV_URL } from '@yksi/core'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? YKSI_DEV_URL

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.message ?? error.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}
