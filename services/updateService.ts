/**
 * Update-Service für die Shopping-List-App
 *
 * Dieser Service ermöglicht die Verwaltung der App-Version und bietet Funktionen
 * zur Erkennung und Anwendung von Updates.
 */

// Aktuelle App-Version (sollte mit package.json übereinstimmen)
export const APP_VERSION = '2.0.1';
const VERSION_STORAGE_KEY = 'app_version';
const LAST_CHECK_KEY = 'last_update_check';

/**
 * Interface für Update-Informationen
 */
export interface IUpdateInfo {
  hasUpdate: boolean;
  oldVersion?: string;
  newVersion?: string;
}

/**
 * Gibt die gespeicherte App-Version zurück
 */
export function getStoredVersion(): string | null {
  return localStorage.getItem(VERSION_STORAGE_KEY);
}

/**
 * Speichert die App-Version im localStorage
 */
export function storeVersion(version: string): void {
  localStorage.setItem(VERSION_STORAGE_KEY, version);
}

/**
 * Prüft, ob ein Update verfügbar ist und erzwingt regelmäßige Cache-Invalidierung für iOS
 */
export function checkForUpdates(): IUpdateInfo {
  const storedVersion = getStoredVersion();
  const now = Date.now();
  const lastCheck = Number(localStorage.getItem(LAST_CHECK_KEY) || '0');

  // Regelmäßige Cache-Invalidierung (alle 24 Stunden)
  // Dies ist besonders wichtig für iOS PWAs
  if (now - lastCheck > 24 * 60 * 60 * 1000) {
    localStorage.setItem(LAST_CHECK_KEY, now.toString());

    // Für iOS: Hard Reload bei längerem Nichtbenutzen der App
    // Dies hilft bei der Umgehung des aggressiven iOS-Cachings
    if (isIOS() && isStandalone()) {
      console.log('Regelmäßige Cache-Invalidierung für iOS PWA...');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

  // Normale Versionsprüfung
  if (!storedVersion || storedVersion !== APP_VERSION) {
    // Update erkannt
    return {
      hasUpdate: true,
      oldVersion: storedVersion ?? 'unbekannt',
      newVersion: APP_VERSION,
    };
  }

  return { hasUpdate: false };
}

/**
 * Wendet ein Update an, indem die Version aktualisiert und die Seite neu geladen wird
 */
export function applyUpdate(): void {
  storeVersion(APP_VERSION);
  clearAllCaches();

  // Für iOS: Hard-Reload verwenden
  if (isIOS()) {
    window.location.href = `${window.location.href.split('#')[0]}?t=${Date.now()}${window.location.hash ?? ''}`;
  } else {
    window.location.reload(true); // true = force-reload from server
  }
}

/**
 * Registriert einen Event-Listener für Service Worker Updates
 */
export function registerServiceWorkerUpdateHandler(): void {
  if ('serviceWorker' in navigator) {
    // Force update check for existing service worker
    if (navigator.serviceWorker.controller) {
      console.log('Forcing Service Worker update check...');
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.update().catch(console.error);
        }
      });
    }

    // Event-Listener für Service Worker Updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Service Worker wurde aktualisiert
      console.log('Service Worker wurde aktualisiert. Seite wird neu geladen...');
      window.location.reload();
    });

    // Registrierung für Service Worker Update-Events
    if (navigator.serviceWorker.controller) {
      console.log('Service Worker aktiv. Update-Handler registriert.');
    }

    // Für iOS: Service Worker regelmäßig neu registrieren
    if (isIOS() && isStandalone()) {
      setInterval(
        () => {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
              registration.update().catch(err => {
                console.error('Fehler beim Update des Service Workers:', err);
              });
            }
          });
        },
        1000 * 60 * 60
      ); // Stündlich
    }
  }
}

/**
 * Sendet eine Nachricht an den Service Worker, um ein Update zu erzwingen
 */
export function forceServiceWorkerUpdate(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        if (registration.waiting) {
          // Sende Nachricht an wartenden Service Worker, um skipWaiting auszulösen
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Auch alle aktuellen Service Worker unregistrieren und neu laden
        registration.unregister().then(() => {
          window.location.reload(true);
        });
      })
      .catch(error => {
        console.error('Fehler beim Aktualisieren des Service Workers:', error);
      });
  }
}

/**
 * Löscht alle Browser-Caches
 */
async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const keys = await window.caches.keys();
      await Promise.all(keys.map(key => window.caches.delete(key)));
      console.log('Alle Caches gelöscht');
    } catch (error) {
      console.error('Fehler beim Löschen der Caches:', error);
    }
  }
}

/**
 * Prüft, ob ein neuer Service Worker auf Aktivierung wartet
 */
export function checkForWaitingServiceWorker(callback: (waiting: boolean) => void): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        if (registration.waiting) {
          // Es gibt einen wartenden Service Worker
          callback(true);
        } else {
          callback(false);
        }
      })
      .catch(() => {
        callback(false);
      });
  } else {
    callback(false);
  }
}

/**
 * Prüft, ob es sich um ein iOS-Gerät handelt
 */
function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Prüft, ob die App im Standalone-Modus (auf dem Homescreen) läuft
 */
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  );
}
