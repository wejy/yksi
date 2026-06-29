import { describe, it, expect } from 'vitest'
import { mapLinearPriority, mapLinearStatus, canAddIntegration } from './index'

describe('mapLinearStatus', () => {
  it('maps Linear states to unified status', () => {
    expect(mapLinearStatus('started')).toBe('in_progress')
    expect(mapLinearStatus('completed')).toBe('done')
    expect(mapLinearStatus('canceled')).toBe('cancelled')
  })
})

describe('mapLinearPriority', () => {
  it('maps Linear priority numbers', () => {
    expect(mapLinearPriority(1)).toBe('urgent')
    expect(mapLinearPriority(4)).toBe('low')
    expect(mapLinearPriority(0)).toBe('none')
  })
})

describe('canAddIntegration', () => {
  it('allows premium unlimited', () => {
    expect(canAddIntegration('premium', 10)).toBe(true)
  })

  it('limits free tier to 3', () => {
    expect(canAddIntegration('free', 2)).toBe(true)
    expect(canAddIntegration('free', 3)).toBe(false)
  })
})
