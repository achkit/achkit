<script setup lang="ts">
useSeoMeta({ title: 'Privacy Policy - achkit', description: 'How achkit handles your data.' })
</script>

<template>
  <LegalShell title="Privacy Policy" updated="July 2026">
    <p>This policy explains what achkit collects and why. We keep it short because we collect little.</p>

    <h2>What we collect</h2>
    <ul>
      <li><b>Account data</b> - your email address and a hashed password (or Google account identifier if you sign in with Google).</li>
      <li><b>Usage data</b> - counts and metadata of your API calls (endpoint, timestamp, tier) for billing, limits and analytics. We do not retain the ACH file contents you send to the validation API - they are processed in memory and discarded.</li>
      <li><b>Billing data</b> - handled by Stripe. We store a Stripe customer identifier; we never see or store your card details.</li>
    </ul>

    <h2>How we use it</h2>
    <p>To provide the service, enforce plan limits, verify routing numbers, prevent abuse, and communicate about your account. We do not sell your data.</p>

    <h2>Third parties</h2>
    <p>Stripe (payments) and our own hosting infrastructure. The free library runs entirely on your machine and sends us nothing.</p>

    <h2>Retention &amp; your rights</h2>
    <p>We keep account and usage data while your account is active. Email <a href="mailto:hello@achkit.com">hello@achkit.com</a> to access, export or delete your data.</p>

    <h2>Contact</h2>
    <p>Questions: <a href="mailto:hello@achkit.com">hello@achkit.com</a>.</p>
  </LegalShell>
</template>
