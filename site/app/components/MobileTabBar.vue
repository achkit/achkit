<script setup lang="ts">
const authUser = useAuth()
const route = useRoute()
const active = (p: string) => (p === '/' ? route.path === '/' : route.path.startsWith(p))
</script>

<template>
  <nav class="tabbar" aria-label="Primary">
    <NuxtLink to="/" class="tbi" :class="{ on: active('/') }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
      <span>Home</span>
    </NuxtLink>
    <NuxtLink to="/docs" class="tbi" :class="{ on: active('/docs') }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h9l5 5v11H5z" /><path d="M8 12h8M8 16h6" /></svg>
      <span>Docs</span>
    </NuxtLink>
    <NuxtLink to="/#pricing" class="tbi" :class="{ on: route.path === '/' && route.hash === '#pricing' }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7l9 9-7 7-9-9z" /><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" /></svg>
      <span>Pricing</span>
    </NuxtLink>
    <a href="https://github.com/achkit/achkit" class="tbi">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>
      <span>GitHub</span>
    </a>
    <NuxtLink :to="authUser ? '/dashboard' : '/login'" class="tbi" :class="{ on: active('/dashboard') || active('/login') }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.8-3.3 3.3-5 7-5s6.2 1.7 7 5" /></svg>
      <span>{{ authUser ? 'Account' : 'Login' }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.tabbar {
  display: none;
  /* Override the global `nav` rule (sticky/top:0/height:8rem) which would
     otherwise pin this bar to the top of the page. */
  position: fixed; left: 0; right: 0; top: auto; bottom: 0; height: auto; z-index: 60;
  background: rgba(255, 255, 255, .92);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-top: 1px solid #e0e0e0;
  padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
  grid-template-columns: repeat(5, 1fr);
}
.tbi {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 4px 0; color: var(--smoke);
  font-family: var(--mono); font-size: 10px; letter-spacing: -.02em; text-transform: uppercase;
}
.tbi svg { width: 22px; height: 22px; }
.tbi.on { color: #000; }
@media (max-width: 768px) { .tabbar { display: grid; } }
</style>
