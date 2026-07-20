<script setup lang="ts">
const state = useCheckout()
const loading = ref(false)
const error = ref('')
let checkout: any = null

function loadStripe(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Stripe) return resolve((window as any).Stripe)
    const s = document.createElement('script')
    s.src = 'https://js.stripe.com/v3/'
    s.onload = () => resolve((window as any).Stripe)
    s.onerror = () => reject(new Error('Could not load Stripe.'))
    document.head.appendChild(s)
  })
}

async function mount(tier: 'pro' | 'ultra') {
  loading.value = true
  error.value = ''
  try {
    const cfg = await $fetch<{ enabled: boolean; publishableKey: string }>('/api/billing/config')
    if (!cfg.enabled) throw new Error('Billing is not live yet. Email hello@achkit.com and we will set you up.')
    const Stripe = await loadStripe()
    const stripe = Stripe(cfg.publishableKey)
    const { clientSecret } = await $fetch<{ clientSecret: string }>('/api/billing/checkout', {
      method: 'POST',
      body: { tier },
    })
    checkout = await stripe.initEmbeddedCheckout({ clientSecret })
    await nextTick()
    checkout.mount('#embedded-checkout')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

function teardown() {
  try { checkout?.destroy() } catch {}
  checkout = null
}

function close() {
  teardown()
  closeCheckout()
}

watch(() => state.value.open, (open) => {
  if (open && state.value.tier) {
    document.body.style.overflow = 'hidden'
    mount(state.value.tier)
  } else {
    document.body.style.overflow = ''
    teardown()
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  teardown()
})
</script>

<template>
  <div v-if="state.open" class="ck-overlay" @click.self="close">
    <div class="ck-panel">
      <button class="ck-close" aria-label="Close" @click="close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      <p v-if="loading" class="ck-msg">Loading secure checkout...</p>
      <p v-if="error" class="ck-msg ck-err">{{ error }}</p>
      <div id="embedded-checkout" />
    </div>
  </div>
</template>

<style scoped>
.ck-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 40px 16px; overflow-y: auto; }
.ck-panel { position: relative; background: #fff; border-radius: 24px; width: 100%; max-width: 560px; padding: 44px 20px 20px; min-height: 120px; }
.ck-close { position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border: none; background: var(--mist); border-radius: 8px; cursor: pointer; color: #000; display: flex; align-items: center; justify-content: center; }
.ck-close svg { width: 18px; height: 18px; }
.ck-close:hover { background: var(--ash); }
.ck-msg { font-family: var(--mono); font-size: 14px; color: var(--slate); text-align: center; padding: 20px; }
.ck-err { color: #c0392b; }
</style>
