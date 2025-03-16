/**
 * Testskript für die Datenmigration
 *
 * Dieses Skript demonstriert die Migration alter Datenstrukturen in das neue Format.
 * Es kann in der Browser-Konsole ausgeführt werden, um die Migration zu testen.
 */

// Alte Liste simulieren (Format vor Refactoring)
const oldList = {
  id: '1234567890',
  name: 'Alte Testliste',
  items: [
    {
      id: 'item1',
      name: 'Äpfel',
      quantity: 2,
      category: 'Obst & Gemüse',
      checked: false,
      price: 2.99,
    },
    {
      id: 'item2',
      name: 'Milch',
      quantity: 1,
      category: 'Milchprodukte',
      checked: true,
      price: 1.19,
    },
    {
      // Fehlerhafter Eintrag (fehlende Eigenschaften)
      id: 'item3',
      name: 'Fehlerhafter Eintrag',
    },
  ],
};

// Import der Migrationsfunktionen
// Hinweis: In der Browserkonsole muss diese Zeile angepasst werden
// const { migrateList, validateList } = require('./dataMigration');

// Importfunktion für Browserkonsole
async function testMigration() {
  // Pfad zum Modul
  const modulePath =
    '/Users/martinmelcher/Dev/shopping-list-app/composables/utils/dataMigration.ts';

  // In einer echten Anwendung würde hier der Import des Moduls stehen
  console.log('Simuliere Migration der alten Liste:', oldList);

  // Migration mit Validierung simulieren
  const migratedList = {
    ...oldList,
    templateId: 'supermarket',
    isFavorite: false,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    // Kategorien in Objektform konvertieren
    items: oldList.items.map(item => ({
      ...item,
      category: item.category
        ? {
            id:
              (item.category || '').toString().toLowerCase().replace(/[\s&]/g, '_') || 'sonstiges',
            name: item.category || 'Sonstiges',
          }
        : { id: 'sonstiges', name: 'Sonstiges' },
      quantity: item.quantity || 1,
      checked: !!item.checked,
      price: item.price || 0,
      addedAt: Date.now(),
      modifiedAt: Date.now(),
    })),
  };

  console.log('Migrierte Liste:', migratedList);

  // Speichern in localStorage simulieren
  const serializedList = JSON.stringify(migratedList);
  console.log('Serialisierte Liste:', serializedList);
  console.log('Größe der serialisierten Liste:', serializedList.length, 'Bytes');

  return migratedList;
}

// Funktion für manuelle Ausführung in der Konsole
window.testMigration = testMigration;

console.log(
  'Migration-Testskript geladen. Führen Sie testMigration() aus, um die Migration zu testen.'
);
