import { computed } from 'vue';

import { useLocalStorage } from '~/composables/core/useLocalStorage';
import {
  createItemObject,
  itemBelongsToCategory,
  updateItemCategory,
  groupItemsByCategory,
} from '~/composables/utils/itemUtils';
import { createLogger } from '~/utils/logger';

import type { Ref } from 'vue';
import type { ShoppingList, ShoppingItem } from '~/types/app-types';

// Logger initialisieren
const logger = createLogger('useItemManagement');

// Definieren der Return-Type für useItemManagement
interface ItemManagementComposable {
  allItems: Ref<ShoppingItem[]>;
  getItemsGrouped: (categories: string[]) => Record<string, ShoppingItem[]>;
  addItem: (itemData: Partial<ShoppingItem>) => ShoppingItem | null;
  removeItem: (item: ShoppingItem | string) => boolean;
  toggleItemChecked: (item: ShoppingItem | string) => boolean;
  clearCheckedItems: () => boolean;
  updateCategoryInItems: (categoryId: string, newName: string) => boolean;
}

/**
 * Composable für die Verwaltung von Artikeln
 * Bietet Funktionen zum Hinzufügen, Entfernen und Markieren von Artikeln
 */
export function useItemManagement(
  shoppingListsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>
): ItemManagementComposable {
  const { saveToStorage, createImmutableCopy } = useLocalStorage();

  /**
   * Gibt alle Artikel der aktuellen Liste zurück
   */
  const allItems = computed<ShoppingItem[]>(() => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    if (!currentList || !Array.isArray(currentList.items)) {
      return [];
    }
    return currentList.items;
  });

  /**
   * Gruppiert Artikel nach Kategorien
   */
  const getItemsGrouped = (categories: string[]): Record<string, ShoppingItem[]> => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);

    // Prüfen, ob items ein gültiges Array ist
    if (!currentList || !Array.isArray(currentList.items)) {
      return categories.reduce(
        (obj, cat) => {
          obj[cat] = [];
          return obj;
        },
        {} as Record<string, ShoppingItem[]>
      );
    }

    return groupItemsByCategory(currentList.items, categories);
  };

  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu
   * @param itemData - Daten des neuen Artikels
   * @returns Das hinzugefügte Item oder null bei Fehler
   */
  const addItem = (itemData: Partial<ShoppingItem>): ShoppingItem | null => {
    // Prüfen, ob die Daten gültig sind
    if (
      !itemData.name || 
      itemData.name.trim() === '' || 
      !(itemData.quantity !== undefined && itemData.quantity > 0)
    ) {
      return null;
    }

    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) {
      return null;
    }

    const newItemObj = createItemObject(itemData);

    // Immutable Update der Listen mit dem neuen Item
    const updatedLists = createImmutableCopy(shoppingListsRef.value);

    // Sicherstellen, dass items existiert
    if (!updatedLists[listIndex] || !Array.isArray(updatedLists[listIndex].items)) {
      // Sicherstellen, dass listIndex existiert
      if (updatedLists[listIndex]) {
        updatedLists[listIndex].items = [];
      } else {
        return null; // Liste existiert nicht mehr
      }
    }

    // Item hinzufügen
    if (updatedLists[listIndex] && Array.isArray(updatedLists[listIndex].items)) {
      updatedLists[listIndex].items.push(newItemObj);
      updatedLists[listIndex].modifiedAt = Date.now();
    } else {
      return null; // Liste oder items existieren nicht
    }

    // Update der Listen-Referenz und Speichern
    shoppingListsRef.value = updatedLists;
    saveToStorage('shoppingLists', updatedLists);

    return newItemObj;
  };

  /**
   * Entfernt einen Artikel aus der aktuellen Liste
   * @param item - Das Item oder die ID des zu entfernenden Artikels
   * @returns true bei Erfolg, false bei Fehler
   */
  const removeItem = (item: ShoppingItem | string): boolean => {
    try {
      // Item-ID aus dem Parameter extrahieren
      const itemId = typeof item === 'object' ? item.id : item;

      const listIndex = shoppingListsRef.value.findIndex(
        list => list.id === currentListIdRef.value
      );
      if (listIndex === -1) {
        return false;
      }

      if (!shoppingListsRef.value[listIndex] || !Array.isArray(shoppingListsRef.value[listIndex].items)) {
        return false;
      }

      // Prüfen, ob das Item existiert
      if (!shoppingListsRef.value[listIndex] || !Array.isArray(shoppingListsRef.value[listIndex].items)) {
        return false;
      }
      
      const itemExists = shoppingListsRef.value[listIndex].items.some(item => item.id === itemId);
      if (!itemExists) {
        return false;
      }

      // Immutable Update mit Filter
      const updatedLists = createImmutableCopy(shoppingListsRef.value);
      
      // Sicherstellen, dass Liste und items existieren
      if (!updatedLists[listIndex] || !Array.isArray(updatedLists[listIndex].items)) {
        return false;
      }
      
      updatedLists[listIndex].items = updatedLists[listIndex].items.filter(
        item => item.id !== itemId
      );
      updatedLists[listIndex].modifiedAt = Date.now();

      // Update und Speichern
      shoppingListsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      logger.error('Fehler beim Entfernen des Items:', error);
      return false;
    }
  };

  /**
   * Ändert den Markierungsstatus eines Artikels
   * @param item - Das Item oder die ID des zu ändernden Artikels
   * @returns true bei Erfolg, false bei Fehler
   */
  const toggleItemChecked = (item: ShoppingItem | string): boolean => {
    try {
      // Item-ID aus dem Parameter extrahieren
      const itemId = typeof item === 'object' ? item.id : item;

      const listIndex = shoppingListsRef.value.findIndex(
        list => list.id === currentListIdRef.value
      );
      if (listIndex === -1) {
        return false;
      }

      if (!shoppingListsRef.value[listIndex] || !Array.isArray(shoppingListsRef.value[listIndex].items)) {
        return false;
      }

      // Nullcheck auf Liste
      if (!shoppingListsRef.value[listIndex]) {
        return false;
      }
      
      const itemIndex = shoppingListsRef.value[listIndex].items.findIndex(
        item => item.id === itemId
      );
      if (itemIndex === -1) {
        return false;
      }

      // Immutable Update mit Map
      const updatedLists = createImmutableCopy(shoppingListsRef.value);

      // Sicherstellen, dass Liste und items existieren
      if (!updatedLists[listIndex] || !Array.isArray(updatedLists[listIndex].items)) {
        return false;
      }

      // Nur das betroffene Item aktualisieren
      updatedLists[listIndex].items = updatedLists[listIndex].items.map((item, index) => {
        if (index === itemIndex) {
          return {
            ...item,
            checked: !item.checked,
            modifiedAt: Date.now(),
          };
        }
        return item;
      });

      updatedLists[listIndex].modifiedAt = Date.now();

      // Update und Speichern
      shoppingListsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      logger.error('Fehler beim Ändern des Artikel-Status:', error);
      return false;
    }
  };

  /**
   * Entfernt alle erledigten Artikel aus der aktuellen Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  const clearCheckedItems = (): boolean => {
    try {
      const listIndex = shoppingListsRef.value.findIndex(
        list => list.id === currentListIdRef.value
      );
      if (listIndex === -1) {
        return false;
      }

      if (!shoppingListsRef.value[listIndex] || !Array.isArray(shoppingListsRef.value[listIndex].items)) {
        return false;
      }

      // Immutable Update mit Filter
      const updatedLists = createImmutableCopy(shoppingListsRef.value);

      // Sicherstellen, dass Liste und items existieren
      if (!updatedLists[listIndex] || !Array.isArray(updatedLists[listIndex].items)) {
        return false;
      }

      // Filter auf die Items anwenden
      updatedLists[listIndex].items = updatedLists[listIndex].items.filter(item => !item.checked);
      updatedLists[listIndex].modifiedAt = Date.now();

      // Update und Speichern
      shoppingListsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      logger.error('Fehler beim Löschen der erledigten Artikel:', error);
      return false;
    }
  };

  /**
   * Aktualisiert den Kategorienamen in allen Artikeln
   * @param categoryId - Die ID der zu aktualisierenden Kategorie
   * @param newName - Der neue Name der Kategorie
   * @returns true bei Erfolg, false bei Fehler
   */
  const updateCategoryInItems = (categoryId: string, newName: string): boolean => {
    if (!categoryId || !newName) {
      return false;
    }

    try {
      let updatedAnyItem = false;

      // Immutable Update aller Listen
      const updatedLists = createImmutableCopy(shoppingListsRef.value);

      // Jede Liste durchgehen und Items aktualisieren
      updatedLists.forEach((list, listIndex) => {
        if (!Array.isArray(list.items) || !updatedLists[listIndex]) {
          return;
        }

        // Flacher Vergleich, um zu prüfen, ob Items geändert wurden
        const originalItems = list.items;

        // Alle Items in der Liste durchgehen
        if (updatedLists[listIndex]) {
          updatedLists[listIndex].items = list.items.map(item => {
            const matchFound = itemBelongsToCategory(item, categoryId);

            // Wenn Match gefunden, Kategorie aktualisieren
            if (matchFound) {
              updatedAnyItem = true;
              return updateItemCategory(item, categoryId, newName);
            }

            return item;
          });

          // Nur die Liste als geändert markieren, wenn Items geändert wurden
          if (updatedLists[listIndex].items !== originalItems) {
            updatedLists[listIndex].modifiedAt = Date.now();
          }
        }
      });

      // Nur speichern, wenn Änderungen vorgenommen wurden
      if (updatedAnyItem) {
        shoppingListsRef.value = updatedLists;
        saveToStorage('shoppingLists', updatedLists);
      }

      return updatedAnyItem;
    } catch (error) {
      logger.error('Fehler beim Aktualisieren der Kategorienamen:', error);
      return false;
    }
  };

  return {
    // Berechnete Eigenschaften
    allItems,
    getItemsGrouped,

    // Aktionen
    addItem,
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    updateCategoryInItems,
  };
}
