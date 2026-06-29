import Stripe from 'stripe'
import { requireEnv } from '@/lib/env'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-06-24.dahlia',
    })
  }
  return stripeClient
}
