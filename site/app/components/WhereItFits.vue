<script setup lang="ts">
const rows = [
  { name: 'Stripe / PayPal', how: 'Push a button, they pull the money', cost: '~0.8% per payment (capped ~$5)', catch: 'A cut of every transaction, forever' },
  { name: 'Modern Treasury / Dwolla', how: 'They build + send the files for you', cost: 'Thousands / mo + per-transaction', catch: 'Enterprise tollbooth pricing' },
  { name: 'Moov (moov-io/ach)', how: 'Free library you run yourself', cost: 'Free', catch: 'Go only - a separate server to use from Python/JS' },
  { name: 'Old OSS (node-nacha, pynacha…)', how: 'Free, aging libraries', cost: 'Free', catch: 'Unmaintained - breaks when NACHA changes rules' },
  { name: 'achkit', how: 'Free JS/Python lib builds the file; API checks the bank is real', cost: 'Free lib + $29-99 / mo', catch: 'You keep ~100% of your money', hot: true },
]
</script>

<template>
  <section id="fit">
    <div class="wrap">
      <div class="why-ach">
        <span class="lbl">// Why ACH exists</span>
        <p>Every time you pay by credit card, <b>Visa and Mastercard take a cut</b>. That toll is unavoidable and expensive - so the old, slow, bank-to-bank <b>ACH rails</b> are the only other way to move money without paying a percentage tax on every dollar. The catch: ACH's rules are ancient and brutal. That's why developers reach for a free tool like achkit - to navigate them without ripping their hair out.</p>
      </div>

      <div class="inv fit-quote">
        <div class="wrap">
          <span class="lbl" style="color:var(--smoke)">// Where achkit fits</span>
          <h2 class="disp">The Goldilocks option</h2>
          <p>You refuse to hand Stripe a slice of every dollar, and you won't pay Modern Treasury thousands a month. You want to build the banking files yourself and keep <b>100% of your money</b> - with a modern, free tool so your developers never fumble the math, and a cheap check that the bank accounts they type in are actually real.</p>
        </div>
      </div>

      <div class="sec-head" style="margin:64px 0 28px">
        <span class="lbl">// The alternatives</span>
        <h2 class="disp">What you're really choosing between</h2>
      </div>

      <div class="ctable-wrap">
        <table class="ctable">
          <thead>
            <tr><th>Option</th><th>How it moves money</th><th>What it costs you</th><th>The catch</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.name" :class="{ hot: r.hot }">
              <td class="nm">{{ r.name }}</td>
              <td>{{ r.how }}</td>
              <td class="cost">{{ r.cost }}</td>
              <td>{{ r.catch }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="save">
        <div class="save-k lbl">// What that saves you</div>
        <p class="save-p">Say you send <b>1,000 ACH payments of $200</b> a month. Stripe's ~0.8% fee is about <b>$1,600/mo</b>. The same file handed straight to your bank costs pennies each - roughly <b>$30/mo</b>. achkit is <b>free</b> for the library and <b>$29-99</b> for live bank verification. You keep the difference.</p>
        <p class="save-note mono">Illustrative - your bank's per-file ACH rate and Stripe's pricing vary. The point stands: owning the file beats renting a percentage.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.why-ach { max-width: 74ch; margin: 0 0 44px; }
.why-ach p { font-size: clamp(20px, 1rem + 1vw, 27px); line-height: 1.45; color: #000; margin: 14px 0 0; letter-spacing: -.01em; }
.why-ach b { background: linear-gradient(transparent 62%, var(--mint) 62%); }
.fit-quote .wrap { padding: 64px 40px; }
.fit-quote h2 { color: #fff; margin: 12px 0 0; }
.fit-quote p { color: var(--ash); font-size: clamp(18px, 1rem + .8vw, 23px); line-height: 1.5; max-width: 52ch; margin: 20px 0 0; }
.fit-quote p b { color: var(--mint); }

.ctable-wrap { overflow-x: auto; border-radius: 20px; }
.ctable { width: 100%; border-collapse: collapse; min-width: 720px; background: var(--paper); border-radius: 20px; overflow: hidden; }
.ctable th { text-align: left; font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--smoke); padding: 18px 20px; border-bottom: 2px solid var(--canvas); }
.ctable td { padding: 18px 20px; font-size: 15px; color: var(--slate); border-bottom: 1px solid var(--canvas); vertical-align: top; }
.ctable td.nm { font-weight: 600; color: #000; }
.ctable td.cost { font-family: var(--mono); font-size: 13px; color: #000; }
.ctable tr.hot td { background: var(--mint); border-bottom-color: #bff0b3; }
.ctable tr.hot td.nm, .ctable tr.hot td.cost { color: #0a3d1e; }
.ctable tr:last-child td { border-bottom: none; }

.save { margin-top: 28px; background: #000; color: #fff; border-radius: 24px; padding: 34px 36px; }
.save-k { color: var(--smoke); }
.save-p { font-size: clamp(17px, 1rem + .6vw, 21px); line-height: 1.5; margin: 14px 0 0; color: #fff; }
.save-p b { color: var(--mint); }
.save-note { font-size: 12px; color: var(--smoke); margin: 16px 0 0; }
</style>
