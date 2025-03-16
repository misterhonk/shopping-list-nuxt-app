import { migrateLists, validateList } from '../composables/utils/dataMigration';

import { defineNuxtPlugin } from '#app';

/**
 * Plugin zur Migration älterer Datenstrukturen
 * Stellt sicher, dass vorhandene Daten beim App-Start in das aktuelle Format konvertiert werden
 */
export default defineNuxtPlugin(nuxtApp => {
  // Bei App-Start ausführen
  console.log('[Data Migration] Plugin gestartet');

  // Migration nur durchführen, wenn localStorage gefüllt ist
  try {
    const storedLists = localStorage.getItem('shoppingLists');

    if (storedLists) {
      console.log('[Data Migration] Vorhandene Daten gefunden, prüfe auf Migrationsnotwendigkeit');

      // Daten parsen
      const lists = JSON.parse(storedLists);

      // Prüfen, ob die Listen bereits im neuen Format sind
      const needsMigration =
        Array.isArray(lists) &&
        lists.some(
          list =>
            // Kriterien für Migrationsbedarf
            !list.hasOwnProperty('createdAt') ||
            !list.hasOwnProperty('modifiedAt') ||
            (Array.isArray(list.items) &&
              list.items.some(
                item => typeof item.category === 'string' || !item.hasOwnProperty('addedAt')
              ))
        );

      if (needsMigration) {
        console.log('[Data Migration] Migration wird durchgeführt');

        // Migration durchführen
        const migratedLists = migrateLists(lists);

        // Zurück in localStorage speichern
        localStorage.setItem('shoppingLists', JSON.stringify(migratedLists));

        console.log('[Data Migration] Migration abgeschlossen');
      } else {
        console.log(
          '[Data Migration] Keine Migration notwendig, Daten bereits im aktuellen Format'
        );
      }
    } else {
      console.log('[Data Migration] Keine Daten gefunden, keine Migration notwendig');
    }
  } catch (error) {
    console.error('[Data Migration] Fehler bei der Datenmigration:', error);
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
          console.error('[Data Migration] Fehler bei manueller Migration:', error);
          return { success: false, error };
        }
      },
    },
  };
});
