import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { getDb, users } from '@yksi/db'
import { NextResponse } from 'next/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const stripe = getStripe()

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID_PREMIUM!, quantity: 1 }],
      success_url: `${process.env.BETTER_AUTH_URL}/profile?upgraded=true`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/profile?cancelled=true`,
      metadata: { userId: session.user.id },
    })

    return jsonResponse({ url: checkoutSession.url })
  } catch (error) {
    return apiError(error)
  }
}
