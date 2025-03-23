import { defineNuxtPlugin } from 'nuxt/app';

import {
  APP_VERSION,
  getStoredVersion,
  storeVersion,
  registerServiceWorkerUpdateHandler,
} from '~/services/updateService';

/**
 * Dieses Plugin initialisiert die Versionsprüfung und überwacht Service Worker Updates
 */
export default defineNuxtPlugin(() => {
  // Nur client-seitig ausführen, da localStorage benötigt wird
  if (process.client) {
    const storedVersion = getStoredVersion();

    // Wenn keine Version gespeichert ist, aktuell laufende Version speichern
    if (!storedVersion) {
      storeVersion(APP_VERSION);
      console.log(`App-Version ${APP_VERSION} initialisiert`);
    } else if (storedVersion !== APP_VERSION) {
      console.log(`App-Update erkannt: ${storedVersion} -> ${APP_VERSION}`);
    }

    // Service Worker Update-Handler registrieren
    registerServiceWorkerUpdateHandler();
  }
});
