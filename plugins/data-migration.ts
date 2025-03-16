import { migrateLists, validateList } from '../composables/utils/dataMigration';
import { createLogger } from '../utils/logger';

import { defineNuxtPlugin } from '#app';

// Logger initialisieren
const logger = createLogger('data-migration');

/**
 * Plugin zur Migration älterer Datenstrukturen
 * Stellt sicher, dass vorhandene Daten beim App-Start in das aktuelle Format konvertiert werden
 */
export default defineNuxtPlugin(nuxtApp => {
  // Bei App-Start ausführen
  logger.info('[Data Migration] Plugin gestartet');

  // Migration nur durchführen, wenn localStorage gefüllt ist
  try {
    const storedLists = localStorage.getItem('shoppingLists');

    if (storedLists) {
      logger.info('[Data Migration] Vorhandene Daten gefunden, prüfe auf Migrationsnotwendigkeit');

      // Daten parsen
      const lists = JSON.parse(storedLists);

      // Prüfen, ob die Listen bereits im neuen Format sind
      const needsMigration =
        Array.isArray(lists) &&
        lists.some(
          list =>
            // Kriterien für Migrationsbedarf
            !Object.prototype.hasOwnProperty.call(list, 'createdAt') ||
            !Object.prototype.hasOwnProperty.call(list, 'modifiedAt') ||
            (Array.isArray(list.items) &&
              list.items.some(
                item =>
                  typeof item.category === 'string' ||
                  !Object.prototype.hasOwnProperty.call(item, 'addedAt')
              ))
        );

      if (needsMigration) {
        logger.info('[Data Migration] Migration wird durchgeführt');

        // Migration durchführen
        const migratedLists = migrateLists(lists);

        // Zurück in localStorage speichern
        localStorage.setItem('shoppingLists', JSON.stringify(migratedLists));

        logger.info('[Data Migration] Migration abgeschlossen');
      } else {
        logger.info(
          '[Data Migration] Keine Migration notwendig, Daten bereits im aktuellen Format'
        );
      }
    } else {
      logger.info('[Data Migration] Keine Daten gefunden, keine Migration notwendig');
    }
  } catch (error) {
    logger.error('[Data Migration] Fehler bei der Datenmigration:', error);
  }

  return {
    provide: {
      // Hilfsfunktion zur manuellen Migration
      migrateData: () => {
        try {
          const storedLists = localStorage.getItem('shoppingLists');

          if (storedLists) {
            const lists = JSON.parse(storedLists);
            const migratedLists = migrateLists(lists);
            localStorage.setItem('shoppingLists', JSON.stringify(migratedLists));
            return { success: true, count: migratedLists.length };
          }

          return { success: false, message: 'Keine Daten gefunden' };
        } catch (error) {
          logger.error('[Data Migration] Fehler bei manueller Migration:', error);
          return { success: false, error };
        }
      },
    },
  };
});
