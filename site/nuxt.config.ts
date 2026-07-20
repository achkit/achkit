export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  ssr: true,
  modules: ['@nuxt/fonts', '@nuxtjs/sitemap', 'nuxt-og-image'],
  css: ['~/assets/css/main.css'],
  site: { url: 'https://achkit.com', name: 'achkit' },
  ogImage: {
    fonts: ['Archivo+Black:400', 'Inter:400', 'Inter:600', 'JetBrains+Mono:400'],
    defaults: { width: 1200, height: 630 },
  },
  runtimeConfig: {
    stripeSecret: '',
    stripeWebhookSecret: '',
    dragonflyUrl: 'redis://127.0.0.1:6379',
    pricePro: '',
    priceScale: '',
    public: {
      stripePublishable: '',
    },
  },
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
