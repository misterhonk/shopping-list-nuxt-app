import { Ref } from 'vue';

import { createLogger } from '../../utils/logger';
import { ShoppingList, ShoppingItem } from '../types';

// Logger initialisieren
const logger = createLogger('debug-helpers');

/**
 * Debug-Helfer für Einkaufslisten und Artikel
 */

/**
 * Protokolliert den Zustand der aktuellen Listen und die ID der aktuellen Liste
 */
export function logListsState(lists: ShoppingList[], currentListId: string | null): void {
  logger.info('=== DEBUG: Listen-Status ===');
  logger.info(
    'Aktuelle Listen:',
    lists.map(l => ({
      id: l.id,
      name: l.name,
      itemCount: l.items?.length || 0,
    }))
  );
  logger.info('Aktuelle Listen-ID:', currentListId);
  logger.info(
    'Aktuelle Liste gefunden:',
    lists.some(l => l.id === currentListId)
  );
  logger.info('==========================');
}

/**
 * Erweiterte Version der removeItem-Funktion mit Debug-Logging
 */
export function createDebuggedRemoveItem(
  originalRemoveItem: (item: ShoppingItem | string) => boolean,
  shoppingListsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>,
  saveToStorage: (key: string, value: unknown) => void
): (item: ShoppingItem | string) => boolean {
  return function debuggedRemoveItem(item: ShoppingItem | string): boolean {
    // Item-ID aus dem Parameter extrahieren (falls ein Objekt übergeben wurde)
    const itemId = typeof item === 'object' ? item.id : item;

    logger.info('=== DEBUG: removeItem aufgerufen ===');
    logger.info('Zu entfernendes Item:', itemId);

    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    logger.info('Aktuelle Listen-ID:', currentListIdRef.value);
    logger.info('Gefundener Listenindex:', listIndex);

    if (listIndex === -1) {
      logger.error('FEHLER: Liste nicht gefunden!');
      logListsState(shoppingListsRef.value, currentListIdRef.value);
      return false;
    }

    const currentList = shoppingListsRef.value[listIndex];
    logger.info('Liste vor Entfernen:', {
      id: currentList.id,
      name: currentList.name,
      itemCount: currentList.items?.length || 0,
    });

    if (!Array.isArray(currentList.items)) {
      logger.error('FEHLER: Liste hat keine items Array!');
      return false;
    }

    // Prüfen, ob das Item existiert
    const itemIndex = currentList.items.findIndex(item => item.id === itemId);
    logger.info('Item-Index in Liste:', itemIndex);

    if (itemIndex === -1) {
      logger.error('FEHLER: Item nicht in Liste gefunden!');

      // Alle Items der Liste anzeigen für Debugging
      logger.info('Alle Items in der Liste:');
      currentList.items.forEach((item, idx) => {
        logger.info(`  [${idx}] ID: ${item.id}, Name: ${item.name}`);
      });

      return false;
    }

    // Tiefe Kopie und Entfernen des Items
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));
    const newItems = newLists[listIndex].items.filter((item: ShoppingItem) => item.id !== itemId);

    logger.info('Items vorher:', newLists[listIndex].items.length);
    logger.info('Items nachher:', newItems.length);

    newLists[listIndex].items = newItems;

    // Update und Speichern
    shoppingListsRef.value = newLists;
    saveToStorage('shoppingLists', newLists);

    logger.info(
      'Listen nach Update:',
      newLists.map((l: ShoppingList) => ({
        id: l.id,
        name: l.name,
        itemCount: l.items?.length || 0,
      }))
    );
    logger.info('=== DEBUG: removeItem Ende ===');

    return true;
  };
}
