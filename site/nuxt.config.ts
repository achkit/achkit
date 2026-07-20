export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  ssr: true,
  modules: ['@nuxt/fonts', '@nuxtjs/sitemap'],
  css: ['~/assets/css/main.css'],
  site: { url: 'https://achkit.com', name: 'achkit' },
  nitro: {
    prerender: { autoSubfolderIndex: false },
  },
  fonts: {
    families: [
      { name: 'Archivo Black', provider: 'google', weights: [400] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 700] },
    ],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#e5e5e5' },
      ],
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    },
  },
})
