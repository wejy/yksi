import type { SubscriptionTier } from './types'

export const FREE_INTEGRATION_LIMIT = 3

export function canAddIntegration(
  tier: SubscriptionTier,
  currentCount: number,
): boolean {
  if (tier === 'premium') return true
  return currentCount < FREE_INTEGRATION_LIMIT
}

export function canUseAdvancedFilters(tier: SubscriptionTier): boolean {
  return tier === 'premium'
}

export function getIntegrationLimit(tier: SubscriptionTier): number | null {
  return tier === 'premium' ? null : FREE_INTEGRATION_LIMIT
}
