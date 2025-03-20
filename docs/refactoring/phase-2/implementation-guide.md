# Implementierungsleitfaden: Phase 2 Refactoring

Dieses Dokument enthält detaillierte Anleitungen zur Implementierung der in der To-Do-Liste definierten Aufgaben für Phase 2 des Refactorings.

## 1. Vereinfachung komplexer Funktionen

### 1.1 Erstellung von `utils/listOperations.ts`

Diese Datei soll gemeinsame Basisfunktionen für die Verwaltung von Listen und Items enthalten, um Code-Duplizierung zu vermeiden und die Codequalität zu verbessern.

```typescript
// utils/listOperations.ts

import type { ShoppingList, ShoppingItem } from '../types';

/**
 * Findet den Index einer Liste in einem Array von Listen
 * @param lists - Array der Einkaufslisten
 * @param listId - ID der zu findenden Liste
 * @returns Index der Liste oder -1 wenn nicht gefunden
 */
export const findListIndex = (lists: ShoppingList[], listId: string): number => {
  return lists.findIndex(list => list.id === listId);
};

/**
 * Findet den Index eines Items in einer Liste
 * @param list - Einkaufsliste
 * @param itemId - ID des zu findenden Items
 * @returns Index des Items oder -1 wenn nicht gefunden
 */
export const findItemIndex = (list: ShoppingList, itemId: string): number => {
  if (!Array.isArray(list.items)) {
    return -1;
  }
  return list.items.findIndex(item => item.id === itemId);
};

/**
 * Aktualisiert ein Item in einer Liste
 * @param lists - Array aller Listen
 * @param listId - ID der Liste, die das Item enthält
 * @param itemId - ID des zu aktualisierenden Items
 * @param updateFn - Funktion, die das Item aktualisiert
 * @returns Neue Kopie der Listen mit aktualisiertem Item oder null bei Fehler
 */
export const updateItemInList = <T extends ShoppingItem>(
  lists: ShoppingList[],
  listId: string,
  itemId: string,
  updateFn: (item: T) => T
): ShoppingList[] | null => {
  const listIndex = findListIndex(lists, listId);
  if (listIndex === -1) return null;
  
  const list = lists[listIndex];
  if (!Array.isArray(list.items)) return null;
  
  const itemIndex = findItemIndex(list, itemId);
  if (itemIndex === -1) return null;
  
  // Immutable Update
  const updatedLists = [...lists];
  updatedLists[listIndex] = {
    ...list,
    items: list.items.map((item, index) => 
      index === itemIndex ? updateFn(item as T) : item
    ),
    modifiedAt: Date.now()
  };
  
  return updatedLists;
};

/**
 * Entfernt ein Item aus einer Liste
 * @param lists - Array aller Listen
 * @param listId - ID der Liste, aus der das Item entfernt werden soll
 * @param itemId - ID des zu entfernenden Items
 * @returns Neue Kopie der Listen ohne das Item oder null bei Fehler
 */
export const removeItemFromList = (
  lists: ShoppingList[],
  listId: string,
  itemId: string
): ShoppingList[] | null => {
  const listIndex = findListIndex(lists, listId);
  if (listIndex === -1) return null;
  
  const list = lists[listIndex];
  if (!Array.isArray(list.items)) return null;
  
  // Prüfen, ob das Item existiert
  if (!list.items.some(item => item.id === itemId)) return null;
  
  // Immutable Update
  const updatedLists = [...lists];
  updatedLists[listIndex] = {
    ...list,
    items: list.items.filter(item => item.id !== itemId),
    modifiedAt: Date.now()
  };
  
  return updatedLists;
};

/**
 * Fügt ein Item zu einer Liste hinzu
 * @param lists - Array aller Listen
 * @param listId - ID der Liste, zu der das Item hinzugefügt werden soll
 * @param item - Das hinzuzufügende Item
 * @returns Neue Kopie der Listen mit dem neuen Item oder null bei Fehler
 */
export const addItemToList = (
  lists: ShoppingList[],
  listId: string,
  item: ShoppingItem
): ShoppingList[] | null => {
  const listIndex = findListIndex(lists, listId);
  if (listIndex === -1) return null;
  
  const list = lists[listIndex];
  
  // Immutable Update
  const updatedLists = [...lists];
  updatedLists[listIndex] = {
    ...list,
    items: Array.isArray(list.items) ? [...list.items, item] : [item],
    modifiedAt: Date.now()
  };
  
  return updatedLists;
};

/**
 * Aktualisiert eine Einkaufsliste
 * @param lists - Array aller Listen
 * @param listId - ID der zu aktualisierenden Liste
 * @param updateFn - Funktion, die die Liste aktualisiert
 * @returns Neue Kopie der Listen mit der aktualisierten Liste oder null bei Fehler
 */
export const updateList = (
  lists: ShoppingList[],
  listId: string,
  updateFn: (list: ShoppingList) => ShoppingList
): ShoppingList[] | null => {
  const listIndex = findListIndex(lists, listId);
  if (listIndex === -1) return null;
  
  // Immutable Update
  const updatedLists = [...lists];
  updatedLists[listIndex] = updateFn(lists[listIndex]);
  
  return updatedLists;
};
```

### 1.2 Refaktorierung von `useShoppingItems.ts`

Die Funktionen in `useShoppingItems.ts` sollten die neuen Basisfunktionen aus `listOperations.ts` verwenden, um die Komplexität zu reduzieren und die Wartbarkeit zu verbessern.

Bei der Refaktorierung sollten Funktionen wie `addItem`, `removeItem` und `toggleItemChecked` vereinfacht werden, indem sie die Basisfunktionen aus `listOperations.ts` verwenden.

### 1.3 Refaktorierung von `useListManagement.ts`

Ähnlich wie bei `useShoppingItems.ts` sollten die Funktionen in `useListManagement.ts` die neuen Basisfunktionen verwenden.

## 2. TypeScript strenger konfigurieren

### 2.1 Erweiterte ESLint-Regeln für TypeScript

Die `.eslintrc.json`-Datei sollte mit folgenden Regeln erweitert werden:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      "allowExpressions": true,
      "allowTypedFunctionExpressions": true
    }],
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/consistent-type-imports": ["error", {
      "prefer": "type-imports"
    }]
  }
}
```

## 3. Interfaces für alle Datenstrukturen definieren

### 3.1 UI-Status-Interfaces definieren

Erstellen Sie eine neue Datei `types/uiTypes.ts` mit folgenden Interfaces:

```typescript
// types/uiTypes.ts

import type { ShoppingItem, Category } from '../composables/types';

/**
 * Status für Formular-Zustände
 */
export type FormStatus = 'idle' | 'editing' | 'submitting' | 'error';

/**
 * Interface für den Zustand des Artikel-Formulars
 */
export interface ItemFormState {
  status: FormStatus;
  item: Partial<ShoppingItem>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

/**
 * Interface für Filter-Optionen
 */
export interface ListFilterOptions {
  showChecked: boolean;
  categoryFilter: string | null;
  searchQuery: string;
  sortOrder: 'name' | 'category' | 'price' | 'added';
}
```

## 4. Core-Funktionalität klarer isolieren

### 4.1 Service-Layer einführen

Erstellen Sie ein neues Verzeichnis `services/` und implementieren Sie Services für die Kernfunktionalität.

```typescript
// services/ShoppingListService.ts

import type { ShoppingList, CreateListOptions } from '../composables/types';
import type { StorageRepository } from '../repositories/StorageRepository';

/**
 * Service für die Verwaltung von Einkaufslisten
 * Enthält reine Geschäftslogik ohne UI-Abhängigkeiten
 */
export class ShoppingListService {
  private repository: StorageRepository;
  
  constructor(repository: StorageRepository) {
    this.repository = repository;
  }
  
  /**
   * Lädt alle Listen aus dem Speicher
   */
  public getAllLists(): ShoppingList[] {
    const lists = this.repository.getItem<ShoppingList[]>('shoppingLists') || [];
    return lists.map(this.normalizeList);
  }
  
  /**
   * Erstellt eine neue Liste
   */
  public createList(name: string, options: CreateListOptions = {}): ShoppingList {
    // Implementierung...
  }
  
  // Weitere Methoden...
  
  /**
   * Normalisiert eine Liste
   */
  private normalizeList(list: Partial<ShoppingList>): ShoppingList {
    // Implementierung...
  }
}
```

### 4.2 Storage-Repository implementieren

Erstellen Sie ein neues Verzeichnis `repositories/` und implementieren Sie ein Repository für den Datenzugriff.

```typescript
// repositories/StorageRepository.ts

/**
 * Interface für einheitlichen Datenzugriff
 */
export interface StorageRepository {
  /**
   * Lädt ein Element aus dem Speicher
   * @param key - Schlüssel des Elements
   * @returns Das geladene Element oder null
   */
  getItem<T>(key: string): T | null;
  
  /**
   * Speichert ein Element im Speicher
   * @param key - Schlüssel des Elements
   * @param value - Das zu speichernde Element
   */
  setItem<T>(key: string, value: T): void;
  
  /**
   * Entfernt ein Element aus dem Speicher
   * @param key - Schlüssel des Elements
   */
  removeItem(key: string): void;
}
```

```typescript
// repositories/LocalStorageRepository.ts

import type { StorageRepository } from './StorageRepository';

/**
 * Implementierung des StorageRepository mit localStorage
 */
export class LocalStorageRepository implements StorageRepository {
  /**
   * Lädt ein Element aus dem localStorage
   * @param key - Schlüssel des Elements
   * @returns Das geladene Element oder null
   */
  public getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) as T : null;
    } catch (error) {
      console.error(`Fehler beim Laden aus dem localStorage (Schlüssel: ${key}):`, error);
      return null;
    }
  }
  
  /**
   * Speichert ein Element im localStorage
   * @param key - Schlüssel des Elements
   * @param value - Das zu speichernde Element
   */
  public setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Fehler beim Speichern im localStorage (Schlüssel: ${key}):`, error);
    }
  }
  
  /**
   * Entfernt ein Element aus dem localStorage
   * @param key - Schlüssel des Elements
   */
  public removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Fehler beim Entfernen aus dem localStorage (Schlüssel: ${key}):`, error);
    }
  }
}
```

## Hinweise zur Implementierung

1. **Schrittweise vorgehen**: Implementieren Sie jede Funktion einzeln und testen Sie sie, bevor Sie weitergehen.
2. **Versionskontrolle**: Führen Sie häufige, kleine Commits durch, um den Fortschritt zu verfolgen.
3. **Dokumentation**: Dokumentieren Sie jede Funktion mit JSDoc-Kommentaren.
4. **Tests**: Schreiben Sie Tests für kritische Funktionen.
5. **Rückwärtskompatibilität**: Stellen Sie sicher, dass bestehende Funktionalität nicht beeinträchtigt wird.
