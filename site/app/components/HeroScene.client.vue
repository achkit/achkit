<script setup lang="ts">
// GPU-accelerated WebGL (Metal-backed on Apple via the browser). Kept light:
// low-poly Blender GLB, capped pixel ratio, and the loop is PAUSED whenever the
// hero is offscreen so it never heats the device while the visitor reads on.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const host = ref<HTMLElement | null>(null)
let cleanup: (() => void) | null = null

function init(el: HTMLElement) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(2.4, 0.6, 8.6)
  camera.lookAt(0, 0.1, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  el.appendChild(renderer.domElement)

  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfbfbf, 0.6))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(5, 8, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.85)
  rim.position.set(-6, 2, -3)
  scene.add(rim)

  const spin = new THREE.Group()
  scene.add(spin)
  const clones: THREE.Object3D[] = []
  let towerH = 5

  new GLTFLoader().load('/hero.glb', (gltf) => {
    const tower = gltf.scene
    const box = new THREE.Box3().setFromObject(tower)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    tower.position.x -= center.x
    tower.position.z -= center.z
    tower.position.y -= box.min.y
    towerH = size.y
    for (let k = 0; k < 3; k++) {
      const c = tower.clone(true)
      c.position.y = k * towerH
      spin.add(c)
      clones.push(c)
    }
    spin.position.y = -towerH * 1.5 + 0.3
  }, undefined, (err) => console.error('[hero] glb load failed', err))

  function resize() {
    const w = el.clientWidth, h = el.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  let visible = true
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.01 })
  io.observe(el)

  const clock = new THREE.Clock()
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05)
    if (!visible) return
    if (!reduce) {
      spin.rotation.y += dt * 0.3
      for (const c of clones) {
        c.position.y += dt * 0.55
        if (c.position.y > clones.length * towerH) c.position.y -= clones.length * towerH
      }
    }
    renderer.render(scene, camera)
  })

  cleanup = () => {
    renderer.setAnimationLoop(null)
    io.disconnect()
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
