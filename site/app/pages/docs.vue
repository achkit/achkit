<script setup lang="ts">
useSeoMeta({
  title: 'Docs - achkit',
  description: 'Install achkit, use the library locally, and call the hosted validation + routing API.',
})
defineOgImageComponent('Brand', { eyebrow: 'DOCS', title: 'achkit documentation', subtitle: 'Library + hosted API reference.' })
</script>

<template>
  <div>
    <SiteHeader />

    <section>
      <div class="wrap docs" style="max-width: 820px">
        <span class="lbl">// Documentation</span>
        <h1 class="disp" style="font-size: clamp(2.4rem,1.4rem+3vw,4rem); margin: 12px 0 10px">Ship ACH files with confidence</h1>
        <p style="color:var(--slate);font-size:18px;max-width:60ch">The library does generation, parsing and validation locally and free. The hosted API adds live routing verification against the FedACH directory.</p>

        <h2 id="install" class="disp">Install</h2>
        <div class="codewrap"><pre><span class="cm"># JavaScript / TypeScript</span>
npm i achkit

<span class="cm"># Python</span>
pip install achkit</pre></div>

        <h2 id="library" class="disp">Library - free, runs locally</h2>
        <p>Generate a balanced file, parse one back, or validate reconciliation before your ODFI sees it. Money is integer cents; dates are <span class="mono">YYYY-MM-DD</span>.</p>
        <div class="codewrap"><pre><span class="kw">import</span> { <span class="fn">AchFile</span>, <span class="fn">parse</span>, <span class="fn">validate</span> } <span class="kw">from</span> <span class="st">'achkit'</span>

<span class="kw">const</span> file = <span class="fn">AchFile</span>.<span class="fn">create</span>({ originDfi: <span class="st">'091000019'</span>, companyId: <span class="st">'1234567890'</span> })
file.<span class="fn">batch</span>({ sec: <span class="st">'PPD'</span>, description: <span class="st">'PAYROLL'</span>, effectiveDate: <span class="st">'2026-07-22'</span> })
    .<span class="fn">credit</span>({ name: <span class="st">'Jane Doe'</span>, routing: <span class="st">'011401533'</span>, account: <span class="st">'0072'</span>, amountCents: <span class="st">124050</span> })

<span class="kw">const</span> bytes = file.<span class="fn">render</span>()
<span class="kw">const</span> { ok, errors } = <span class="fn">validate</span>(bytes)</pre></div>

        <h2 id="api" class="disp">Hosted API</h2>
        <p>Base URL <span class="mono">https://achkit.com</span>. Authenticate with your API key (from the <NuxtLink to="/dashboard" style="text-decoration:underline">dashboard</NuxtLink>) in the <span class="mono">x-api-key</span> header. Create an account and subscribe to get a key.</p>

        <h3 class="ep">POST /api/validate <span class="badge free">free demo + keyed</span></h3>
        <p>Validate an ACH file. Without a key: reconciliation checks only (rate-limited). With a key: also cross-checks every entry's routing against the live FedACH directory and returns <span class="mono">routing[]</span>.</p>
        <div class="codewrap"><pre>curl -X POST https://achkit.com/api/validate \
  -H <span class="st">"x-api-key: ak_your_key"</span> \
  --data-binary @payroll.ach

<span class="cm">// { ok, errors, tier, routing: [{ routing, checksumValid, found, active, bank }] }</span></pre></div>

        <h3 class="ep">GET /api/routing/:number <span class="badge paid">paid</span></h3>
        <p>Verify a 9-digit routing number against the FedACH participant directory - is it a real, active ACH bank, and which one.</p>
        <div class="codewrap"><pre>curl https://achkit.com/api/routing/021000021 \
  -H <span class="st">"x-api-key: ak_your_key"</span>

<span class="cm">// { routing, checksumValid, found, active, bank: { name, city, state } }</span></pre></div>

        <h2 class="disp">Plans &amp; limits</h2>
        <ul class="plans">
          <li><b>Free library</b> - unlimited, local, MIT.</li>
          <li><b>Pro</b> - $29/mo, 10,000 validations/month, live routing verification.</li>
          <li><b>Ultra</b> - $99/mo, unlimited validations, return monitoring.</li>
        </ul>
        <p>Errors use standard HTTP status codes with a plain-text message. <span class="mono">401</span> = missing/invalid key, <span class="mono">429</span> = over your monthly limit.</p>

        <p style="margin-top:40px"><NuxtLink class="btn dark round" to="/signup">Create an account</NuxtLink></p>
      </div>
    </section>
    <SiteFooter />
  </div>
</template>

<style scoped>
.docs h2 { text-transform: uppercase; font-size: clamp(1.6rem,1.2rem+1.4vw,2.2rem); margin: 48px 0 14px; }
.docs h3.ep { font-family: var(--mono); font-size: 16px; margin: 32px 0 10px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.docs p { color: var(--slate); font-size: 16px; line-height: 1.55; max-width: 64ch; }
.docs .codewrap { margin: 16px 0 8px; }
.badge { font-family: var(--mono); font-size: 11px; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; letter-spacing: 0; }
.badge.free { background: var(--mist); color: var(--slate); }
.badge.paid { background: var(--mint); color: #0a5a2f; }
.plans { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.plans li { color: var(--slate); font-size: 16px; }
</style>
