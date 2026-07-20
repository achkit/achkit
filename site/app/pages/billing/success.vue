<script setup lang="ts">
const route = useRoute()
const sessionId = computed(() => String(route.query.session_id || ''))
const apiKey = ref('')
const pending = ref(true)
let tries = 0

async function poll() {
  if (!sessionId.value) { pending.value = false; return }
  try {
    const r = await $fetch<{ key: string | null; status: string }>('/api/billing/session-key', { query: { session_id: sessionId.value } })
    if (r.key) { apiKey.value = r.key; pending.value = false; return }
  } catch {}
  if (++tries < 20) setTimeout(poll, 1500)
  else pending.value = false
}

function copy() {
  if (import.meta.client && navigator.clipboard) navigator.clipboard.writeText(apiKey.value)
}

onMounted(poll)
useSeoMeta({ title: 'You are in - achkit', robots: 'noindex' })
</script>

<template>
  <div>
    <nav>
      <div class="pill">
        <NuxtLink class="brand" to="/">
          <svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="2.4"><rect x="3" y="6" width="26" height="20" rx="2" /><path d="M3 12h26" /><path d="M8 18h6M8 22h10" stroke-width="1.8" /></svg>achkit
        </NuxtLink>
        <div class="links"><NuxtLink class="btn dark" to="/">Back to site</NuxtLink></div>
      </div>
    </nav>

    <section>
      <div class="wrap" style="max-width: 760px">
        <span class="lbl">// You're in</span>
        <h1 class="disp" style="font-size: clamp(2.6rem, 1.4rem + 4vw, 4.4rem); margin: 14px 0 0">Subscription active. Here's your API key.</h1>
        <p class="sec-head" style="margin: 20px 0 32px; color: var(--slate); font-size: 18px">Send it as the <span class="mono">x-api-key</span> header to the hosted validation API. Store it somewhere safe - treat it like a password.</p>

        <div v-if="pending" class="keybox mono">Provisioning your key...</div>
        <div v-else-if="apiKey" class="keybox">
          <code class="mono">{{ apiKey }}</code>
          <button class="btn dark" @click="copy">Copy</button>
        </div>
        <div v-else class="keybox mono">Your key is being set up - it will arrive at your email shortly. Questions: hello@achkit.com</div>

        <div class="codewrap" style="margin-top: 28px">
          <pre><span class="cm"># validate an ACH file against the hosted API</span>
curl -X POST https://achkit.com/api/validate \
  -H <span class="st">"x-api-key: {{ apiKey || 'ak_your_key' }}"</span> \
  --data-binary @payroll.ach</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.keybox { background: var(--paper); border-radius: 16px; padding: 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.keybox code { font-size: 15px; word-break: break-all; color: #000; }
</style>
