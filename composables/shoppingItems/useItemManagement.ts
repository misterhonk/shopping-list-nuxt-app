import { computed, Ref } from 'vue';

import { useLocalStorage } from '../core/useLocalStorage';
import { ShoppingList, ShoppingItem, Category } from '../types';

/**
 * Composable für die Verwaltung von Artikeln
 * Bietet Funktionen zum Hinzufügen, Entfernen und Markieren von Artikeln
 */
export function useItemManagement(
  shoppingListsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>
) {
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
    const grouped: Record<string, ShoppingItem[]> = {};

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

    // Für jede Kategorie ein Array erstellen (auch wenn leer)
    categories.forEach(category => {
      grouped[category] = [];
    });

    // Dann Elemente in die entsprechenden Kategorien einsortieren
    currentList.items.forEach(item => {
      const category = item.category || 'Sonstiges';
      const categoryName = typeof category === 'object' ? category.name : category;

      if (grouped[categoryName]) {
        grouped[categoryName].push(item);
      } else {
        // Wenn die Kategorie nicht mehr existiert, zum Punkt "Sonstiges" hinzufügen
        if (!grouped.Sonstiges) {
          grouped.Sonstiges = [];
        }
        grouped.Sonstiges.push(item);
      }
    });

    return grouped;
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
      !(itemData.quantity && itemData.quantity > 0)
    ) {
      return null;
    }

    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) {
      return null;
    }

    const newItemObj: ShoppingItem = {
      id: itemData.id || Date.now().toString(), // Vorhandene ID verwenden oder neue erstellen
      name: itemData.name,
      quantity: itemData.quantity || 1,
      category: itemData.category || 'Sonstiges',
      checked: itemData.checked || false,
      price: itemData.price || 0,
      addedAt: Date.now(),
      modifiedAt: Date.now(),
    };

    // Immutable Update der Listen mit dem neuen Item
    const updatedLists = createImmutableCopy(shoppingListsRef.value);

    // Sicherstellen, dass items existiert
    if (!Array.isArray(updatedLists[listIndex].items)) {
      updatedLists[listIndex].items = [];
    }

    // Item hinzufügen
    updatedLists[listIndex].items.push(newItemObj);
    updatedLists[listIndex].modifiedAt = Date.now();

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

      if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
        return false;
      }

      // Prüfen, ob das Item existiert
      const itemExists = shoppingListsRef.value[listIndex].items.some(item => item.id === itemId);
      if (!itemExists) {
        return false;
      }

      // Immutable Update mit Filter
      const updatedLists = createImmutableCopy(shoppingListsRef.value);
      updatedLists[listIndex].items = updatedLists[listIndex].items.filter(
        item => item.id !== itemId
      );
      updatedLists[listIndex].modifiedAt = Date.now();

      // Update und Speichern
      shoppingListsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      console.error('Fehler beim Entfernen des Items:', error);
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

      if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
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
      console.error('Fehler beim Ändern des Artikel-Status:', error);
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

      if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
        return false;
      }

      // Immutable Update mit Filter
      const updatedLists = createImmutableCopy(shoppingListsRef.value);

      // Filter auf die Items anwenden
      updatedLists[listIndex].items = updatedLists[listIndex].items.filter(item => !item.checked);
      updatedLists[listIndex].modifiedAt = Date.now();

      // Update und Speichern
      shoppingListsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der erledigten Artikel:', error);
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
        if (!Array.isArray(list.items)) {
          return;
        }

        // Flacher Vergleich, um zu prüfen, ob Items geändert wurden
        const originalItems = list.items;

        // Alle Items in der Liste durchgehen
        updatedLists[listIndex].items = list.items.map(item => {
          // Normalisierte Prüfung für Kategorie-ID
          let matchFound = false;

          if (item.category) {
            if (typeof item.category === 'object' && item.category.id === categoryId) {
              matchFound = true;
            } else if (typeof item.category === 'string') {
              // Fallback für alte Kategorieformate
              const normalizedCategoryId = item.category.toLowerCase().replace(/[\s&]/g, '_');
              if (normalizedCategoryId === categoryId) {
                matchFound = true;
              }
            }
          }

          // Wenn Match gefunden, Kategorie aktualisieren
          if (matchFound) {
            updatedAnyItem = true;
            return {
              ...item,
              category: {
                id: categoryId,
                name: newName,
              },
              modifiedAt: Date.now(),
            };
          }

          return item;
        });

        // Nur die Liste als geändert markieren, wenn Items geändert wurden
        if (updatedLists[listIndex].items !== originalItems) {
          updatedLists[listIndex].modifiedAt = Date.now();
        }
      });

      // Nur speichern, wenn Änderungen vorgenommen wurden
      if (updatedAnyItem) {
        shoppingListsRef.value = updatedLists;
        saveToStorage('shoppingLists', updatedLists);
      }

      return updatedAnyItem;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kategorienamen:', error);
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
