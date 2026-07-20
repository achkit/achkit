// Single source of truth for plans, prices and limits. Never hardcode these
// numbers in components or endpoints - import from here.

export type TierId = 'pro' | 'scale'

export interface Tier {
  id: TierId
  name: string
  amount: number // USD / month, display only
  limitPerMonth: number | null // null = unlimited
}

export const TIERS: Record<TierId, Tier> = {
  pro: { id: 'pro', name: 'Pro', amount: 29, limitPerMonth: 10000 },
  scale: { id: 'scale', name: 'Scale', amount: 99, limitPerMonth: null },
}

// Free, unauthenticated demo allowance (per IP, best-effort).
export const FREE_PER_MINUTE = 30

export function priceIdForTier(id: TierId): string {
  const cfg = useRuntimeConfig()
  return id === 'scale' ? cfg.priceScale : cfg.pricePro
}

export function tierForPriceId(priceId: string): TierId | null {
  const cfg = useRuntimeConfig()
  if (priceId && priceId === cfg.priceScale) return 'scale'
  if (priceId && priceId === cfg.pricePro) return 'pro'
  return null
}
