<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string }>()
</script>

<template>
  <div>
    <nav>
      <div class="pill">
        <NuxtLink class="brand" to="/">
          <svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="2.4"><rect x="3" y="6" width="26" height="20" rx="2" /><path d="M3 12h26" /><path d="M8 18h6M8 22h10" stroke-width="1.8" /></svg>achkit
        </NuxtLink>
        <div class="links"><NuxtLink class="btn dark round" to="/">Back to site</NuxtLink></div>
      </div>
    </nav>
    <section>
      <div class="wrap" style="max-width: 460px">
        <span v-if="eyebrow" class="lbl">// {{ eyebrow }}</span>
        <h1 class="disp" style="font-size: clamp(2.4rem, 1.4rem + 3vw, 3.6rem); margin: 12px 0 28px">{{ title }}</h1>
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.field) { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
:deep(.field label) { font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: -.02em; color: var(--slate); }
:deep(.field input) { font-family: var(--mono); font-size: 15px; padding: 14px 16px; border: 1.5px solid var(--ash); border-radius: 10px; background: var(--paper); }
:deep(.field input:focus) { outline: none; border-color: #000; }
:deep(.msg) { font-family: var(--mono); font-size: 13px; padding: 14px 16px; border-radius: 10px; margin-bottom: 18px; }
:deep(.msg.err) { background: #ffe9e9; color: #c0392b; }
:deep(.msg.ok) { background: var(--mint); color: #0a5a2f; }
:deep(.full) { width: 100%; justify-content: center; }
</style>
