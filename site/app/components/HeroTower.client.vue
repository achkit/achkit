<script setup lang="ts">
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const host = useTemplateRef<HTMLDivElement>('host')
const inst = getCurrentInstance()
let raf = 0
let ro: ResizeObserver | null = null
let renderer: THREE.WebGLRenderer | null = null

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  if (renderer) { renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove() }
  renderer = null
})

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
  r.toneMapping = THREE.ACESFilmicToneMapping
  r.toneMappingExposure = 0.82
  el.appendChild(r.domElement)

  const scene = new THREE.Scene()

  // Studio image-based lighting - the single biggest driver of a premium look.
  const pmrem = new THREE.PMREMGenerator(r)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfbfbf, 0.32))
  const key = new THREE.DirectionalLight(0xffffff, 1.55)
  key.position.set(5, 9, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.55)
  rim.position.set(-7, 2, -5)
  scene.add(rim)

  // Fine, low-contrast concrete + clean light-oak grain. Kept subtle so it reads
  // as a cast material, not noise.
  function canvasTex(draw: (c: CanvasRenderingContext2D, s: number) => void) {
    const s = 512
    const cv = document.createElement('canvas')
    cv.width = cv.height = s
    const c = cv.getContext('2d')!
    draw(c, s)
    const t = new THREE.CanvasTexture(cv)
    t.anisotropy = 8
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }
  const concreteTex = canvasTex((c, s) => {
    c.fillStyle = '#b4b0a7'; c.fillRect(0, 0, s, s)
    const g = c.createRadialGradient(s * 0.35, s * 0.3, 0, s * 0.5, s * 0.5, s * 0.85)
    g.addColorStop(0, 'rgba(214,211,204,0.5)'); g.addColorStop(1, 'rgba(126,122,114,0.45)')
    c.fillStyle = g; c.fillRect(0, 0, s, s)
    for (let i = 0; i < 7000; i++) {
      const a = Math.random() * 0.13
      c.fillStyle = Math.random() < 0.5 ? `rgba(96,92,84,${a})` : `rgba(255,255,255,${a})`
      c.fillRect(Math.random() * s, Math.random() * s, 2, 2)
    }
  })
  const woodTex = canvasTex((c, s) => {
    c.fillStyle = '#e2c39a'; c.fillRect(0, 0, s, s)
    for (let x = 0; x < s; x += 2) {
      const n = Math.sin(x * 0.05) + Math.sin(x * 0.013) * 1.6
      c.strokeStyle = `rgba(178,132,80,${0.05 + Math.abs(Math.sin(x * 0.08)) * 0.14})`
      c.lineWidth = 1 + Math.random()
      c.beginPath(); c.moveTo(x + n, 0); c.lineTo(x + n, s); c.stroke()
    }
  })

  const concrete = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.9, metalness: 0, envMapIntensity: 0.35 })
  const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.68, metalness: 0, envMapIntensity: 0.3 })
  const COLORS = [0x25b247, 0xffcf14, 0xff4d9e, 0x149fd8, 0x1c1c1c]
  const colorMats = COLORS.map((hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.45, metalness: 0, envMapIntensity: 0.4 }))
  // Weighted so the totem always reads colourful: colour segments dominate, with
  // concrete/wood as the neutral base. Never more than two neutrals in a row.
  let neutralRun = 0
  function pick() {
    const forceColor = neutralRun >= 2
    if (!forceColor && Math.random() < 0.42) {
      neutralRun++
      return Math.random() < 0.72 ? concrete : wood
    }
    neutralRun = 0
    return colorMats[Math.floor(Math.random() * colorMats.length)]
  }

  // Chamfered hexagonal prisms - a compact totem, not grey bricks.
  const RAD = 1.55
  const HSEG = 0.86
  const hexGeo = new THREE.CylinderGeometry(RAD, RAD, HSEG, 6, 1, false)

  const LAYERS = 11
  const totalH = LAYERS * HSEG
  const topY = totalH / 2
  const botY = -totalH / 2
  const tower = new THREE.Group()
  scene.add(tower)

  type Seg = THREE.Mesh & { userData: { arm?: THREE.Mesh } }
  const segs: Seg[] = []
  function dressSeg(m: Seg) {
    m.material = pick()
    m.rotation.y = (Math.floor(Math.random() * 6)) * (Math.PI / 6)
    // Occasionally sprout a hex "arm" jutting out, like the reference totem.
    if (m.userData.arm) { tower.remove(m.userData.arm); m.userData.arm = undefined }
    if (Math.random() < 0.28) {
      const arm = new THREE.Mesh(hexGeo, Math.random() < 0.5 ? concrete : colorMats[Math.floor(Math.random() * colorMats.length)])
      arm.scale.set(0.42, 1.9, 0.42)
      arm.rotation.z = Math.PI / 2
      const dir = Math.random() * Math.PI * 2
      arm.position.set(Math.cos(dir) * (RAD + 1.2), 0, Math.sin(dir) * (RAD + 1.2))
      arm.rotation.y = dir
      m.add(arm)
      m.userData.arm = arm
    }
  }
  for (let i = 0; i < LAYERS; i++) {
    const m = new THREE.Mesh(hexGeo, concrete) as Seg
    m.position.y = botY + i * HSEG
    dressSeg(m)
    segs.push(m)
    tower.add(m)
  }

  function resize() {
    const w = Math.round(el!.clientWidth) || 1
    const h = Math.round(el!.clientHeight) || 1
    r.setSize(w, h, false)
    camera.aspect = w / h
    // Frame the whole totem with margin so it never clips at the sides.
    const visH = 7.0
    const distV = (visH / 2) / Math.tan((camera.fov * Math.PI / 180) / 2)
    const needW = (RAD + 2.4) * 2
    const distH = (needW / 2) / (Math.tan((camera.fov * Math.PI / 180) / 2) * camera.aspect)
    camera.position.set(0, 0.3, Math.max(distV, distH) + 1.2)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }
  let lastW = 0, lastH = 0, roRaf = 0
  function guardedResize() {
    const w = Math.round(el!.clientWidth), h = Math.round(el!.clientHeight)
    if (w === lastW && h === lastH) return
    lastW = w; lastH = h; resize()
  }
  guardedResize()
  ro = new ResizeObserver(() => { cancelAnimationFrame(roRaf); roRaf = requestAnimationFrame(guardedResize) })
  ro.observe(el.parentElement || el)

  const DOWN = reduce ? 0 : 0.0072
  const SPIN = reduce ? 0 : 0.0022
  function frame() {
    for (const m of segs) {
      m.position.y -= DOWN
      if (m.position.y < botY) { m.position.y += totalH; dressSeg(m) }
    }
    tower.rotation.y += SPIN
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
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 66%, transparent 98%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 66%, transparent 98%);
}
.tower :deep(canvas) { position: absolute; inset: 0; display: block; width: 100% !important; height: 100% !important; }
</style>
