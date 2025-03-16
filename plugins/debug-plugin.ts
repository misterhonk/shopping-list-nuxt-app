import { defineNuxtPlugin } from '#app';

/**
 * Debug-Plugin für die Anwendung
 * Protokolliert wichtige Ereignisse und Statusänderungen
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Listener für Kategorieänderungen registrieren
  nuxtApp.hook('app:mounted', () => {
    const onCategoryUpdate = nuxtApp.$onCategoryUpdate;
    if (onCategoryUpdate) {
      const unsubscribe = onCategoryUpdate((categoryId: string, newName: string) => {
        console.log(`[Debug] Kategorie-Update erkannt: ID=${categoryId}, Name=${newName}`);
      });
      
      // Debug-Meldung ausgeben
      console.log('[Debug] Kategorie-Debug-Listener registriert');
    } else {
      console.warn('[Debug] onCategoryUpdate nicht verfügbar - Debug-Listener konnte nicht registriert werden');
    }
  });
  
  // Debug-Informationen für die App bereitstellen
  const APP_VERSION = '1.0.0';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    provide: {
      debug: {
        version: APP_VERSION,
        isDevelopment,
        logEvent: (category: string, action: string, label?: string, value?: number) => {
          if (isDevelopment) {
            console.log(`[Debug] Event: ${category} / ${action}${label ? ' / ' + label : ''}${value !== undefined ? ' = ' + value : ''}`);
          }
        }
      }
    }
  };
});
