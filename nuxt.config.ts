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
        { name: 'description', content: 'Meine wöchentliche Einkaufsliste' }
      ],
      // Explizites CSP-Tag
      script: [
        { children: `window.__VUE_PROD_DEVTOOLS__ = false; window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;` }
      ]
    }
  },

  // Stellen Sie sicher, dass client-seitige Navigation aktiviert ist
  router: {
    options: {
      strict: false
    }
  },

  // Wir verwenden client-seitiges Rendering, da wir LocalStorage benötigen
  ssr: false
})