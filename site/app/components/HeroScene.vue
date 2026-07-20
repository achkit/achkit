<script setup lang="ts">
// The Blender totem render is a plain server-rendered <img> - it shows in every
// browser with zero JS or WebGL. WebGL is pure enhancement: only if the GPU
// actually draws pixels do we fade the image out and reveal the live canvas.
const host = ref<HTMLElement | null>(null)
const glReady = ref(false)
let cleanup: (() => void) | null = null

onMounted(async () => {
  const el = host.value
  if (!el) return
  let THREE: typeof import('three')
  try { THREE = await import('three') } catch { return }

  let renderer: THREE.WebGLRenderer
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }) } catch { return }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(0, 0.4, 7); camera.lookAt(0, 0, 0)
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
    hex.position.y = (i - (N - 1) / 2) * H; hex.rotation.y = i * 0.05; group.add(hex)
  }
  ;[cyan, pink, yellow, dark].forEach((mm, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.85), mm)
    const a = i * Math.PI / 2 + 0.4
    b.position.set(Math.cos(a) * (R + 0.55), (i - 1.5) * H * 2, Math.sin(a) * (R + 0.55)); b.rotation.y = -a; group.add(b)
  })

  function resize() {
    const w = el!.clientWidth || 480, h = el!.clientHeight || 480
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize); ro.observe(el)
  let visible = true
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.01 })
  io.observe(el)

  let checked = false
  renderer.setAnimationLoop(() => {
    if (!visible) return
    if (!reduce) group.rotation.y += 0.006
    renderer.render(scene, camera)
    if (!checked) {
      checked = true
      let drew = false
      try {
        const gl = renderer.getContext()
        const cw = renderer.domElement.width, chh = renderer.domElement.height
        const buf = new Uint8Array(4 * 400)
        gl.readPixels(Math.max(0, (cw >> 1) - 10), Math.max(0, (chh >> 1) - 10), 20, 20, gl.RGBA, gl.UNSIGNED_BYTE, buf)
        for (let i = 3; i < buf.length; i += 4) { if (buf[i] > 8) { drew = true; break } }
      } catch { drew = false }
      if (drew) { glReady.value = true } else { renderer.setAnimationLoop(null); if (renderer.domElement.parentNode === el) el!.removeChild(renderer.domElement) }
    }
  })

  cleanup = () => {
    renderer.setAnimationLoop(null); io.disconnect(); ro.disconnect(); renderer.dispose()
    if (renderer.domElement.parentNode === el) el!.removeChild(renderer.domElement)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div class="hero3d">
    <img src="/hero-poster.png" class="poster" :class="{ hide: glReady }" alt="" aria-hidden="true">
    <div ref="host" class="canvas-host" aria-hidden="true" />
  </div>
</template>

<style scoped>
.hero3d { position: relative; width: 100%; height: min(64vw, 560px); min-height: 400px; }
.poster {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: contain; object-position: center;
  transition: opacity .6s ease; animation: heroFloat 6s ease-in-out infinite;
}
.poster.hide { opacity: 0; }
.canvas-host { position: absolute; inset: 0; }
.canvas-host :deep(canvas) { width: 100%; height: 100%; display: block; }
@keyframes heroFloat { 0%, 100% { transform: translateY(-7px); } 50% { transform: translateY(7px); } }
@media (prefers-reduced-motion: reduce) { .poster { animation: none; } }
@media (max-width: 900px) { .hero3d { height: 440px; } }
</style>
