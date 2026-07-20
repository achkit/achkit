import Stripe from 'stripe'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  if (!cfg.stripeSecret) throw createError({ statusCode: 503, statusMessage: 'Billing is not configured.' })
  const user = await requireUser(event)
  if (!user.customerId) throw createError({ statusCode: 404, statusMessage: 'No subscription.' })

  const stripe = new Stripe(cfg.stripeSecret)
  const subs = await stripe.subscriptions.list({ customer: user.customerId, status: 'active', limit: 1 })
  const sub = subs.data[0]
  if (!sub) throw createError({ statusCode: 404, statusMessage: 'No active subscription.' })

  await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
  return { ok: true, endsAt: sub.current_period_end }
})
