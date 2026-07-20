<script setup lang="ts">
defineProps<{ title: string; updated?: string }>()
</script>

<template>
  <div>
    <SiteHeader />
    <section>
      <div class="wrap prose" style="max-width: 740px">
        <h1 class="disp" style="font-size: clamp(2.4rem,1.4rem+3vw,3.6rem); margin-bottom: 8px">{{ title }}</h1>
        <p v-if="updated" class="mono" style="color:var(--smoke);font-size:13px;margin:0 0 32px">Last updated {{ updated }}</p>
        <slot />
      </div>
    </section>
    <SiteFooter />
  </div>
</template>

<style scoped>
.prose :deep(h2) { font-family: var(--disp); text-transform: uppercase; font-size: 22px; letter-spacing: -.02em; margin: 36px 0 12px; }
.prose :deep(p), .prose :deep(li) { color: var(--slate); font-size: 16px; line-height: 1.6; }
.prose :deep(ul) { padding-left: 20px; }
.prose :deep(a) { text-decoration: underline; }
</style>
