<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string }>()
</script>

<template>
  <div>
    <SiteHeader />
    <section>
      <div class="wrap" style="max-width: 460px">
        <span v-if="eyebrow" class="lbl">// {{ eyebrow }}</span>
        <h1 class="disp" style="font-size: clamp(2.4rem, 1.4rem + 3vw, 3.6rem); margin: 12px 0 28px">{{ title }}</h1>
        <slot />
      </div>
    </section>
    <SiteFooter />
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
:deep(.or) { display: flex; align-items: center; gap: 14px; margin: 20px 0; color: var(--smoke); font-family: var(--mono); font-size: 12px; text-transform: uppercase; }
:deep(.or)::before, :deep(.or)::after { content: ""; flex: 1; height: 1.5px; background: var(--ash); }
:deep(.gbtn) { display: flex; width: 100%; align-items: center; justify-content: center; gap: 12px; background: var(--paper); border: 1.5px solid var(--ash); border-radius: 10px; padding: 14px 24px; font-family: var(--sans); font-weight: 500; font-size: 16px; cursor: pointer; transition: .15s; color: #000; }
:deep(.gbtn:hover) { border-color: #000; }
:deep(.gbtn svg) { width: 20px; height: 20px; }
</style>
