import { describe, expect, it } from 'vitest'
import { mapLinearGraphqlErrors, mapLinearHttpError } from './errors'

describe('mapLinearHttpError', () => {
  it('maps 401 to reconnect message', () => {
    const err = mapLinearHttpError(401)
    expect(err.code).toBe('LINEAR_UNAUTHORIZED')
    expect(err.status).toBe(401)
    expect(err.message).toContain('Yhdistä Linear uudelleen')
  })

  it('maps 429 to rate limit message', () => {
    const err = mapLinearHttpError(429)
    expect(err.code).toBe('LINEAR_RATE_LIMITED')
    expect(err.status).toBe(429)
  })
})

describe('mapLinearGraphqlErrors', () => {
  it('maps authentication graphql errors', () => {
    const err = mapLinearGraphqlErrors([
      { message: 'Authentication required, not authenticated', extensions: { code: 'UNAUTHENTICATED' } },
    ])
    expect(err.code).toBe('LINEAR_UNAUTHORIZED')
  })

  it('maps rate limit graphql errors', () => {
    const err = mapLinearGraphqlErrors([
      { message: 'Rate limit exceeded', extensions: { code: 'RATELIMITED' } },
    ])
    expect(err.code).toBe('LINEAR_RATE_LIMITED')
  })

  it('includes graphql message when unknown', () => {
    const err = mapLinearGraphqlErrors([{ message: 'Something odd happened' }])
    expect(err.message).toContain('Something odd happened')
  })
})
