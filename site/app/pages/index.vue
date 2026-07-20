<script setup lang="ts">
const tab = ref<'gen' | 'parse' | 'valid'>('gen')

function copy(text: string) {
  if (import.meta.client && navigator.clipboard) navigator.clipboard.writeText(text)
}

useSeoMeta({
  title: 'achkit - the ACH file toolkit for developers',
  description:
    'Generate, parse and validate NACHA ACH files in a few lines. Fully typed, zero dependencies, returns and NOC handled. JavaScript and Python, byte-identical.',
  ogTitle: 'achkit - the ACH file toolkit for developers',
  ogDescription:
    'Generate, parse and validate NACHA ACH files in a few lines. JavaScript (npm) and Python (PyPI), byte-identical. Typed, zero-dependency, MIT.',
  ogType: 'website',
  ogUrl: 'https://achkit.com',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <nav>
      <div class="pill">
        <NuxtLink class="brand" to="/">
          <svg viewBox="0 0 32 32" fill="none" stroke="#000" stroke-width="2.4"><rect x="3" y="6" width="26" height="20" rx="2" /><path d="M3 12h26" /><path d="M8 18h6M8 22h10" stroke-width="1.8" /></svg>achkit
        </NuxtLink>
        <div class="links">
          <a href="#problem">Why</a>
          <a href="#usage">Docs</a>
          <a href="#pricing">Pricing</a>
          <a href="https://github.com/achkit/achkit">GitHub</a>
          <a class="btn dark" href="#usage">Get the packages</a>
        </div>
      </div>
    </nav>

    <header class="hero">
      <div class="wrap grid">
        <div>
          <span class="lbl">// NACHA - ACH toolkit</span>
          <h1 class="disp">Move money<br>files. Without<br>counting bytes.</h1>
          <p class="sub">Generate, parse and validate NACHA ACH files in a few lines. Fully typed. Zero dependencies. Returns and NOC handled for you - in JavaScript and Python.</p>
          <div class="installs">
            <span class="inst"><span class="p">$</span> npm i achkit <button class="cp" @click="copy('npm i achkit')">copy</button></span>
            <span class="inst"><span class="p">$</span> pip install achkit <button class="cp" @click="copy('pip install achkit')">copy</button></span>
          </div>
          <div class="cta">
            <a class="btn dark" href="#usage">Read the docs</a>
            <a class="btn ghost" href="#pricing">Validation API</a>
          </div>
        </div>

        <div class="scene" aria-hidden="true">
          <div class="contact" />
          <div class="totem">
            <div class="cube p-core">
              <div class="face fr dark2"><span class="l">ACH</span></div>
              <div class="face bk con" /><div class="face rt wood" /><div class="face lt con" />
              <div class="face tp mint2" /><div class="face bt con" />
            </div>
            <div class="cube p-rt">
              <div class="face fr con" /><div class="face bk con" />
              <div class="face rt orange"><span class="l">NACHA</span></div>
              <div class="face lt wood" /><div class="face tp con" /><div class="face bt con" />
            </div>
            <div class="cube p-tp">
              <div class="face fr con"><span class="l">v0</span></div>
              <div class="face bk con" /><div class="face rt con" /><div class="face lt con" />
              <div class="face tp yellow2"><span class="l">94</span></div>
              <div class="face bt con" />
            </div>
            <div class="cube p-fr">
              <div class="face fr pink"><span class="l">npm</span></div>
              <div class="face bk con" /><div class="face rt con" /><div class="face lt con" />
              <div class="face tp wood" /><div class="face bt con" />
            </div>
            <div class="cube p-lb">
              <div class="face fr con" /><div class="face bk con" /><div class="face rt con" />
              <div class="face lt purple"><span class="l">PyPI</span></div>
              <div class="face tp con" /><div class="face bt con" />
            </div>
            <div class="cube p-bf">
              <div class="face fr cyan"><span class="l">PPD</span></div>
              <div class="face bk con" /><div class="face rt con" /><div class="face lt con" />
              <div class="face tp con" /><div class="face bt wood" />
            </div>
          </div>
        </div>
      </div>
    </header>

    <section id="problem">
      <div class="wrap">
        <div class="inv">
          <div class="wrap">
            <span class="lbl" style="color: var(--smoke)">// The problem</span>
            <h2 class="disp" style="font-size: clamp(2.4rem, 1.4rem + 3.4vw, 4rem)">ACH files are a fixed-width minefield</h2>
            <div class="plist">
              <div class="pcard"><div class="n">01 / today</div><h3>Hand-roll it</h3><p>String padding, manual field offsets, and the NACHA spec open in another tab. Fragile and untested.</p></div>
              <div class="pcard"><div class="n">02 / or</div><h3>Rent an API</h3><p>Full payment platforms hide ACH away - but you pay per transaction and hand them your whole money flow for a file-format problem.</p></div>
              <div class="pcard hot"><div class="n">03 / achkit</div><h3>Import a library</h3><p>A typed builder, a strict parser, and a validator that catches every reconciliation error before the file leaves your box.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="usage">
      <div class="wrap">
        <div class="sec-head">
          <span class="lbl">// Three calls</span>
          <h2 class="disp">Build it, read it, prove it</h2>
          <p>The same typed model powers generation, parsing and validation across both languages. No config, no runtime deps.</p>
        </div>
        <div class="tabs">
          <button class="tab" :class="{ on: tab === 'gen' }" @click="tab = 'gen'">generate</button>
          <button class="tab" :class="{ on: tab === 'parse' }" @click="tab = 'parse'">parse</button>
          <button class="tab" :class="{ on: tab === 'valid' }" @click="tab = 'valid'">validate</button>
        </div>
        <div class="codewrap">
          <pre v-show="tab === 'gen'"><span class="kw">import</span> { <span class="fn">AchFile</span> } <span class="kw">from</span> <span class="st">'achkit'</span>

<span class="kw">const</span> file = <span class="fn">AchFile</span>.<span class="fn">create</span>({ originDfi: <span class="st">'091000019'</span>, companyId: <span class="st">'1234567890'</span> })

file.<span class="fn">batch</span>({ sec: <span class="st">'PPD'</span>, description: <span class="st">'PAYROLL'</span>, effectiveDate: <span class="st">'2026-07-22'</span> })
    .<span class="fn">credit</span>({ name: <span class="st">'Jane Doe'</span>, routing: <span class="st">'011401533'</span>, account: <span class="st">'0072'</span>, amountCents: <span class="st">124050</span> })
    .<span class="fn">debit</span>({ name: <span class="st">'ACME LLC'</span>,  routing: <span class="st">'091000019'</span>, account: <span class="st">'1899'</span>, amountCents: <span class="st">124050</span> })

<span class="kw">const</span> bytes = file.<span class="fn">render</span>()  <span class="cm">// balanced batch, hash totals + block padding done</span></pre>
          <pre v-show="tab === 'parse'"><span class="kw">from</span> achkit <span class="kw">import</span> parse

ach = <span class="fn">parse</span>(open(<span class="st">'incoming.ach'</span>).read())

<span class="kw">for</span> batch <span class="kw">in</span> ach[<span class="st">'batches'</span>]:
    <span class="kw">for</span> e <span class="kw">in</span> batch[<span class="st">'entries'</span>]:
        <span class="fn">print</span>(e[<span class="st">'sec'</span>], e[<span class="st">'amount_cents'</span>], e[<span class="st">'trace_number'</span>])
<span class="cm"># every field typed - no positional string slicing in your code</span></pre>
          <pre v-show="tab === 'valid'"><span class="kw">import</span> { <span class="fn">validate</span> } <span class="kw">from</span> <span class="st">'achkit'</span>

<span class="kw">const</span> { ok, errors } = <span class="fn">validate</span>(bytes)

<span class="kw">if</span> (!ok) errors.<span class="fn">forEach</span>(e =&gt; console.<span class="fn">error</span>(e.code, e.field, e.message))
<span class="cm">// R01 insufficient funds, entry-hash mismatch, bad routing checksum,</span>
<span class="cm">// unbalanced batch, block-count drift - caught before your ODFI sees it</span></pre>
        </div>
      </div>
    </section>

    <section style="border-top: 1px solid var(--ash)">
      <div class="wrap">
        <div class="sec-head">
          <span class="lbl">// What's inside</span>
          <h2 class="disp">The whole ACH lifecycle, typed</h2>
        </div>
        <div class="fgrid">
          <div class="fcard"><div class="top"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h10" /></svg><span class="num">01</span></div><h3>Generate &amp; parse</h3><p>Round-trip any NACHA file. Builder pads and balances; parser hands you typed records with no positional slicing.</p></div>
          <div class="fcard"><div class="top"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" /><path d="M9 12l2 2 4-4" /></svg><span class="num">02</span></div><h3>Returns &amp; NOC</h3><p>Decode R-codes and C-codes, map returns to the original entry, and generate corrected re-submissions.</p></div>
          <div class="fcard"><div class="top"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" stroke-width="1.3" /></svg><span class="num">03</span></div><h3>Every SEC code</h3><p>PPD, CCD, WEB, TEL, CTX and addenda - validated against the current NACHA rules.</p></div>
          <div class="fcard"><div class="top"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6L9 17l-5-5" /></svg><span class="num">04</span></div><h3>Reconciliation-safe</h3><p>Entry hash, batch and file control totals, and blocking factor computed for you - the errors an ODFI rejects on, caught first.</p></div>
        </div>
      </div>
    </section>

    <section id="pricing">
      <div class="wrap">
        <div class="sec-head">
          <span class="lbl">// Pricing</span>
          <h2 class="disp">The library is free. Scale on the API</h2>
          <p>Everything you need to ship runs locally and free forever. Pay only for hosted validation, monitoring, and rule updates pushed to you.</p>
        </div>
        <div class="prow">
          <div class="plan">
            <span class="nm">Library</span>
            <div class="pr">$0<small> / forever</small></div>
            <ul>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>Generate, parse, validate - MIT</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>All SEC codes + returns/NOC</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>npm and PyPI, byte-identical</li>
            </ul>
            <a class="btn dark" href="#usage">Install it</a>
          </div>
          <div class="plan dark">
            <span class="nm">Pro API</span>
            <div class="pr">$29<small> / mo</small></div>
            <ul>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>Hosted validation endpoint</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>Routing-number + ABA checks</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>Rule updates pushed automatically</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>10k files / mo</li>
            </ul>
            <a class="btn dark" href="#usage">Start free trial</a>
          </div>
          <div class="plan">
            <span class="nm">Scale</span>
            <div class="pr">$99<small> / mo</small></div>
            <ul>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>Unlimited validation</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>Return-file monitoring + webhooks</li>
              <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5" /></svg>SLA + priority support</li>
            </ul>
            <a class="btn ghost" href="#usage">Talk to us</a>
          </div>
        </div>
      </div>
    </section>

    <footer>
      <div class="wrap">
        <div class="cols">
          <div class="col" style="max-width: 250px">
            <NuxtLink class="brand" to="/" style="margin-bottom: 14px; display: flex">
              <svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.4"><rect x="3" y="6" width="26" height="20" rx="2" /><path d="M3 12h26" /><path d="M8 18h6M8 22h10" stroke-width="1.8" /></svg>achkit
            </NuxtLink>
            <p style="font-size: 15px; color: var(--smoke); margin: 0 0 16px">The ACH file toolkit for developers. Ship NACHA files with confidence.</p>
            <p class="mailrow">hello <a href="mailto:hello@achkit.com">hello@achkit.com</a></p>
          </div>
          <div class="col"><h4>Product</h4><a href="#usage">Docs</a><a href="#pricing">Pricing</a><a href="https://github.com/achkit/achkit/releases">Changelog</a></div>
          <div class="col"><h4>Developers</h4><a href="https://github.com/achkit/achkit">GitHub</a><a href="https://www.npmjs.com/package/achkit">npm</a><a href="https://pypi.org/project/achkit/">PyPI</a><a href="/llms.txt">llms.txt</a></div>
          <div class="col"><h4>Company</h4><a href="mailto:hello@achkit.com">Contact</a></div>
        </div>
        <div class="base">
          <span>(c) 2026 achkit</span>
          <span>Not affiliated with Nacha. ACH is a US payment network.</span>
        </div>
      </div>
    </footer>
  </div>
</template>
