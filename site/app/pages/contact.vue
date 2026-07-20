<script setup lang="ts">
const email = ref('')
const message = ref('')
const loading = ref(false)
const done = ref(false)
const error = ref('')

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/contact', { method: 'POST', body: { email: email.value, message: message.value } })
    done.value = true
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not send. Email hello@achkit.com directly.'
  } finally { loading.value = false }
}

useSeoMeta({ title: 'Contact - achkit', description: 'Get in touch with the achkit team.' })
</script>

<template>
  <LegalShell title="Contact">
    <p>Questions about the library, the API, billing, or anything else - send a note and we will reply by email.</p>
    <div v-if="done" class="msg-ok mono">Thanks - we got your message and will reply to {{ email }}.</div>
    <form v-else @submit.prevent="submit" style="margin-top:20px;max-width:520px">
      <p v-if="error" class="msg-err mono">{{ error }}</p>
      <div class="cfield"><label>Your email</label><input v-model="email" type="email" required></div>
      <div class="cfield"><label>Message</label><textarea v-model="message" rows="5" required /></div>
      <button class="btn dark" :disabled="loading" type="submit">{{ loading ? 'Sending...' : 'Send message' }}</button>
    </form>
    <p style="margin-top:24px">Or email <a href="mailto:hello@achkit.com">hello@achkit.com</a>.</p>
  </LegalShell>
</template>

<style scoped>
.cfield { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
.cfield label { font-family: var(--mono); font-size: 12px; text-transform: uppercase; color: var(--slate); }
.cfield input, .cfield textarea { font-family: var(--mono); font-size: 15px; padding: 13px 15px; border: 1.5px solid var(--ash); border-radius: 10px; background: #fff; resize: vertical; }
.cfield input:focus, .cfield textarea:focus { outline: none; border-color: #000; }
.msg-ok { background: var(--mint); color: #0a5a2f; padding: 14px 16px; border-radius: 10px; font-size: 14px; margin-top: 20px; }
.msg-err { background: #ffe9e9; color: #c0392b; padding: 12px 15px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; }
</style>
