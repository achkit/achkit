<script setup lang="ts">
const authUser = useAuth()
onMounted(refreshAuth)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  authUser.value = null
  await navigateTo('/')
}
</script>

<template>
  <nav>
    <div class="pill">
      <NuxtLink class="brand" to="/">
        <svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="2.4"><rect x="3" y="6" width="26" height="20" rx="2" /><path d="M3 12h26" /><path d="M8 18h6M8 22h10" stroke-width="1.8" /></svg>achkit
      </NuxtLink>
      <div class="links">
        <NuxtLink to="/docs">Docs</NuxtLink>
        <NuxtLink to="/#pricing">Pricing</NuxtLink>
        <a href="https://github.com/achkit/achkit">GitHub</a>
        <template v-if="authUser">
          <NuxtLink to="/dashboard">Dashboard</NuxtLink>
          <button class="btn dark round" style="cursor:pointer" @click="logout">Sign out</button>
        </template>
        <template v-else>
          <NuxtLink to="/login">Sign in</NuxtLink>
          <NuxtLink class="btn dark round" to="/docs">Get the packages</NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>
