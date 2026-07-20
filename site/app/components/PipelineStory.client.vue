<script setup lang="ts">
// Self-explaining, looping story of what achkit does - for a visitor with zero
// tech or finance background. Auto-advances; hover to pause; click a dot to jump.
const steps = [
  { k: 'intent', tag: 'You', cap: 'You want to pay Jane $100 by direct deposit. Simple - you just say who and how much.' },
  { k: 'format', tag: 'achkit', cap: 'Banks demand an ancient file where every line is exactly 94 characters, padded with the right blanks and weird math at the bottom. achkit builds it perfectly for you.' },
  { k: 'free', tag: 'Free library', cap: 'The free library guarantees the file is flawless so the bank’s computers accept it. It runs on your machine, free forever.' },
  { k: 'blind', tag: 'The catch', cap: 'But the free library is blind to the real world. A typo’d routing number still looks perfect - so the file ships, and three days later the payment bounces.' },
  { k: 'paid', tag: 'Pro / Ultra', cap: 'The paid API asks the Federal Reserve’s live database first: is this a real, open bank? Only then does the money go out - so it never vanishes into nowhere.' },
]

const i = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const paused = ref(false)

function start() {
  stop()
  timer = setInterval(() => { if (!paused.value) i.value = (i.value + 1) % steps.length }, 4200)
}
function stop() { if (timer) clearInterval(timer); timer = null }

onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <div class="story" @mouseenter="paused = true" @mouseleave="paused = false">
    <div class="stage">
      <!-- 1: intent -->
      <div class="scene" :class="{ on: i === 0 }">
        <div class="intent-card">
          <div class="ic-row"><span class="ic-k">Pay</span><span class="ic-v">Jane Doe</span></div>
          <div class="ic-row"><span class="ic-k">Amount</span><span class="ic-v">$100.00</span></div>
          <div class="ic-row"><span class="ic-k">Account</span><span class="ic-v">****0072</span></div>
        </div>
      </div>

      <!-- 2: format -->
      <div class="scene" :class="{ on: i === 1 }">
        <div class="rec">
          <span class="fld g">6</span><span class="fld">22</span><span class="fld y">011401533</span><span class="fld">JANE DOE</span><span class="pad">&middot;&middot;&middot;&middot;&middot;&middot;&middot;&middot;</span><span class="fld g">0000010000</span>
        </div>
        <div class="ruler"><span>1</span><span>exactly 94 characters</span><span>94</span></div>
      </div>

      <!-- 3: free ok -->
      <div class="scene" :class="{ on: i === 2 }">
        <div class="rec dim">6220114015 33JANE DOE&middot;&middot;&middot;&middot;0000010000</div>
        <div class="stamp ok">Format perfect</div>
      </div>

      <!-- 4: blind bounce -->
      <div class="scene" :class="{ on: i === 3 }">
        <div class="rec"><span class="fld">6 22 </span><span class="fld bad">021000021?</span><span class="fld"> JANE DOE 0000010000</span></div>
        <div class="stamp bad">Returned - bank not found</div>
      </div>

      <!-- 5: paid live check -->
      <div class="scene" :class="{ on: i === 4 }">
        <div class="fed">
          <div class="fed-q">achkit &rarr; Federal Reserve: is <b>011401533</b> a real, open bank?</div>
          <div class="fed-a">Key Bank &middot; Albany, NY &middot; <span class="ok-txt">active</span></div>
          <div class="stamp ok">Money delivered</div>
        </div>
      </div>
    </div>

    <div class="cap">
      <span class="tag">{{ steps[i].tag }}</span>
      <p>{{ steps[i].cap }}</p>
    </div>

    <div class="dots">
      <button v-for="(s, n) in steps" :key="s.k" class="dot" :class="{ on: n === i }" :aria-label="s.tag" @click="i = n" />
    </div>
  </div>
</template>

<style scoped>
.story { background: var(--paper); border-radius: 32px; padding: 40px 32px 28px; }
.stage { display: flex; align-items: center; justify-content: center; min-height: 220px; overflow: hidden; }
.scene { display: none; flex-direction: column; align-items: center; justify-content: center; gap: 16px; width: 100%; }
.scene.on { display: flex; animation: sceneIn .5s ease; }
@keyframes sceneIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

.intent-card { background: var(--canvas); border-radius: 18px; padding: 22px 28px; min-width: 300px; }
.ic-row { display: flex; justify-content: space-between; gap: 24px; padding: 7px 0; font-family: var(--mono); font-size: 15px; }
.ic-k { color: var(--smoke); text-transform: uppercase; font-size: 12px; letter-spacing: .06em; }

.rec { font-family: var(--mono); font-size: clamp(13px, 1.1vw, 16px); background: #0f1626; color: #cfd6e6; padding: 16px 20px; border-radius: 12px; letter-spacing: .04em; white-space: nowrap; overflow-x: auto; max-width: 100%; }
.rec.dim { color: #8b93a6; }
.fld { color: #e8edf7; }
.fld.g { color: var(--mint); } .fld.y { color: var(--volt); } .fld.bad { color: #ff6a6a; background: rgba(255,60,60,.16); border-radius: 3px; padding: 0 3px; }
.pad { color: #47506a; }
.ruler { display: flex; justify-content: space-between; width: min(460px, 90%); font-family: var(--mono); font-size: 11px; color: var(--smoke); text-transform: uppercase; letter-spacing: .08em; }
.ruler span:nth-child(2) { color: var(--slate); }

.stamp { font-family: var(--disp); text-transform: uppercase; font-size: 22px; letter-spacing: -.02em; padding: 8px 18px; border-radius: 10px; }
.stamp.ok { background: var(--mint); color: #0a5a2f; }
.stamp.bad { background: #ffe1e1; color: #c0392b; }

.fed { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.fed-q { font-family: var(--mono); font-size: 14px; color: var(--slate); text-align: center; }
.fed-a { font-family: var(--mono); font-size: 14px; color: #000; }
.ok-txt { color: #0a7a45; font-weight: 700; }

.cap { max-width: 60ch; margin: 26px auto 0; text-align: center; min-height: 74px; }
.cap .tag { display: inline-block; background: #000; color: #fff; font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; }
.cap p { color: var(--slate); font-size: 17px; line-height: 1.5; margin: 0; }

.dots { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
.dot { width: 32px; height: 6px; border-radius: 999px; border: none; background: var(--ash); cursor: pointer; padding: 0; transition: .3s; }
.dot.on { background: #000; width: 46px; }
@media (prefers-reduced-motion: reduce) { .scene { transition: none; } }
</style>
