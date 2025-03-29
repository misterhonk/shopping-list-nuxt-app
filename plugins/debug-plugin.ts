import { defineNuxtPlugin } from 'nuxt/app';

import { APP_VERSION } from '~/services/updateService';
import { createLogger } from '~/utils/logger';

// Logger initialisieren
const _logger = createLogger('debug-plugin');

/**
 * Debug-Plugin für die Anwendung
 * Protokolliert wichtige Ereignisse und Statusänderungen
 */
export default defineNuxtPlugin(nuxtApp => {
  // Listener für Kategorieänderungen registrieren
  nuxtApp.hook('app:mounted', () => {
    const onCategoryUpdate = nuxtApp.$onCategoryUpdate;
    if (onCategoryUpdate) {
      // Register listener but don't store unsubscribe function (not needed)
      onCategoryUpdate((categoryId: string, newName: string) => {
        _logger.info(`[Debug] Kategorie-Update erkannt: ID=${categoryId}, Name=${newName}`);
      });

      // Debug-Meldung ausgeben
      _logger.info('[Debug] Kategorie-Debug-Listener registriert');
    } else {
      _logger.warn(
        '[Debug] onCategoryUpdate nicht verfügbar - Debug-Listener konnte nicht registriert werden'
      );
    }
  });

  // Debug-Informationen für die App bereitstellen
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    provide: {
      debug: {
        // Aktuelle Version aus dem zentralen Service importieren
        version: APP_VERSION,
        isDevelopment,
        logEvent: (category: string, action: string, label?: string, value?: number) => {
          if (isDevelopment) {
            let message = `[Debug] Event: ${category} / ${action}`;

            if (label) {
              message += ` / ${label}`;
            }

            if (value !== undefined) {
              message += ` = ${value}`;
            }

            _logger.info(message);
          }
        },
      },
    },
  };
});
