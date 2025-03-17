import { createLogger } from '../../utils/logger';
import { useLocalStorage } from '../core/useLocalStorage';

import type { ShoppingList } from '../types';
import type { Ref } from 'vue';

// Logger initialisieren
const logger = createLogger('useListProperties');

/**
 * Composable für die Verwaltung von Listeneigenschaften
 * Bietet Funktionen zum Lesen und Aktualisieren von Listeneigenschaften
 */
export function useListProperties(
  listsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>
) {
  const { saveToStorage, createImmutableCopy } = useLocalStorage();

  /**
   * Ermittelt die Anzahl der Artikel in einer Liste
   * @param list - Die zu prüfende Liste
   * @returns Die Anzahl der Artikel
   */
  const getItemsCount = (list: ShoppingList): number =>
    Array.isArray(list?.items) ? list.items.length : 0;

  /**
   * Ermittelt die Anzahl der erledigten Artikel in der aktuellen Liste
   * @returns Die Anzahl der erledigten Artikel
   */
  const getCheckedItemsCount = (): number => {
    const currentList = listsRef.value.find(list => list.id === currentListIdRef.value);
    return Array.isArray(currentList?.items)
      ? currentList.items.filter(item => item.checked).length
      : 0;
  };

  /**
   * Ermittelt die Gesamtanzahl der Artikel in der aktuellen Liste
   * @returns Die Gesamtanzahl der Artikel
   */
  const getTotalItemsCount = (): number => {
    const currentList = listsRef.value.find(list => list.id === currentListIdRef.value);
    return Array.isArray(currentList?.items) ? currentList.items.length : 0;
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
      updatedLists[listIndex].name = newName.trim();
      updatedLists[listIndex].modifiedAt = Date.now();

      listsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);

      return true;
    } catch (error) {
      logger.error('Fehler beim Aktualisieren des Listennamens:', error);
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
      logger.error('Fehler beim Aktualisieren des Favoriten-Status:', error);
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
