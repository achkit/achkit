import Stripe from 'stripe'
import { lookupKey } from '../../utils/keys'
import { priceIdForTier, type TierId } from '../../utils/tiers'

// On-site plan switch (Pro <-> Ultra) with automatic proration. No external portal.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  if (!cfg.stripeSecret) throw createError({ statusCode: 503, statusMessage: 'Billing is not configured yet.' })

  const key = getHeader(event, 'x-api-key') || ''
  const rec = await lookupKey(key)
  if (!rec) throw createError({ statusCode: 401, statusMessage: 'A valid API key is required.' })

  const { tier } = await readBody<{ tier?: TierId }>(event)
  if (tier !== 'pro' && tier !== 'ultra') throw createError({ statusCode: 400, statusMessage: 'Unknown plan.' })

  const stripe = new Stripe(cfg.stripeSecret)
  const subs = await stripe.subscriptions.list({ customer: rec.customerId, status: 'active', limit: 1 })
  const sub = subs.data[0]
  if (!sub) throw createError({ statusCode: 404, statusMessage: 'No active subscription to change.' })

  await stripe.subscriptions.update(sub.id, {
    items: [{ id: sub.items.data[0]!.id, price: priceIdForTier(tier) }],
    proration_behavior: 'create_prorations',
  })
  // customer.subscription.updated webhook re-issues the key at the new tier.
  return { changed: true, tier }
})
