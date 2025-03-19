import { defineNuxtPlugin } from '#app';
import { useDarkMode } from '~/composables/useDarkMode';

/**
 * Plugin für die Initialisierung des Dark Mode
 * Wird nur auf dem Client ausgeführt (.client.ts)
 */
export default defineNuxtPlugin(() => {
  // Dark Mode beim ersten Laden der Seite initialisieren
  if (process.client) {
    const { initializeDarkMode } = useDarkMode();
    
    // Alle Dark Mode-Logik ist im Composable gekapselt
    initializeDarkMode();
  }
});
