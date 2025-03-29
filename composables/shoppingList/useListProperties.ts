import { useLocalStorage } from '~/composables/core/useLocalStorage';
import { getItemsCount, _getCheckedItemsCount } from '~/composables/utils/listUtils';
import { createLogger } from '~/utils/logger';

import type { Ref } from 'vue';
import type { IShoppingList } from '~/types/app-types';
import type { IUseListProperties } from '~/types/composable-types';

// Logger initialisieren
const _logger = createLogger('useListProperties');

/**
 * Composable für die Verwaltung von Listeneigenschaften
 * Bietet Funktionen zum Lesen und Aktualisieren von Listeneigenschaften
 *
 * @param listsRef - Referenz auf die Einkaufslisten
 * @param currentListIdRef - Referenz auf die aktuelle Listen-ID
 * @returns Ein Objekt mit Funktionen zur Verwaltung von Listeneigenschaften
 */
export function useListProperties(
  listsRef: Ref<IShoppingList[]>,
  currentListIdRef: Ref<string | null>
): IUseListProperties {
  const { saveToStorage, createImmutableCopy } = useLocalStorage();

  /**
   * Ermittelt die Anzahl der Artikel in der aktuellen Liste
   * @returns Die Anzahl der Artikel
   */
  const getTotalItemsCount = (): number => {
    const currentList = listsRef.value.find(list => list.id === currentListIdRef.value);
    return currentList ? getItemsCount(currentList) : 0;
  };

  /**
   * Ermittelt die Anzahl der erledigten Artikel in der aktuellen Liste
   * @returns Die Anzahl der erledigten Artikel
   */
  const getCheckedItemsCount = (): number => {
    const currentList = listsRef.value.find(list => list.id === currentListIdRef.value);
    return currentList ? _getCheckedItemsCount(currentList) : 0;
  };

  /**
   * Aktualisiert den Namen einer Liste
   * @param newName - Der neue Name der Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  const updateListName = (newName: string): boolean => {
    try {
      if (!newName || newName.trim() === '') {
        return false;
      }

      const listIndex = listsRef.value.findIndex(list => list.id === currentListIdRef.value);
      if (listIndex === -1) {
        return false;
      }

      // Immutable Update
      const updatedLists = createImmutableCopy(listsRef.value);

      if (!updatedLists[listIndex]) {
        return false;
      }

      updatedLists[listIndex].name = newName.trim();
      updatedLists[listIndex].modifiedAt = Date.now();

      listsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      _logger.error('Fehler beim Aktualisieren des Listennamens:', error);
      return false;
    }
  };

  /**
   * Aktualisiert den Favoriten-Status einer Liste
   * @param isFavorite - Der neue Favoriten-Status
   * @returns true bei Erfolg, false bei Fehler
   */
  const updateListFavorite = (isFavorite: boolean): boolean => {
    try {
      const listIndex = listsRef.value.findIndex(list => list.id === currentListIdRef.value);
      if (listIndex === -1) {
        return false;
      }

      // Immutable Update
      const updatedLists = createImmutableCopy(listsRef.value);

      if (!updatedLists[listIndex]) {
        return false;
      }

      updatedLists[listIndex].isFavorite = isFavorite;
      updatedLists[listIndex].modifiedAt = Date.now();

      // Sortiere Listen - Favoriten zuerst
      updatedLists.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) {
          return -1;
        }
        if (!a.isFavorite && b.isFavorite) {
          return 1;
        }
        return 0;
      });

      listsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      _logger.error('Fehler beim Aktualisieren des Favoriten-Status:', error);
      return false;
    }
  };

  return {
    getItemsCount,
    getCheckedItemsCount,
    getTotalItemsCount,
    updateListName,
    updateListFavorite,
  };
}
