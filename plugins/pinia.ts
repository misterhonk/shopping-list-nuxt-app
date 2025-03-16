import { defineNuxtPlugin } from '#app';

/**
 * Plugin zur Initialisierung von Pinia
 * Ist nur ein Platzhalter, da Nuxt das automatisch macht, wenn @pinia/nuxt installiert ist
 */
export default defineNuxtPlugin(nuxtApp => {
  console.log(
    '[Pinia] Plugin wurde geladen (Hinweis: Nuxt initialisiert Pinia bereits automatisch)'
  );

  return {
    provide: {
      piniaInitialized: true,
    },
  };
});
