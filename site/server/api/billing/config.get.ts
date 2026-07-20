import { TIERS } from '../../utils/tiers'

export default defineEventHandler(() => {
  const cfg = useRuntimeConfig()
  return {
    enabled: Boolean(cfg.stripeSecret && cfg.public.stripePublishable),
    publishableKey: cfg.public.stripePublishable,
    tiers: TIERS,
  }
})
