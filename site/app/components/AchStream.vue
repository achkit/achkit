<script setup lang="ts">
// Endless vertical stream of real 94-character NACHA records with their fields
// mapped, a validation pass sweeping down. Self-explains the product: this is
// the fixed-width minefield achkit generates and checks. Pure CSS animation,
// deterministic markup (no random) so SSR and client hydration match.
type Seg = { t: string; k: string }
const pad = (v: string | number, w: number, right = false) => {
  const s = String(v).slice(0, w)
  return right ? s.padStart(w) : s.padEnd(w)
}
const F = (v: string | number, w: number, k: string, right = false): Seg => ({ t: pad(v, w, right), k })

// A PPD entry-detail record (type 6) is 94 chars across 11 fields.
const entry = (tx: string, rt: string, cd: string, ac: string, amt: number, id: string, nm: string, tr: string): Seg[] => [
  F('6', 1, 'type'), F(tx, 2, 'tx'), F(rt, 8, 'rt'), F(cd, 1, 'rt'),
  F(ac, 17, 'ac'), F(amt, 10, 'amt', true), F(id, 15, 'id'), F(nm, 22, 'nm'),
  F('  ', 2, 'dis'), F('0', 1, 'add'), F(tr, 15, 'tr'),
]

const records: Seg[][] = [
  [F('1', 1, 'type'), F('01', 2, 'tx'), F(' 021000021', 10, 'rt'), F(' 1234567890', 11, 'ac'), F('2607210830A094101', 17, 'id'), F('DEMOBANK', 12, 'nm'), F('ACHKIT PAYROLL SVC', 19, 'nm')],
  [F('5', 1, 'type'), F('200', 3, 'tx'), F('ACHKIT LABS INC', 16, 'nm'), F('', 20, 'dis'), F('1234567890', 10, 'ac'), F('PPD', 3, 'id'), F('PAYROLL', 10, 'nm'), F('260722', 6, 'amt'), F('   1076500001', 13, 'tr')],
  entry('22', '02100002', '1', 'DEMO000004410021', 124050, 'EMP-0042', 'JANE Q PUBLIC', '021000020000001'),
  entry('27', '31100011', '8', 'CHK00988120114', 89900, 'EMP-0043', 'MARCUS DELACROIX', '021000020000002'),
  entry('22', '11400153', '3', 'SAV0044120990017', 245000, 'EMP-0044', 'PRIYA RAMASWAMY', '021000020000003'),
  entry('32', '02601030', '2', 'DEMO000221004', 51275, 'EMP-0045', 'WEI ZHANG', '021000020000004'),
  entry('22', '05400001', '4', 'CHK00120553311', 300000, 'EMP-0046', 'AISHA OKONKWO', '021000020000005'),
  entry('27', '09100001', '9', 'DEMO009911024410', 74180, 'EMP-0047', 'LUCAS FERREIRA', '021000020000006'),
  [F('8', 1, 'type'), F('200', 3, 'tx'), F('000006', 6, 'amt'), F('01410153', 10, 'rt'), F('0000000000', 10, 'amt'), F('0000984405', 10, 'amt', true), F('1234567890', 10, 'ac'), F('', 25, 'dis'), F('076500001', 9, 'tr')],
  entry('22', '12100024', '8', 'DEMO000551200417', 168000, 'EMP-0048', 'SOFIA MARTINELLI', '021000020000007'),
  entry('22', '02100002', '1', 'CHK00771120044', 92340, 'EMP-0049', 'OMAR HADDAD', '021000020000008'),
  [F('9', 1, 'type'), F('000012', 6, 'amt'), F('000002', 6, 'amt'), F('00000042', 8, 'amt'), F('0000984405', 10, 'amt', true), F('0000000000', 10, 'amt'), F('00000000', 8, 'amt'), F('', 39, 'dis')],
]

const loop = [...records, ...records]
</script>

<template>
  <div class="stream" aria-hidden="true">
    <div class="grid-lines" />
    <div class="track">
      <div v-for="(rec, i) in loop" :key="i" class="rec">
        <span class="ln">{{ String((i % records.length) + 1).padStart(2, '0') }}</span>
        <span class="fields"><span v-for="(f, j) in rec" :key="j" class="seg" :class="f.k">{{ f.t }}</span></span>
        <svg class="chk" viewBox="0 0 20 20" fill="none"><path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </div>
    </div>
    <div class="scan" />
    <div class="cap"><span class="dot" /> 94-char NACHA records - validated</div>
  </div>
</template>

<style scoped>
.stream {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 460px;
  overflow: hidden;
  border-radius: 20px;
  background:
    radial-gradient(120% 80% at 70% 0%, #17181c 0%, #0c0d10 60%, #090a0c 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 11%, #000 82%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 11%, #000 82%, transparent 100%);
}
.grid-lines {
  position: absolute; inset: 0;
  background-image: linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 7.1ch 100%;
  opacity: .5;
}
.track {
  position: absolute; left: 0; right: 0; top: 0;
  display: flex; flex-direction: column;
  padding: 24px 26px;
  gap: 13px;
  animation: up 34s linear infinite;
  will-change: transform;
}
@keyframes up { to { transform: translateY(-50%); } }

.rec {
  display: flex; align-items: center; gap: 14px;
  font-family: var(--mono);
  font-size: clamp(10px, .74vw, 13px);
  letter-spacing: -.02em;
  white-space: pre;
  color: #6b7078;
}
.ln { color: #3a3d43; font-size: .82em; min-width: 2ch; }
.fields { display: inline-flex; }
.seg { padding: 3px 0; }
.seg.type { background: var(--mint); color: #05110a; font-weight: 600; padding: 3px 2px; border-radius: 3px; }
.seg.amt { color: #fff100; }
.seg.rt { color: #cdd2d8; }
.seg.ac { color: #7f8790; }
.seg.nm { color: #b8bec6; }
.seg.id { color: #5f666e; }
.seg.tx { color: #8a9199; }
.seg.tr, .seg.dis, .seg.add { color: #4b4f56; }

.chk { width: 17px; height: 17px; margin-left: auto; color: var(--mint); flex: none; opacity: .9; }

.scan {
  position: absolute; left: 0; right: 0; height: 128px;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(209,255,202,.13) 45%, rgba(209,255,202,.22) 50%, rgba(209,255,202,.13) 55%, transparent);
  border-top: 1px solid rgba(209,255,202,.35);
  border-bottom: 1px solid rgba(209,255,202,.16);
  animation: sweep 6s cubic-bezier(.5,0,.5,1) infinite;
}
@keyframes sweep { 0% { top: -14%; } 100% { top: 104%; } }

.cap {
  position: absolute; left: 22px; bottom: 18px;
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 11px; letter-spacing: -.02em;
  color: #7f8790; text-transform: uppercase;
}
.cap .dot { width: 7px; height: 7px; border-radius: 999px; background: var(--mint); box-shadow: 0 0 8px var(--mint); animation: pulse 1.8s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }

@media (prefers-reduced-motion: reduce) {
  .track, .scan, .cap .dot { animation: none; }
}
@media (max-width: 900px) { .stream { min-height: 380px; } }
</style>
