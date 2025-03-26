import { useLocalStorage } from '~/composables/core/useLocalStorage';
import { sortListsByFavorites } from '~/composables/utils/listUtils';
import { createLogger } from '~/utils/logger';
import type { Ref } from 'vue';
import type { IShoppingList, IShoppingItem } from '~/types/app-types';
import type { IUseListUpdate } from '~/types/composable-types';

// Logger initialisieren
const _logger = createLogger('useListUpdate');

/**
 * Composable für das Aktualisieren von Einkaufslisten
 * Bietet Funktionen zum Bearbeiten, Import und Export von Listen
 * 
 * @param listsRef - Referenz auf die Einkaufslisten
 * @param currentListIdRef - Referenz auf die aktuelle Listen-ID
 * @returns Ein Objekt mit Funktionen zur Aktualisierung von Einkaufslisten
 */
export function useListUpdate(
  listsRef: Ref<IShoppingList[]>,
  currentListIdRef: Ref<string | null>
): IUseListUpdate {
  const { saveToStorage, createImmutableCopy } = useLocalStorage();

  /**
   * Aktualisiert eine komplette Liste
   * @param listData - Die Daten der zu aktualisierenden Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  const updateList = (listData: Partial<IShoppingList> & { id: string }): boolean => {
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
      _logger.error('Fehler beim Aktualisieren der Liste:', error);
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
      _logger.error('Fehler beim Leeren der Liste:', error);
      return false;
    }
  };

  /**
   * Fügt Artikel zu einer bestehenden Liste hinzu
   * @param listId - Die ID der Liste
   * @param items - Die hinzuzufügenden Artikel
   * @param options - Optionen für das Hinzufügen
   * @returns true bei Erfolg, false bei Fehler
   */
  const addItemsToList = (
    listId: string,
    items: IShoppingItem[],
    options: { skipDuplicates?: boolean } = {}
  ): boolean => {
    try {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return false;
      }

      const listIndex = listsRef.value.findIndex(list => list.id === listId);
      if (listIndex === -1) {
        return false;
      }

      // Immutable Update
      const updatedLists = createImmutableCopy(listsRef.value);

      // Nur neue Items hinzufügen (basierend auf Namen) wenn skipDuplicates aktiviert ist
      if (options.skipDuplicates) {
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
      _logger.error('Fehler beim Hinzufügen von Artikeln zur Liste:', error);
      return false;
    }
  };

  return {
    updateList,
    clearList,
    addItemsToList,
  };
}