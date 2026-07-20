import Stripe from 'stripe'
import { priceIdForTier, type TierId } from '../../utils/tiers'
import { requireUser, upsertUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  if (!cfg.stripeSecret) throw createError({ statusCode: 503, statusMessage: 'Billing is not configured yet.' })

  const user = await requireUser(event) // account required before payment

  const body = await readBody<{ tier?: TierId }>(event)
  const tier = body?.tier
  if (tier !== 'pro' && tier !== 'ultra') throw createError({ statusCode: 400, statusMessage: 'Unknown plan.' })
  const price = priceIdForTier(tier)
  if (!price) throw createError({ statusCode: 503, statusMessage: 'This plan is not available yet.' })

  const stripe = new Stripe(cfg.stripeSecret)
  let customerId = user.customerId
  if (!customerId) {
    const c = await stripe.customers.create({ email: user.email })
    customerId = c.id
    await upsertUser(user.email, { customerId })
    await store().set(`achkit:customer:${customerId}:email`, user.email)
  }

  const origin = getRequestURL(event).origin
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ui_mode: 'embedded',
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    metadata: { tier, email: user.email },
    subscription_data: { metadata: { tier, email: user.email } },
    return_url: `${origin}/dashboard?sub=success`,
    allow_promotion_codes: true,
  })
  return { clientSecret: session.client_secret }
})
