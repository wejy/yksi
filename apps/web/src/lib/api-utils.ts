import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { isProduction } from '@/lib/env'

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Kirjautuminen vaaditaan')
  }
  return session
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    )
  }
  if (!isProduction()) {
    console.error(error)
  } else {
    console.error('Unhandled API error')
  }
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 },
  )
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
