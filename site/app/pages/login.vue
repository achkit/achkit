<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const route = useRoute()

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await refreshAuth()
    await navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not sign in.'
  } finally { loading.value = false }
}

useSeoMeta({ title: 'Sign in - achkit', robots: 'noindex' })
</script>

<template>
  <AuthShell eyebrow="Sign in" title="Welcome back">
    <form @submit.prevent="submit">
      <p class="msg err" v-if="error">{{ error }}</p>
      <p class="msg err" v-else-if="route.query.verify === 'expired'">That verification link expired. Sign up again to get a new one.</p>
      <div class="field"><label>Email</label><input v-model="email" type="email" autocomplete="email" required></div>
      <div class="field"><label>Password</label><input v-model="password" type="password" autocomplete="current-password" required></div>
      <button class="btn dark full" :disabled="loading" type="submit">{{ loading ? 'Signing in...' : 'Sign in' }}</button>
      <p style="font-size:14px;color:var(--slate);margin-top:18px"><a href="/api/auth/google" style="text-decoration:underline">Sign in with Google</a>. No account? <NuxtLink to="/signup" style="text-decoration:underline">Create one</NuxtLink>.</p>
    </form>
  </AuthShell>
</template>
