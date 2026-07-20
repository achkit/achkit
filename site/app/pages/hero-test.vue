<script setup lang="ts">
const webgl = ref('checking...')
const imgLoaded = ref('checking...')

onMounted(() => {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    webgl.value = gl ? 'WebGL AVAILABLE - ' + gl.getParameter(gl.VERSION) + ' | ' + gl.getParameter(gl.RENDERER) : 'WebGL NOT AVAILABLE in this browser'
  } catch (e: any) {
    webgl.value = 'WebGL ERROR: ' + e.message
  }
  const img = new Image()
  img.onload = () => { imgLoaded.value = `image loaded OK (${img.naturalWidth}x${img.naturalHeight})` }
  img.onerror = () => { imgLoaded.value = 'image FAILED to load' }
  img.src = '/hero-poster.png'
})

definePageMeta({ layout: false })
useSeoMeta({ title: 'Hero test', robots: 'noindex' })
</script>

<template>
  <div style="font-family:system-ui;max-width:1000px;margin:0 auto;padding:40px 24px;color:#111">
    <h1 style="font-size:28px">Hero isolation test</h1>

    <div style="margin:24px 0;padding:16px;background:#f3f3f3;border-radius:10px;font-family:monospace;font-size:14px">
      <div>WebGL in YOUR browser: <b :style="{ color: webgl.includes('AVAILABLE') && !webgl.includes('NOT') ? 'green' : 'crimson' }">{{ webgl }}</b></div>
      <div style="margin-top:8px">Poster image: <b :style="{ color: imgLoaded.includes('OK') ? 'green' : 'crimson' }">{{ imgLoaded }}</b></div>
    </div>

    <h2 style="font-size:18px;margin-top:32px">1. Plain image tag (no JS, no WebGL)</h2>
    <img src="/hero-poster.png" alt="totem render" style="width:340px;height:auto;border:2px solid #3d7;background:#e5e5e5">

    <h2 style="font-size:18px;margin-top:32px">2. HeroScene component (image baseline + WebGL overlay)</h2>
    <div style="width:520px;max-width:100%;background:#e5e5e5;border:2px solid #37d;border-radius:16px">
      <HeroScene />
    </div>

    <p style="margin-top:24px;color:#666">If box 1 shows the totem but the homepage doesn't, the homepage has an interfering issue. If box 1 is blank too, the image isn't reaching your browser.</p>
  </div>
</template>
