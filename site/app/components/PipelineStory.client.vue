<script setup lang="ts">
// One continuous pipeline. The whole story is visible at once; a flowing pulse
// draws the eye left-to-right. No steps, no waiting - digestible in ~2 seconds.
const nodes = [
  { label: 'You: “pay Jane $100”', sub: 'plain instruction' },
  { label: 'achkit builds the exact 94-char bank file', sub: 'every space + the math, perfect' },
  { label: 'Live check: is this a real, open bank?', sub: 'asks the Fed’s database' },
  { label: 'Money delivered', sub: 'not into a dead account', hot: true },
]
</script>

<template>
  <div class="flow-wrap">
    <div class="flow">
      <template v-for="(n, i) in nodes" :key="i">
        <div class="node" :class="{ hot: n.hot }">
          <div class="nbox">
            <svg v-if="i===0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>
            <svg v-else-if="i===1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
            <svg v-else-if="i===2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <div class="ntext"><b>{{ n.label }}</b><span>{{ n.sub }}</span></div>
        </div>
        <div v-if="i < nodes.length - 1" class="link">
          <span class="pulse" /><span class="pulse d2" /><span class="pulse d3" />
        </div>
      </template>
    </div>
    <p class="flow-note">The <b>free library</b> builds the file. <b>Pro &amp; Ultra</b> run the live bank check - so a typo'd routing number never sends money into a black hole.</p>
  </div>
</template>

<style scoped>
.flow-wrap { background: var(--paper); border-radius: 32px; padding: 44px 36px 34px; }
.flow { display: flex; align-items: stretch; }
.node { flex: 0 0 auto; width: 178px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; }
.nbox { width: 64px; height: 64px; border-radius: 18px; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; }
.nbox svg { width: 30px; height: 30px; }
.node.hot .nbox { background: var(--mint); color: #000; }
.ntext { display: flex; flex-direction: column; gap: 4px; }
.ntext b { font-size: 15px; line-height: 1.25; color: #000; letter-spacing: -.01em; }
.ntext span { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--smoke); }

.link { flex: 1 1 auto; min-width: 44px; position: relative; height: 64px; }
.link::before { content: ""; position: absolute; top: 31px; left: 0; right: 0; height: 2px; background: var(--ash); }
.pulse { position: absolute; top: 27px; left: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 4px rgba(209,255,202,.5); animation: flow 2.1s linear infinite; }
.pulse.d2 { animation-delay: .7s; }
.pulse.d3 { animation-delay: 1.4s; }
@keyframes flow { from { left: -4%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } to { left: 100%; opacity: 0; } }

.flow-note { text-align: center; max-width: 62ch; margin: 34px auto 0; color: var(--slate); font-size: 16px; line-height: 1.5; }
.flow-note b { color: #000; }

@media (max-width: 820px) {
  .flow { flex-direction: column; align-items: stretch; gap: 0; }
  .node { flex-direction: row; width: auto; text-align: left; gap: 16px; }
  .ntext { align-items: flex-start; }
  .link { height: 40px; width: 64px; min-width: 0; }
  .link::before { top: 0; bottom: 0; left: 31px; right: auto; width: 2px; height: auto; }
  .pulse { top: 0; left: 27px; animation-name: flowv; }
  @keyframes flowv { from { top: -4%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } to { top: 100%; opacity: 0; } }
}
@media (prefers-reduced-motion: reduce) { .pulse { animation: none; opacity: 1; left: 46%; } }
</style>
