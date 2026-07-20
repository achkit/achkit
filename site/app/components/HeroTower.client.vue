<script setup lang="ts">
import * as THREE from 'three'

const host = useTemplateRef<HTMLDivElement>('host')
let raf = 0
let ro: ResizeObserver | null = null
let renderer: THREE.WebGLRenderer | null = null

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  if (renderer) { renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove() }
  renderer = null
})

const inst = getCurrentInstance()
onMounted(async () => {
  await nextTick()
  let el = host.value as HTMLDivElement | null
  if (!el) {
    const root = inst?.proxy?.$el as HTMLElement | undefined
    el = (root?.classList?.contains('tower') ? root : root?.querySelector?.('.tower')) as HTMLDivElement | null
  }
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return
  }
  const r = renderer
  r.setClearAlpha(0)
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  el.appendChild(r.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0.6, 0.4, 15)
  camera.lookAt(0, 0.2, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.72))
  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(6, 10, 8)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.5)
  rim.position.set(-8, 2, -6)
  scene.add(rim)

  // Procedural face textures - concrete speckle + warm wood grain.
  function tex(draw: (c: CanvasRenderingContext2D, s: number) => void) {
    const s = 256
    const cv = document.createElement('canvas')
    cv.width = cv.height = s
    const c = cv.getContext('2d')!
    draw(c, s)
    const t = new THREE.CanvasTexture(cv)
    t.anisotropy = 4
    return t
  }
  const concrete = tex((c, s) => {
    c.fillStyle = '#eceae4'; c.fillRect(0, 0, s, s)
    for (let i = 0; i < 2600; i++) {
      const g = 190 + Math.floor(Math.random() * 60)
      c.fillStyle = `rgba(${g - 40},${g - 42},${g - 48},${Math.random() * 0.5})`
      c.fillRect(Math.random() * s, Math.random() * s, 1.6, 1.6)
    }
  })
  const wood = tex((c, s) => {
    c.fillStyle = '#d9b489'; c.fillRect(0, 0, s, s)
    for (let y = 0; y < s; y += 3) {
      const w = 90 + Math.sin(y * 0.09) * 40
      c.strokeStyle = `rgba(150,105,58,${0.10 + Math.random() * 0.16})`
      c.lineWidth = 1 + Math.random() * 1.6
      c.beginPath()
      for (let x = 0; x <= s; x += 8) c.lineTo(x, y + Math.sin((x + y) * 0.03) * 3)
      c.stroke()
      w
    }
  })
  const colorMat = (hex: number) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.55, metalness: 0 })
  const concreteMat = new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.92, metalness: 0 })
  const woodMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.7, metalness: 0 })
  const COLORS = [0x35c956, 0xffe100, 0xff5db1, 0x22b8e6, 0xffffff, 0x2f2f2f]

  // A layer: a wide rounded-ish block. Sides mostly concrete/wood, one accent
  // band. Faces order: +x -x +y -y +z -z.
  const geo = new THREE.BoxGeometry(3.4, 0.92, 2.3)
  geo.translate(0, 0, 0)

  function skin(): THREE.Material[] {
    const base = Math.random() < 0.5 ? concreteMat : woodMat
    const accent = colorMat(COLORS[Math.floor(Math.random() * COLORS.length)])
    const band = Math.random() < 0.62
    const wood2 = woodMat
    return [
      band ? accent : base,   // +x
      Math.random() < 0.4 ? wood2 : base, // -x
      Math.random() < 0.5 ? accent : concreteMat, // +y top
      base,                   // -y
      band ? base : accent,   // +z
      base,                   // -z
    ]
  }

  const LAYERS = 13
  const H = 1.06
  const totalH = LAYERS * H
  const topY = totalH / 2
  const botY = -totalH / 2
  const tower = new THREE.Group()
  scene.add(tower)
  const blocks: THREE.Mesh[] = []
  for (let i = 0; i < LAYERS; i++) {
    const m = new THREE.Mesh(geo, skin())
    m.position.y = botY + i * H
    m.rotation.y = (Math.random() - 0.5) * 0.5
    m.position.x = (Math.random() - 0.5) * 0.5
    m.userData.spin = m.rotation.y
    blocks.push(m)
    tower.add(m)
  }

  // Floating accent cubes orbiting the tower.
  const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  const cubes: { m: THREE.Mesh; a: number; rad: number; yb: number }[] = []
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(cubeGeo, colorMat(COLORS[i % COLORS.length]))
    cubes.push({ m, a: Math.random() * Math.PI * 2, rad: 3.1 + Math.random() * 0.9, yb: (Math.random() - 0.5) * totalH * 0.8 })
    scene.add(m)
  }

  function resize() {
    const w = el.clientWidth || 1
    const h = el.clientHeight || 1
    r.setSize(w, h, false)
    camera.aspect = w / h
    // Frame the tall tower: pull camera back on portrait, closer on wide.
    camera.position.z = 15 + Math.max(0, (h / w) - 1) * 6
    camera.updateProjectionMatrix()
  }
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(el)

  const DOWN = reduce ? 0 : 0.012
  const SPIN = reduce ? 0 : 0.0035
  function frame() {
    for (const m of blocks) {
      m.position.y -= DOWN
      if (m.position.y < botY) {
        m.position.y += totalH
        m.material = skin() as THREE.Material[]
        m.rotation.y = (Math.random() - 0.5) * 0.5
        m.position.x = (Math.random() - 0.5) * 0.5
      }
    }
    tower.rotation.y += SPIN
    for (const c of cubes) {
      c.a += SPIN * 1.4
      c.m.position.set(Math.cos(c.a) * c.rad, c.yb, Math.sin(c.a) * c.rad)
      c.m.position.y -= DOWN
      if (c.m.position.y < botY) c.m.position.y = topY
      else c.yb -= DOWN
      c.m.rotation.x += 0.01
      c.m.rotation.y += 0.012
    }
    r.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  frame()
})
</script>

<template>
  <div ref="host" class="tower" aria-hidden="true" />
</template>

<style scoped>
.tower {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 460px;
  /* Fade the tower out at the bottom so it reads as endless. */
  -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 97%);
  mask-image: linear-gradient(to bottom, #000 62%, transparent 97%);
}
.tower :deep(canvas) { display: block; width: 100% !important; height: 100% !important; }
</style>
