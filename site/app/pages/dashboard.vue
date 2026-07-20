<script setup lang="ts">
const { data, refresh } = await useFetch('/api/auth/me', { key: 'me-dash' })
if (!data.value?.user) await navigateTo('/login')

const user = computed(() => data.value?.user)
const usage = computed(() => data.value?.usage || { used: 0, limit: 0 })
const pct = computed(() => {
  const l = usage.value.limit
  if (!l) return 0
  return Math.min(100, Math.round((usage.value.used / l) * 100))
})
const paid = computed(() => user.value?.plan === 'pro' || user.value?.plan === 'ultra')

function copyKey() {
  if (import.meta.client && navigator.clipboard && user.value?.key) navigator.clipboard.writeText(user.value.key)
}
async function cancel() {
  if (!confirm('Cancel your subscription at the end of the billing period?')) return
  await $fetch('/api/billing/cancel', { method: 'POST' }).catch(() => {})
  await refresh()
}

onMounted(() => { if (useRoute().query.sub === 'success') setTimeout(refresh, 2500) })
useSeoMeta({ title: 'Dashboard - achkit', robots: 'noindex' })
</script>

<template>
  <div v-if="user">
    <SiteHeader />

    <section>
      <div class="wrap" style="max-width: 860px">
        <span class="lbl">// Dashboard</span>
        <h1 class="disp" style="font-size: clamp(2.4rem,1.4rem+3vw,4rem); margin: 12px 0 6px">{{ user.email }}</h1>
        <p style="color:var(--slate);font-size:16px;margin:0 0 40px">Plan: <b style="text-transform:uppercase">{{ user.plan }}</b></p>

        <div class="dgrid">
          <div class="dcard">
            <div class="lbl" style="color:var(--smoke)">API key</div>
            <div v-if="user.key" class="keyrow">
              <code class="mono">{{ user.key }}</code>
              <button class="btn dark" style="border-radius:8px;padding:10px 16px" @click="copyKey">Copy</button>
            </div>
            <p v-else style="color:var(--slate);font-size:15px;margin:12px 0 0">Subscribe to get an API key for the hosted validation + routing API.</p>
            <p class="mono" style="font-size:12px;color:var(--smoke);margin-top:14px">Send it as the <b>x-api-key</b> header.</p>
          </div>

          <div class="dcard">
            <div class="lbl" style="color:var(--smoke)">Usage this month</div>
            <div class="usage-n mono">{{ usage.used.toLocaleString() }}<span style="color:var(--smoke)"> / {{ usage.limit ? usage.limit.toLocaleString() : 'unlimited' }}</span></div>
            <div class="bar"><div class="bar-fill" :style="{ width: pct + '%' }" /></div>
          </div>
        </div>

        <div class="dcard" style="margin-top:20px">
          <div class="lbl" style="color:var(--smoke)">Billing</div>
          <div v-if="!paid" style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn dark" @click="openCheckout('pro')">Subscribe to Pro - $29/mo</button>
            <button class="btn ghost" @click="openCheckout('ultra')">Ultra - $99/mo</button>
          </div>
          <div v-else style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            <button v-if="user.plan === 'pro'" class="btn dark" @click="openCheckout('ultra')">Upgrade to Ultra (prorated)</button>
            <button class="btn ghost" @click="cancel">Cancel subscription</button>
          </div>
        </div>
      </div>
    </section>

    <CheckoutModal />
    <SiteFooter />
  </div>
</template>

<style scoped>
.dgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 720px) { .dgrid { grid-template-columns: 1fr; } }
.dcard { background: var(--paper); border-radius: 24px; padding: 26px; }
.keyrow { display: flex; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
.keyrow code { font-size: 14px; word-break: break-all; color: #000; }
.usage-n { font-family: var(--disp); font-size: 42px; margin: 14px 0 12px; letter-spacing: -.02em; }
.bar { height: 10px; background: var(--mist); border-radius: 999px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--mint); border-radius: 999px; transition: width .4s; }
</style>
