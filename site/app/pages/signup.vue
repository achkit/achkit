<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const done = ref(false)

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/auth/signup', { method: 'POST', body: { email: email.value, password: password.value } })
    done.value = true
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not create your account.'
  } finally { loading.value = false }
}

useSeoMeta({ title: 'Create your achkit account', robots: 'noindex' })
</script>

<template>
  <AuthShell eyebrow="Create account" title="Start with achkit">
    <div v-if="done" class="msg ok">Check your inbox - we sent a verification link to {{ email }}. Click it to finish and sign in.</div>
    <form v-else @submit.prevent="submit">
      <p class="msg err" v-if="error">{{ error }}</p>
      <div class="field"><label>Work email</label><input v-model="email" type="email" autocomplete="email" placeholder="you@company.com" required></div>
      <div class="field"><label>Password</label><input v-model="password" type="password" autocomplete="new-password" placeholder="At least 8 characters" required></div>
      <button class="btn dark full" :disabled="loading" type="submit">{{ loading ? 'Creating...' : 'Create account' }}</button>
      <div class="or">or</div>
      <GoogleButton>Continue with Google</GoogleButton>
      <p style="font-size:14px;color:var(--slate);margin-top:18px">Already have an account? <NuxtLink to="/login" style="text-decoration:underline">Sign in</NuxtLink>.</p>
    </form>
  </AuthShell>
</template>
