import { createLogger } from '../utils/logger';

import { defineNuxtPlugin } from '#app';

// Logger initialisieren
const logger = createLogger('pinia');

/**
 * Plugin zur Initialisierung von Pinia
 * Ist nur ein Platzhalter, da Nuxt das automatisch macht, wenn @pinia/nuxt installiert ist
 */
export default defineNuxtPlugin(nuxtApp => {
  logger.info(
    '[Pinia] Plugin wurde geladen (Hinweis: Nuxt initialisiert Pinia bereits automatisch)'
  );

  return {
    provide: {
      piniaInitialized: true,
    },
  };
});
