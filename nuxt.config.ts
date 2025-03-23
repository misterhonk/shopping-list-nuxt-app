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
    registerType: 'autoUpdate', // Automatische Updates erzwingen
    manifest: {
      name: 'Einkaufslisten App',
      short_name: 'Einkaufsliste',
      description: 'Verwalte deine Einkaufslisten',
      theme_color: '#f97316',
      background_color: '#ffffff',
      display: 'standalone',
      version: '2.0.1', // Explizite Version im Manifest
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
      // Sofortiges Aktivieren des neuen Service Workers
      skipWaiting: true,
      // Kontrolle über alle Clients übernehmen
      clientsClaim: true,
      // Veraltete Caches bereinigen
      cleanupOutdatedCaches: true,
      // Kürzere Update-Intervalle für Dev-Mode
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      // Aggressivere Caching-Strategie vermeiden
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'NetworkFirst', // Auf NetworkFirst geändert für häufigere Updates
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24, // 1 Tag (kürzer als zuvor)
            },
          },
        },
        {
          urlPattern: /\.(?:js|css)$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 12, // 12 Stunden
            },
          },
        },
        {
          urlPattern: /\/_nuxt\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'nuxt-resources',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 6, // 6 Stunden (noch kürzer für häufigere Updates)
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  // Vite Konfiguration für PWA auf iOS
  vite: {
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
      },
      // Build-Versioning für bessere Cache-Busting
      rollupOptions: {
        output: {
          entryFileNames: `[name].[hash].js`,
          chunkFileNames: `[name].[hash].js`,
          assetFileNames: `[name].[hash].[ext]`,
        },
      },
    },
    // Spezielle Header für bessere Cache-Kontrolle
    server: {
      headers: {
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
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
        // Cache-Control Meta-Tags für iOS
        { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { 'http-equiv': 'Pragma', content: 'no-cache' },
        { 'http-equiv': 'Expires', content: '0' },
      ],
      // Explizites CSP-Tag
      script: [
        {
          children: `window.__VUE_PROD_DEVTOOLS__ = false; window.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;`,
        },
      ],
    },
    // Cache-Kontrolle über HTTP-Header
    pageTransition: false, // Verbessert das Reload-Verhalten
    // Hash im Dateinamen für Cache-Busting
    buildAssetsDir: `_nuxt_${Date.now()}/`,
  },

  // Server-Konfiguration für Testing
  server: {
    host: '0.0.0.0', // Auf allen Interfaces hören
    port: 3000, // Standard-Port
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
