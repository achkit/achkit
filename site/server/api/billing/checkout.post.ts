import Stripe from 'stripe'
import { priceIdForTier, type TierId } from '../../utils/tiers'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  if (!cfg.stripeSecret) throw createError({ statusCode: 503, statusMessage: 'Billing is not configured yet.' })

  const body = await readBody<{ tier?: TierId }>(event)
  const tier = body?.tier
  if (tier !== 'pro' && tier !== 'ultra') throw createError({ statusCode: 400, statusMessage: 'Unknown plan.' })

  const price = priceIdForTier(tier)
  if (!price) throw createError({ statusCode: 503, statusMessage: 'This plan is not available yet.' })

  const stripe = new Stripe(cfg.stripeSecret)
  const origin = getRequestURL(event).origin
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ui_mode: 'embedded',
    line_items: [{ price, quantity: 1 }],
    metadata: { tier },
    subscription_data: { metadata: { tier } },
    return_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    allow_promotion_codes: true,
  })
  return { clientSecret: session.client_secret }
})
