<script setup lang="ts">
// Photoreal Blender turntable render as a transparent looping <video> (webm/VP9
// alpha). Autoplays muted, loops seamlessly, needs no WebGL. The rendered still
// is the poster/fallback for browsers without webm-alpha.
</script>

<template>
  <div class="hero3d">
    <video class="poster" autoplay loop muted playsinline preload="auto" poster="/hero-poster.png" aria-hidden="true">
      <source src="/hero.webm" type="video/webm">
    </video>
  </div>
</template>

<style scoped>
.hero3d { position: relative; width: 100%; height: min(64vw, 560px); min-height: 400px; }
.poster {
  width: 100%; height: 100%;
  object-fit: contain; object-position: center;
  animation: heroFloat 6.5s ease-in-out infinite;
}
@keyframes heroFloat { 0%, 100% { transform: translateY(-7px); } 50% { transform: translateY(7px); } }
@media (prefers-reduced-motion: reduce) { .poster { animation: none; } }
@media (max-width: 900px) { .hero3d { height: 440px; } }
</style>
