import Stripe from 'stripe'
import { issueKey, revokeCustomer } from '../../utils/keys'
import { tierForPriceId, type TierId } from '../../utils/tiers'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  if (!cfg.stripeSecret || !cfg.stripeWebhookSecret) throw createError({ statusCode: 503, statusMessage: 'Billing not configured.' })

  const sig = getHeader(event, 'stripe-signature')
  const raw = await readRawBody(event)
  if (!sig || !raw) throw createError({ statusCode: 400, statusMessage: 'Missing signature or body.' })

  const stripe = new Stripe(cfg.stripeSecret)
  let evt: Stripe.Event
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, cfg.stripeWebhookSecret)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid signature.' })
  }

  if (evt.type === 'checkout.session.completed') {
    const s = evt.data.object as Stripe.Checkout.Session
    const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id
    const tier = (s.metadata?.tier as TierId) || 'pro'
    if (customerId) {
      const key = await issueKey(customerId, tier)
      await store().set(`achkit:session:${s.id}:key`, key, 'EX', 3600)
    }
  } else if (evt.type === 'customer.subscription.deleted') {
    const sub = evt.data.object as Stripe.Subscription
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
    if (customerId) await revokeCustomer(customerId)
  } else if (evt.type === 'customer.subscription.updated') {
    const sub = evt.data.object as Stripe.Subscription
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
    const priceId = sub.items.data[0]?.price?.id
    const tier = priceId ? tierForPriceId(priceId) : null
    if (customerId && tier && (sub.status === 'active' || sub.status === 'trialing')) {
      await issueKey(customerId, tier)
    } else if (customerId && (sub.status === 'canceled' || sub.status === 'unpaid')) {
      await revokeCustomer(customerId)
    }
  }

  return { received: true }
})
