import { createLogger } from '~/utils/logger';

import type { ShoppingList, ShoppingItem } from '../../types';

// Logger initialisieren
const logger = createLogger('listOperations');

/**
 * Findet den Index einer Liste in einem Array von Listen
 * @param lists - Array der Einkaufslisten
 * @param listId - ID der zu findenden Liste
 * @returns Index der Liste oder -1 wenn nicht gefunden
 */
export const findListIndex = (lists: ShoppingList[], listId: string): number => {
  if (!Array.isArray(lists) || !listId) {
    return -1;
  }
  return lists.findIndex(list => list.id === listId);
};

/**
 * Findet eine Liste in einem Array von Listen
 * @param lists - Array der Einkaufslisten
 * @param listId - ID der zu findenden Liste
 * @returns Die gefundene Liste oder null wenn nicht gefunden
 */
export const findListById = (lists: ShoppingList[], listId: string): ShoppingList | null => {
  if (!Array.isArray(lists) || !listId) {
    return null;
  }
  return lists.find(list => list.id === listId) || null;
};

/**
 * Findet den Index eines Items in einer Liste
 * @param list - Einkaufsliste
 * @param itemId - ID des zu findenden Items
 * @returns Index des Items oder -1 wenn nicht gefunden
 */
export const findItemIndex = (list: ShoppingList, itemId: string): number => {
  if (!list || !Array.isArray(list.items) || !itemId) {
    return -1;
  }
  return list.items.findIndex(item => item.id === itemId);
};

/**
 * Findet ein Item in einer Liste
 * @param list - Einkaufsliste
 * @param itemId - ID des zu findenden Items
 * @returns Das gefundene Item oder null wenn nicht gefunden
 */
export const findItemById = (list: ShoppingList, itemId: string): ShoppingItem | null => {
  if (!list || !Array.isArray(list.items) || !itemId) {
    return null;
  }
  return list.items.find(item => item.id === itemId) || null;
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
  if (listIndex === -1) {
    logger.error(`Liste mit ID ${listId} nicht gefunden.`);
    return null;
  }
  
  const list = lists[listIndex];
  if (!Array.isArray(list.items)) {
    logger.error(`Items der Liste mit ID ${listId} sind kein Array.`);
    return null;
  }
  
  const itemIndex = findItemIndex(list, itemId);
  if (itemIndex === -1) {
    logger.error(`Item mit ID ${itemId} nicht gefunden.`);
    return null;
  }
  
  try {
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
  } catch (error) {
    logger.error(`Fehler beim Aktualisieren des Items mit ID ${itemId}:`, error);
    return null;
  }
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
  if (listIndex === -1) {
    logger.error(`Liste mit ID ${listId} nicht gefunden.`);
    return null;
  }
  
  const list = lists[listIndex];
  if (!Array.isArray(list.items)) {
    logger.error(`Items der Liste mit ID ${listId} sind kein Array.`);
    return null;
  }
  
  // Prüfen, ob das Item existiert
  if (!list.items.some(item => item.id === itemId)) {
    logger.error(`Item mit ID ${itemId} nicht gefunden.`);
    return null;
  }
  
  try {
    // Immutable Update
    const updatedLists = [...lists];
    updatedLists[listIndex] = {
      ...list,
      items: list.items.filter(item => item.id !== itemId),
      modifiedAt: Date.now()
    };
    
    return updatedLists;
  } catch (error) {
    logger.error(`Fehler beim Entfernen des Items mit ID ${itemId}:`, error);
    return null;
  }
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
  if (listIndex === -1) {
    logger.error(`Liste mit ID ${listId} nicht gefunden.`);
    return null;
  }
  
  const list = lists[listIndex];
  
  try {
    // Immutable Update
    const updatedLists = [...lists];
    updatedLists[listIndex] = {
      ...list,
      items: Array.isArray(list.items) ? [...list.items, item] : [item],
      modifiedAt: Date.now()
    };
    
    return updatedLists;
  } catch (error) {
    logger.error(`Fehler beim Hinzufügen eines Items zur Liste mit ID ${listId}:`, error);
    return null;
  }
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
  if (listIndex === -1) {
    logger.error(`Liste mit ID ${listId} nicht gefunden.`);
    return null;
  }
  
  try {
    // Immutable Update
    const updatedLists = [...lists];
    updatedLists[listIndex] = updateFn({
      ...lists[listIndex],
      modifiedAt: Date.now()
    });
    
    return updatedLists;
  } catch (error) {
    logger.error(`Fehler beim Aktualisieren der Liste mit ID ${listId}:`, error);
    return null;
  }
};

/**
 * Aktualisiert mehrere Items in einer Liste basierend auf einem Filterkriterium
 * @param lists - Array aller Listen
 * @param listId - ID der Liste, in der die Items aktualisiert werden sollen
 * @param filterFn - Funktion, die bestimmt, welche Items aktualisiert werden sollen
 * @param updateFn - Funktion, die das Item aktualisiert
 * @returns Neue Kopie der Listen mit aktualisierten Items oder null bei Fehler
 */
export const updateItemsInList = <T extends ShoppingItem>(
  lists: ShoppingList[],
  listId: string,
  filterFn: (item: T) => boolean,
  updateFn: (item: T) => T
): ShoppingList[] | null => {
  const listIndex = findListIndex(lists, listId);
  if (listIndex === -1) {
    logger.error(`Liste mit ID ${listId} nicht gefunden.`);
    return null;
  }
  
  const list = lists[listIndex];
  if (!Array.isArray(list.items)) {
    logger.error(`Items der Liste mit ID ${listId} sind kein Array.`);
    return null;
  }
  
  try {
    // Immutable Update
    const updatedLists = [...lists];
    updatedLists[listIndex] = {
      ...list,
      items: list.items.map(item => 
        filterFn(item as T) ? updateFn(item as T) : item
      ),
      modifiedAt: Date.now()
    };
    
    return updatedLists;
  } catch (error) {
    logger.error(`Fehler beim Aktualisieren mehrerer Items in der Liste mit ID ${listId}:`, error);
    return null;
  }
};

/**
 * Entfernt mehrere Items aus einer Liste basierend auf einem Filterkriterium
 * @param lists - Array aller Listen
 * @param listId - ID der Liste, aus der die Items entfernt werden sollen
 * @param filterFn - Funktion, die bestimmt, welche Items entfernt werden sollen
 * @returns Neue Kopie der Listen ohne die gefilterten Items oder null bei Fehler
 */
export const removeItemsFromList = <T extends ShoppingItem>(
  lists: ShoppingList[],
  listId: string,
  filterFn: (item: T) => boolean
): ShoppingList[] | null => {
  const listIndex = findListIndex(lists, listId);
  if (listIndex === -1) {
    logger.error(`Liste mit ID ${listId} nicht gefunden.`);
    return null;
  }
  
  const list = lists[listIndex];
  if (!Array.isArray(list.items)) {
    logger.error(`Items der Liste mit ID ${listId} sind kein Array.`);
    return null;
  }
  
  try {
    // Immutable Update
    const updatedLists = [...lists];
    updatedLists[listIndex] = {
      ...list,
      items: list.items.filter(item => !filterFn(item as T)),
      modifiedAt: Date.now()
    };
    
    return updatedLists;
  } catch (error) {
    logger.error(`Fehler beim Entfernen mehrerer Items aus der Liste mit ID ${listId}:`, error);
    return null;
  }
};
