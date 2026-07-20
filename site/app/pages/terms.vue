<script setup lang="ts">
useSeoMeta({ title: 'Terms of Service - achkit', description: 'The terms for using achkit.' })
</script>

<template>
  <LegalShell title="Terms of Service" updated="July 2026">
    <p>By using achkit - the library or the hosted API - you agree to these terms.</p>

    <h2>The service</h2>
    <p>achkit provides an open-source library for generating, parsing and validating NACHA ACH files, and a hosted API that adds live routing-number verification and related features. The library is MIT licensed. The hosted API is provided on the plan you select.</p>

    <h2>Accounts &amp; billing</h2>
    <ul>
      <li>You must create an account with a valid email before subscribing to a paid plan.</li>
      <li>Paid plans are billed monthly via Stripe. Plan changes are prorated. You can cancel any time; access continues to the end of the paid period.</li>
      <li>Do not share API keys or exceed your plan limits programmatically.</li>
    </ul>

    <h2>Acceptable use</h2>
    <p>Do not use achkit to commit fraud, launder money, or violate NACHA rules or applicable law. We may suspend accounts for abuse.</p>

    <h2>No warranty; not financial advice</h2>
    <p>achkit is a developer tool, provided "as is" without warranty. Routing verification reflects the Federal Reserve directory but you remain responsible for your own ACH originations, reconciliation and compliance. achkit is not affiliated with Nacha or the Federal Reserve.</p>

    <h2>Limitation of liability</h2>
    <p>To the maximum extent permitted by law, achkit's liability is limited to the amount you paid in the prior three months.</p>

    <h2>Contact</h2>
    <p><a href="mailto:hello@achkit.com">hello@achkit.com</a>.</p>
  </LegalShell>
</template>
