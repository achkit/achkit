type CheckoutState = { open: boolean; tier: 'pro' | 'scale' | null }

export const useCheckout = () => useState<CheckoutState>('checkout', () => ({ open: false, tier: null }))

export function openCheckout(tier: 'pro' | 'scale') {
  useCheckout().value = { open: true, tier }
}
export function closeCheckout() {
  useCheckout().value = { open: false, tier: null }
}
