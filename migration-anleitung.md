# Migration-Anleitung

Diese Anleitung beschreibt, wie die bestehenden Komponenten auf die neuen, refactorisierten Composables migriert werden können.

## 1. Überblick

Die alten Composables werden durch die neuen, modularisierten Versionen ersetzt:

| Alt | Neu |
|-----|-----|
| `useShoppingLists.js` | `composables/shoppingList/index.ts` |
| `useShoppingItems.js` | `composables/shoppingItems/index.ts` |
| `useLocalStorage.js` | `composables/core/useLocalStorage.ts` |
| `useListExport.js` | `composables/importExport/index.ts` |

## 2. Importe aktualisieren

Alle Importe sollten über die zentrale Export-Datei erfolgen:

```javascript
// Alt
import { useShoppingLists } from '../composables/useShoppingLists';
import { useShoppingItems } from '../composables/useShoppingItems';

// Neu
import { useShoppingLists, useShoppingItems, useListImportExport } from '../composables';
```

## 3. Typisierung nutzen

Verwenden Sie die neuen TypeScript-Definitionen:

```typescript
import { ShoppingList, ShoppingItem, Category } from '../composables';

// Beispiel für typisierte Daten
const newList: ShoppingList = {
  id: Date.now().toString(),
  name: 'Neue Liste',
  items: [],
  templateId: 'supermarket',
  isFavorite: false
};
```

## 4. Refactorte Komponenten testen

Führen Sie die folgenden Schritte durch, um die migrierten Komponenten zu testen:

1. Erstellen Sie ein Backup Ihrer bisherigen Komponenten.
2. Passen Sie die Komponenten an die neuen Schnittstellen an.
3. Testen Sie die wichtigsten Funktionen:
   - Listen erstellen, umbenennen und löschen
   - Artikel hinzufügen, entfernen und abhaken
   - Kategorie-Updates
   - Import/Export von Listen

## 5. Migration der index.vue

Wenn Sie die `index.vue` migrieren, beachten Sie:

1. Importieren Sie die neuen Composables über die zentrale Export-Datei
2. Passen Sie die Funktionsaufrufe an die neuen Namen und Parameter an
3. Nutzen Sie die verbesserten Fehlermeldungen und Statusrückmeldungen

Beispiel:

```javascript
// Alt
const { 
  lists,
  currentListId,
  currentList,
  initialized,
  loadLists,
  createList,
  // ...
} = useShoppingLists();

// Neu
const { 
  lists,
  currentListId,
  currentList,
  initialized,
  loadLists,
  createList,
  // ...
} = useShoppingLists();
```

Die Basis-API wurde absichtlich ähnlich gehalten, um die Migration zu erleichtern.

## 6. Kategorie-Verwaltung anpassen

Die Kategorie-Verwaltung hat sich geändert:

```javascript
// Alt (String-basierte Kategorien)
const newItem = {
  name: 'Äpfel',
  quantity: 2,
  category: 'Obst & Gemüse',
  price: 2.99
};

// Neu (Objekt-basierte Kategorien)
const newItem = {
  name: 'Äpfel',
  quantity: 2,
  category: {
    id: 'obst_gemuese',
    name: 'Obst & Gemüse'
  },
  price: 2.99
};
```

Alte String-Kategorien werden automatisch migriert.

## 7. Fehlerbehandlung

Die neuen Composables bieten eine verbesserte Fehlerbehandlung:

```javascript
// Altes Muster
const result = addItem(newItem);
if (result) {
  // Erfolg
} else {
  // Fehler
}

// Neues Muster
try {
  const result = addItem(newItem);
  if (result) {
    // Erfolg
  } else {
    // Validierungsfehler
  }
} catch (error) {
  console.error('Fehler beim Hinzufügen des Artikels:', error);
  // Fehlerbehandlung
}
```

## 8. Deep Copy und Immutabilität

Die alte Methode mit `JSON.parse(JSON.stringify())` wurde ersetzt:

```javascript
// Alt
const newLists = JSON.parse(JSON.stringify(lists.value));
// ... ändern ...
lists.value = newLists;

// Neu
// Automatische Immutabilität in den Funktionen
updateListName('Neuer Name');

// Bei Bedarf manuell
const { createImmutableCopy } = useLocalStorage();
const copy = createImmutableCopy(myObject);
```

## 9. Automatische Datenmigration

Vorhandene Daten werden beim App-Start automatisch migriert:

- Das Plugin `data-migration.ts` führt die Migration durch
- Alte Datenformate werden erkannt und aktualisiert
- Es ist keine manuelle Aktion erforderlich

Bei Bedarf kann die Migration manuell ausgelöst werden:

```javascript
const { $migrateData } = useNuxtApp();
const result = $migrateData();
console.log('Migration durchgeführt:', result);
```

## 10. Schrittweise Migration

Die Migration kann schrittweise erfolgen:

1. Zuerst die Kern-Komponenten (`index.vue`) migrieren
2. Dann die einzelnen Feature-Komponenten anpassen
3. Die alten Dateien erst entfernen, wenn die Migration abgeschlossen ist

## 11. Checkliste

- [ ] Importe aktualisiert
- [ ] Komponenten an neue API angepasst
- [ ] Typen verwendet (TypeScript)
- [ ] Kategorie-Verwaltung aktualisiert
- [ ] Fehlerbehandlung verbessert
- [ ] Tests durchgeführt und validiert
- [ ] Alte Dateien entfernt
