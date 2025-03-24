import { useLocalStorage } from '~/composables/core/useLocalStorage';
import { sortListsByFavorites } from '~/composables/utils/listUtils';
import { createLogger } from '~/utils/logger';

import type { Ref } from 'vue';
import type { ShoppingList, ShoppingItem } from '~/types/app-types';

// Logger initialisieren
const logger = createLogger('useListUpdate');

// Interface für den Rückgabetyp des Composables
interface IListUpdateComposable {
  updateList: (listData: Partial<ShoppingList> & { id: string }) => boolean;
  clearList: (listId?: string) => boolean;
  addItemsToList: (
    listId: string,
    items: ShoppingItem[],
    options?: { replace?: boolean; uniqueCheck?: boolean }
  ) => boolean;
}

/**
 * Composable für das Aktualisieren von Einkaufslisten
 * Bietet Funktionen zum Bearbeiten, Import und Export von Listen
 */
export function useListUpdate(
  listsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>
): IListUpdateComposable {
  const { saveToStorage, createImmutableCopy } = useLocalStorage();

  /**
   * Aktualisiert eine komplette Liste
   * @param listData - Die Daten der zu aktualisierenden Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  const updateList = (listData: Partial<ShoppingList> & { id: string }): boolean => {
    try {
      const listIndex = listsRef.value.findIndex(list => list.id === listData.id);
      if (listIndex === -1) {
        return false;
      }

      // Immutable Update der Liste
      const updatedLists = createImmutableCopy(listsRef.value);

      // Alle übergebenen Eigenschaften einzeln aktualisieren
      const currentList = updatedLists[listIndex];

      if (!currentList) {
        return false;
      }

      if (listData.name !== undefined) {
        currentList.name = listData.name;
      }

      if (listData.templateId !== undefined) {
        currentList.templateId = listData.templateId;
      }

      if (listData.isFavorite !== undefined) {
        currentList.isFavorite = listData.isFavorite;
      }

      if (listData.items !== undefined) {
        currentList.items = listData.items;
      }

      // Änderungsdatum aktualisieren
      currentList.modifiedAt = Date.now();

      // Wenn Liste favorisiert/unfavorisiert wird, neu sortieren
      if (listData.isFavorite !== undefined) {
        // Verwende die gemeinsame Sortierfunktion
        listsRef.value = sortListsByFavorites(updatedLists);
      } else {
        listsRef.value = updatedLists;
      }

      saveToStorage('shoppingLists', listsRef.value);

      return true;
    } catch (error) {
      logger.error('Fehler beim Aktualisieren der Liste:', error);
      return false;
    }
  };

  /**
   * Leert alle Artikel aus einer Liste
   * @param listId - Die ID der zu leerenden Liste (optional, standardmäßig aktuelle Liste)
   * @returns true bei Erfolg, false bei Fehler
   */
  const clearList = (listId?: string): boolean => {
    try {
      const targetListId = listId ?? currentListIdRef.value;
      if (!targetListId) {
        return false;
      }

      const listIndex = listsRef.value.findIndex(list => list.id === targetListId);
      if (listIndex === -1) {
        return false;
      }

      // Immutable Update
      const updatedLists = createImmutableCopy(listsRef.value);
      updatedLists[listIndex].items = [];
      updatedLists[listIndex].modifiedAt = Date.now();

      listsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      logger.error('Fehler beim Leeren der Liste:', error);
      return false;
    }
  };

  /**
   * Fügt Artikel zu einer bestehenden Liste hinzu
   * @param listId - Die ID der Liste
   * @param items - Die hinzuzufügenden Artikel
   * @param options - Optionen für das Hinzufügen (z.B. bestehende ersetzen)
   * @returns true bei Erfolg, false bei Fehler
   */
  const addItemsToList = (
    listId: string,
    items: ShoppingItem[],
    options: { replace?: boolean; uniqueCheck?: boolean } = {}
  ): boolean => {
    try {
      if (!items || (!Array.isArray(items) || items.length === 0)) {
        return false;
      }

      const listIndex = listsRef.value.findIndex(list => list.id === listId);
      if (listIndex === -1) {
        return false;
      }

      // Immutable Update
      const updatedLists = createImmutableCopy(listsRef.value);

      // Bestehende Items ersetzen oder anfügen
      if (options.replace) {
        updatedLists[listIndex].items = [...items];
      } else if (options.uniqueCheck) {
        // Nur neue Items hinzufügen (basierend auf Namen)
        const existingItemNames = new Set(
          updatedLists[listIndex].items.map(item => item.name.toLowerCase())
        );
        const newItems = items.filter(item => !existingItemNames.has(item.name.toLowerCase()));
        updatedLists[listIndex].items = [...updatedLists[listIndex].items, ...newItems];
      } else {
        // Alle Items hinzufügen
        updatedLists[listIndex].items = [...updatedLists[listIndex].items, ...items];
      }

      // Änderungsdatum aktualisieren
      updatedLists[listIndex].modifiedAt = Date.now();

      listsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      logger.error('Fehler beim Hinzufügen von Artikeln zur Liste:', error);
      return false;
    }
  };

  return {
    updateList,
    clearList,
    addItemsToList,
  };
}
