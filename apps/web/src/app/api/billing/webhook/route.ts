import { jsonResponse } from '@/lib/api-utils'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { getDb, users } from '@yksi/db'
import { NextResponse } from 'next/server'
import { requireEnv } from '@/lib/env'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requireEnv('STRIPE_WEBHOOK_SECRET'),
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = getDb()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId) {
        await db
          .update(users)
          .set({
            subscriptionTier: 'premium',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await db
        .update(users)
        .set({
          subscriptionTier: 'free',
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, subscription.customer as string))
      break
    }
  }

  return jsonResponse({ received: true })
}
