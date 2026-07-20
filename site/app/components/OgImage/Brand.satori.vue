<script setup lang="ts">
withDefaults(defineProps<{ title?: string; subtitle?: string; eyebrow?: string }>(), {
  title: 'The ACH file toolkit for developers',
  subtitle: 'Generate, parse and validate NACHA ACH files. npm and PyPI, byte-identical.',
  eyebrow: 'NACHA / ACH TOOLKIT',
})
</script>

<template>
  <div :style="{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#e5e5e5', padding: '72px', fontFamily: 'Inter' }">
    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }">
      <div :style="{ display: 'flex', background: '#d1ffca', color: '#000', borderRadius: '999px', padding: '12px 26px', fontFamily: 'JetBrains Mono', fontSize: '24px', letterSpacing: '2px' }">{{ eyebrow }}</div>
      <div :style="{ display: 'flex', width: '30px', height: '30px', background: '#fff100' }" />
    </div>

    <div :style="{ display: 'flex', flexDirection: 'column' }">
      <div :style="{ display: 'flex', fontFamily: 'Archivo Black', fontSize: '86px', lineHeight: '0.98', color: '#000', letterSpacing: '-3px', textTransform: 'uppercase', maxWidth: '1010px' }">{{ title }}</div>
      <div :style="{ display: 'flex', marginTop: '28px', fontSize: '30px', color: '#444', maxWidth: '900px' }">{{ subtitle }}</div>
    </div>

    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }">
      <div :style="{ display: 'flex', alignItems: 'center' }">
        <div :style="{ display: 'flex', width: '40px', height: '40px', background: '#000', borderRadius: '8px', marginRight: '16px' }" />
        <div :style="{ display: 'flex', fontFamily: 'Archivo Black', fontSize: '40px', color: '#000', letterSpacing: '-1px', textTransform: 'uppercase' }">achkit</div>
      </div>
      <div :style="{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: '26px', color: '#000' }">achkit.com</div>
    </div>
  </div>
</template>
