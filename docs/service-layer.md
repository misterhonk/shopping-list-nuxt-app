# Service-Layer Dokumentation

Diese Dokumentation beschreibt den Service-Layer der Shopping-List-App, der die Geschäftslogik von der UI-Logik trennt.

## Übersicht

Der Service-Layer ist eine Schicht zwischen den Composables und dem Repository, die die Geschäftslogik der Anwendung enthält. Er bietet folgende Vorteile:

- **Trennung von Zuständigkeiten**: UI-Logik und Geschäftslogik sind klar getrennt.
- **Wiederverwendbarkeit**: Geschäftslogik kann in verschiedenen Teilen der App wiederverwendet werden.
- **Testbarkeit**: Services können unabhängig von der UI getestet werden.
- **Wartbarkeit**: Änderungen an der Geschäftslogik betreffen nicht die UI und umgekehrt.

## Architektur

Die Architektur des Service-Layers besteht aus folgenden Komponenten:

1. **Repository**: Abstraktion für den Datenzugriff (z.B. LocalStorage)
2. **Services**: Enthalten die Geschäftslogik und verwenden das Repository
3. **Composables**: Verwenden die Services für den Zugriff auf die Geschäftslogik

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|   Composables  | --> |    Services    | --> |  Repositories  |
|  (UI-Logik)    |     | (Geschäftslogik)|    | (Datenzugriff) |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
```

## Services

### BaseService

Die `BaseService`-Klasse dient als Basisklasse für alle Services und bietet gemeinsame Funktionalitäten:

- **Logger**: Jeder Service hat einen eigenen Logger.
- **Fehlerbehandlung**: Hilfsmethoden für sichere Operationen mit Fehlerbehandlung.

### ShoppingListService

Der `ShoppingListService` ist für die Verwaltung von Einkaufslisten zuständig:

- **Listen laden**: `getAllLists()`
- **Liste erstellen**: `createList(name, options)`
- **Liste aktualisieren**: `updateList(updatedList)`
- **Liste löschen**: `deleteList(listId)`
- **Aktuelle Liste verwalten**: `getCurrentListId()`, `setCurrentListId(listId)`

### ItemService

Der `ItemService` ist für die Verwaltung von Einkaufsartikeln zuständig:

- **Artikel abrufen**: `getItemsByListId(listId)`, `getItemById(listId, itemId)`
- **Artikel hinzufügen**: `addItem(listId, item)`
- **Artikel aktualisieren**: `updateItem(listId, itemId, updates)`
- **Artikel entfernen**: `removeItem(listId, itemId)`
- **Artikelstatus ändern**: `toggleItemChecked(listId, itemId)`
- **Erledigte Artikel entfernen**: `clearCheckedItems(listId)`
- **Berechnungen**: `calculateTotalPrice(listId)`, `calculateCategoryPrice(listId, categoryId)`
- **Gruppierung**: `groupItemsByCategory(listId, categoryNames)`

### CategoryService

Der `CategoryService` ist für die Verwaltung von Kategorien zuständig:

- **Vorlagen abrufen**: `getAllTemplates()`, `getTemplateById(templateId)`
- **Kategorien abrufen**: `getCategoriesByTemplateId(templateId)`, `getActiveCategories()`
- **Aktive Vorlage verwalten**: `getActiveTemplateId()`, `setActiveTemplate(templateId)`
- **Benutzerdefinierte Vorlagen**: `createCustomTemplate(template)`
- **Kategorien aktualisieren**: `updateCategory(templateId, categoryId, updates)`

## Repository

Das Repository ist für den Datenzugriff zuständig und bietet eine einheitliche Schnittstelle unabhängig von der konkreten Implementierung.

### StorageRepository Interface

Das `StorageRepository`-Interface definiert die Schnittstelle für alle Repositories:

- **Daten laden**: `getItem<T>(key)`
- **Daten speichern**: `setItem<T>(key, value)`
- **Daten entfernen**: `removeItem(key)`
- **Prüfen auf Existenz**: `hasItem(key)`
- **Alle Daten löschen**: `clear()`
- **Alle Schlüssel abrufen**: `keys()`

### LocalStorageRepository

Das `LocalStorageRepository` implementiert das `StorageRepository`-Interface mit `localStorage` als Speichermethode.

## Verwendung

### Initialisierung

Services werden über die `initializeServices()` Funktion initialisiert:

```typescript
import { initializeServices } from '~/services';

// In einem Plugin oder Composable
const { shoppingListService, itemService, categoryService } = initializeServices();
```

### Verwendung in Composables

```typescript
// Beispiel: useShoppingLists.ts
import { ref, computed } from 'vue';
import { initializeServices } from '~/services';

export function useShoppingLists() {
  const { shoppingListService } = initializeServices();
  
  // Reaktive Daten
  const lists = ref(shoppingListService.getAllLists());
  const currentListId = ref(shoppingListService.getCurrentListId());
  
  // Berechnete Eigenschaften
  const currentList = computed(() => {
    const id = currentListId.value;
    return id ? shoppingListService.getListById(id) : null;
  });
  
  // Funktionen
  function createList(name, options) {
    const newList = shoppingListService.createList(name, options);
    if (newList) {
      lists.value = shoppingListService.getAllLists();
      return newList;
    }
    return null;
  }
  
  function deleteList(listId) {
    const success = shoppingListService.deleteList(listId);
    if (success) {
      lists.value = shoppingListService.getAllLists();
    }
    return success;
  }
  
  function selectList(listId) {
    const success = shoppingListService.setCurrentListId(listId);
    if (success) {
      currentListId.value = listId;
    }
    return success;
  }
  
  return {
    lists,
    currentListId,
    currentList,
    createList,
    deleteList,
    selectList,
  };
}
```

## Vorteile des Service-Layers

1. **Klare Trennung von Zuständigkeiten**:
   - UI-Logik ist in Composables und Komponenten enthalten.
   - Geschäftslogik ist in Services gekapselt.
   - Datenzugriff ist in Repositories abstrahiert.

2. **Verbesserte Testbarkeit**:
   - Services können isoliert getestet werden.
   - Mocks können für Repository-Zugriffe verwendet werden.
   - UI-Tests können Services mocken und sich auf UI-Logik konzentrieren.

3. **Wiederverwendbarkeit**:
   - Geschäftslogik kann in verschiedenen Teilen der App konsistent verwendet werden.
   - Änderungen an der Geschäftslogik betreffen nicht die UI und umgekehrt.

4. **Flexibilität**:
   - Austausch der Datenzugriffsschicht ohne Änderungen an der Geschäftslogik möglich.
   - Einfache Migration zu anderen Backends (z.B. REST-API, IndexedDB) durch Austausch des Repositories.

5. **Skalierbarkeit**:
   - Neue Features können durch Hinzufügen neuer Services integriert werden.
   - Bestehende Services können erweitert werden, ohne die UI zu beeinflussen.

## Designentscheidungen

### 1. Dependency Injection

Services werden mit ihren Abhängigkeiten erstellt und initialisiert:

- `ShoppingListService` benötigt ein `StorageRepository`.
- `ItemService` benötigt einen `ShoppingListService`.
- `CategoryService` benötigt ein `StorageRepository`.

Diese Dependency Injection ermöglicht Flexibilität und Testbarkeit.

### 2. Singleton-Pattern

Services werden als Singletons über die `initializeServices()` Funktion bereitgestellt, um einen konsistenten Zustand zu gewährleisten.

### 3. Fehlerbehandlung

Alle Services verwenden die `safeOperation` Methode aus der `BaseService`-Klasse für eine konsistente Fehlerbehandlung und Logging.

### 4. Immutable Updates

Alle Datenänderungen erfolgen durch immutable Updates, um unerwartete Seiteneffekte zu vermeiden.
