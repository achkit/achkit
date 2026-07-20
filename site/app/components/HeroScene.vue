<script setup lang="ts">
// Photoreal Blender-rendered totem as a plain <img> (server-rendered, works in
// every browser - no WebGL, no canvas, interference-proof) with a subtle float.
</script>

<template>
  <div class="hero3d">
    <img src="/hero-poster.png" class="poster" alt="" aria-hidden="true">
  </div>
</template>

<style scoped>
.hero3d { position: relative; width: 100%; height: min(64vw, 560px); min-height: 400px; }
.poster {
  width: 100%; height: 100%;
  object-fit: contain; object-position: center;
  animation: heroFloat 6.5s ease-in-out infinite;
}
@keyframes heroFloat { 0%, 100% { transform: translateY(-8px); } 50% { transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .poster { animation: none; } }
@media (max-width: 900px) { .hero3d { height: 440px; } }
</style>
