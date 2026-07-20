<script setup lang="ts">
// The <div> ships with a static banded fallback as its background (pure CSS,
// always visible - no browser can show "blank"). three is imported on mount;
// only once WebGL has actually drawn a frame do we clear the fallback so the
// canvas shows. If three is blocked, WebGL is off, or the GPU is unavailable,
// the bands simply stay.
const host = ref<HTMLElement | null>(null)
let cleanup: (() => void) | null = null

onMounted(async () => {
  const el = host.value
  if (!el) return

  let THREE: typeof import('three')
  try {
    THREE = await import('three')
  } catch (e) {
    console.warn('[hero] three unavailable, keeping fallback', e)
    return
  }

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  } catch (e) {
    console.warn('[hero] webgl unavailable, keeping fallback', e)
    return
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0.4, 7)
  camera.lookAt(0, 0, 0)

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  el.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(4, 7, 6); scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-5, 2, -4); scene.add(rim)

  const m = (c: number, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r })
  const concrete = m(0xd3cfc7, 0.95), wood = m(0xb0834a, 0.6), dark = m(0x1f1f1f, 0.5)
  const mint = m(0xd1ffca, 0.4), yellow = m(0xfff100, 0.4), pink = m(0xff4fa0, 0.4), cyan = m(0x33c4ff, 0.4)

  const group = new THREE.Group(); group.rotation.x = -0.16; scene.add(group)
  const R = 1.25, H = 0.52, N = 8
  const bands = [concrete, wood, dark, concrete, wood, dark, concrete, mint]
  for (let i = 0; i < N; i++) {
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H * 0.97, 6), bands[i])
    hex.position.y = (i - (N - 1) / 2) * H
    hex.rotation.y = i * 0.05
    group.add(hex)
  }
  ;[cyan, pink, yellow, dark].forEach((mm, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.85), mm)
    const a = i * Math.PI / 2 + 0.4
    b.position.set(Math.cos(a) * (R + 0.55), (i - 1.5) * H * 2, Math.sin(a) * (R + 0.55))
    b.rotation.y = -a
    group.add(b)
  })

  function resize() {
    const w = el!.clientWidth || 480, h = el!.clientHeight || 480
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize); ro.observe(el)

  let visible = true
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.01 })
  io.observe(el)

  let cleared = false
  renderer.setAnimationLoop(() => {
    if (!visible) return
    if (!reduce) group.rotation.y += 0.006
    renderer.render(scene, camera)
    if (!cleared) { el!.classList.add('gl-ready'); cleared = true } // WebGL drew a frame - drop the fallback
  })

  cleanup = () => {
    renderer.setAnimationLoop(null); io.disconnect(); ro.disconnect(); renderer.dispose()
    if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="host" class="hero3d" aria-hidden="true" />
</template>

<style scoped>
.hero3d {
  position: relative;
  width: 100%;
  height: min(64vw, 560px);
  min-height: 380px;
  border-radius: 44px;
  /* Default = static banded fallback. Cleared once WebGL draws a frame. */
  background: linear-gradient(180deg,
    #d1ffca 0 11%, #cfccc4 11% 28%, #1f1f1f 28% 40%,
    #b0834a 40% 56%, #cfccc4 56% 70%, #1f1f1f 70% 82%, #b0834a 82% 100%);
  box-shadow: inset 0 0 60px rgba(0,0,0,.08);
}
.hero3d.gl-ready { background: transparent; box-shadow: none; border-radius: 0; }
.hero3d :deep(canvas) { position: relative; z-index: 1; }
@media (max-width: 900px) { .hero3d { height: 440px; } }
</style>
