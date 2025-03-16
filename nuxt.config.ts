// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Modules
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],

  // Pinia Konfiguration
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },

  // PWA-Konfiguration
  pwa: {
    manifest: {
      name: 'Einkaufslisten App',
      short_name: 'Einkaufsliste',
      description: 'Verwalte deine Einkaufslisten',
      theme_color: '#f97316',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: 'icons/icon-64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: null,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
  // CSP-freundliche Konfiguration
  vite: {
    // Wechsel zu safer code splitting für CSP-Kompatibilität
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
      },
    },
    // Optimierungen für CSP-Kompatibilität
    optimizeDeps: {
      include: [],
      exclude: [],
    },
  },

  // App-Konfiguration
  app: {
    head: {
      title: 'Einkaufslisten App',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Meine wöchentliche Einkaufsliste' },
      ],
      // Explizites CSP-Tag
      script: [
        {
          children: `window.__VUE_PROD_DEVTOOLS__ = false; window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;`,
        },
      ],
    },
  },

  // Stellen Sie sicher, dass client-seitige Navigation aktiviert ist
  router: {
    options: {
      strict: false,
    },
  },

  // Wir verwenden client-seitiges Rendering, da wir LocalStorage benötigen
  ssr: false,

  compatibilityDate: '2025-03-16',
});
