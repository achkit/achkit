<script setup lang="ts">
import * as THREE from 'three'

const host = ref<HTMLElement | null>(null)
let raf = 0
let cleanup: (() => void) | null = null

// Marks rendered onto block faces. Swap/extend freely; SVG paths welcome.
const MARKS = ['ACH', 'NACHA', 'npm', 'PyPI', 'PPD', 'CCD', 'WEB', '94', 'R01', 'EFT']
const ACCENTS = [0xd1ffca, 0xfff100, 0xff4fa0, 0x2aa84f, 0xff6a2b, 0x33c4ff]

function speckleTexture(base: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  x.fillStyle = base
  x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1400; i++) {
    const r = Math.random() * 1.6
    x.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.5)'
    x.beginPath()
    x.arc(Math.random() * 256, Math.random() * 256, r, 0, 7)
    x.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function woodTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  for (let y = 0; y < 256; y += 3) {
    const s = 0.5 + Math.random() * 0.5
    x.fillStyle = `rgb(${185 * s + 40},${138 * s + 30},${79 * s + 20})`
    x.fillRect(0, y, 256, 3)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function markTexture(label: string, fg: string, bg: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  x.fillStyle = bg
  x.fillRect(0, 0, 256, 256)
  x.fillStyle = fg
  x.font = '700 62px Arial, sans-serif'
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillText(label.toUpperCase(), 128, 138)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function init(el: HTMLElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 1.6, 11)
  camera.lookAt(0, 0.4, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  const key = new THREE.DirectionalLight(0xffffff, 2.1)
  key.position.set(5, 9, 6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 0.5)
  fill.position.set(-6, 3, 4)
  scene.add(fill)

  const concrete = new THREE.MeshStandardMaterial({ map: speckleTexture('#d6d3cb'), roughness: 0.95, metalness: 0 })
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.7, metalness: 0 })
  const charcoal = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.55, metalness: 0.05 })
  const band = [charcoal, wood, concrete]

  // A tower of hexagonal prisms that scrolls endlessly; protruding logo/accent
  // blocks ride selected layers. The whole group rotates slowly.
  const tower = new THREE.Group()
  const LAYERS = 13
  const GAP = 0.62
  const H = LAYERS * GAP
  const R = 1.35
  const layers: THREE.Group[] = []

  for (let i = 0; i < LAYERS; i++) {
    const g = new THREE.Group()
    g.position.y = i * GAP - H / 2

    const hex = new THREE.Mesh(new THREE.CylinderGeometry(R, R, GAP * 0.98, 6), band[i % 3])
    hex.castShadow = hex.receiveShadow = true
    g.add(hex)

    // a protruding block every couple of layers
    if (i % 2 === 0) {
      const ang = (i * 1.1) % (Math.PI * 2)
      const useAccent = i % 4 === 0
      const label = MARKS[i % MARKS.length]
      const front = new THREE.MeshStandardMaterial(
        useAccent
          ? { color: ACCENTS[(i / 2) % ACCENTS.length], roughness: 0.4 }
          : { map: markTexture(label, '#111', '#e9e7e0'), roughness: 0.8 },
      )
      const side = i % 3 === 0 ? wood : concrete
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.5, 0.95), [side, side, side, side, front, side])
      box.castShadow = true
      box.position.set(Math.cos(ang) * (R + 0.7), 0, Math.sin(ang) * (R + 0.7))
      box.rotation.y = -ang + Math.PI / 2
      g.add(box)
    }
    tower.add(g)
    layers.push(g)
  }
  tower.rotation.x = 0.04
  scene.add(tower)

  // faded mirror for the reflection floor look
  const mirror = tower.clone()
  mirror.scale.y = -1
  mirror.position.y = -H / 2 - H / 2 - 0.1
  mirror.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[]
      const fade = (mm: THREE.Material) => { mm.transparent = true; mm.opacity = 0.14; mm.depthWrite = false }
      Array.isArray(m) ? m.forEach(fade) : fade(m)
    }
  })
  scene.add(mirror)

  function resize() {
    const w = el.clientWidth
    const h = el.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  const clock = new THREE.Clock()
  const SPEED = 0.55
  function frame() {
    const dt = clock.getDelta()
    if (!reduce) {
      tower.rotation.y += dt * 0.28
      mirror.rotation.y = tower.rotation.y
      for (const g of layers) {
        g.position.y += dt * SPEED
        if (g.position.y > H / 2) g.position.y -= H
      }
    }
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  frame()

  cleanup = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    renderer.dispose()
    el.removeChild(renderer.domElement)
  }
}

onMounted(() => { if (host.value) init(host.value) })
onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="host" class="hero3d" aria-hidden="true" />
</template>

<style scoped>
.hero3d { position: relative; width: 100%; height: min(64vw, 560px); }
@media (max-width: 900px) { .hero3d { height: 440px; } }
</style>
