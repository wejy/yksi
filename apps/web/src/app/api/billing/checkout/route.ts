import { requireAuth, apiError, jsonResponse } from '@/lib/api-utils'
import { getStripe } from '@/lib/stripe'

export async function POST() {
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
