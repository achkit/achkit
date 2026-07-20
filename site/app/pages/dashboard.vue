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

        <div v-if="!paid" style="margin-top:32px">
          <div class="lbl" style="color:var(--smoke);margin-bottom:16px">Choose a plan to get your API key</div>
          <div class="ppgrid">
            <div class="ppcard">
              <div class="pp-nm">Pro</div>
              <div class="pp-pr">$29<span>/mo</span></div>
              <ul>
                <li>Live routing verification vs FedACH</li>
                <li>Always-current NACHA rules</li>
                <li>10,000 validations / month</li>
              </ul>
              <button class="btn dark full" @click="openCheckout('pro')">Subscribe to Pro</button>
            </div>
            <div class="ppcard feat">
              <div class="pp-nm">Ultra</div>
              <div class="pp-pr">$99<span>/mo</span></div>
              <ul>
                <li>Everything in Pro</li>
                <li>Unlimited validations</li>
                <li>Return monitoring + webhooks</li>
              </ul>
              <button class="btn dark full" @click="openCheckout('ultra')">Subscribe to Ultra</button>
            </div>
          </div>
          <p class="mono" style="font-size:12px;color:var(--smoke);margin-top:14px">Secure checkout by Stripe, right here - no redirect. Cancel anytime; plan changes are prorated.</p>
        </div>

        <div v-else class="dcard" style="margin-top:20px">
          <div class="lbl" style="color:var(--smoke)">Billing - {{ user.plan.toUpperCase() }} plan</div>
          <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            <button v-if="user.plan === 'pro'" class="btn dark" @click="openCheckout('ultra')">Upgrade to Ultra (prorated)</button>
            <button v-if="user.plan === 'ultra'" class="btn ghost" @click="openCheckout('pro')">Switch to Pro (prorated)</button>
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
.ppgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 720px) { .ppgrid { grid-template-columns: 1fr; } }
.ppcard { background: var(--paper); border-radius: 24px; padding: 28px; display: flex; flex-direction: column; }
.ppcard.feat { background: #000; color: #fff; }
.pp-nm { font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--smoke); }
.pp-pr { font-family: var(--disp); font-size: 44px; letter-spacing: -.03em; margin: 12px 0 4px; }
.pp-pr span { font-family: var(--sans); font-size: 15px; font-weight: 500; color: var(--smoke); }
.ppcard ul { list-style: none; padding: 0; margin: 18px 0 24px; display: flex; flex-direction: column; gap: 9px; }
.ppcard li { font-size: 14px; color: var(--slate); }
.ppcard.feat li { color: var(--ash); }
.ppcard .full { width: 100%; justify-content: center; }
.ppcard.feat .btn.dark { background: var(--mint); color: #000; }
</style>
