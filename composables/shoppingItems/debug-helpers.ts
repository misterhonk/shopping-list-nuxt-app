import { createLogger } from '~/utils/logger';

import type { Ref } from 'vue';
import type { ShoppingList, ShoppingItem } from '~/types/app-types';

// Logger initialisieren
const _logger = createLogger('debug-helpers');

/**
 * Debug-Helfer für Einkaufslisten und Artikel
 */

/**
 * Protokolliert den Zustand der aktuellen Listen und die ID der aktuellen Liste
 */
export function logListsState(lists: IIShoppingList[], currentListId: string | null): void {
  __logger.info('=== DEBUG: Listen-Status ===');
  _logger.info(
    'Aktuelle Listen:',
    lists.map(l => ({
      id: l.id,
      name: l.name,
      itemCount: l.items.length ?? 0,
    }))
  );
  _logger.info('Aktuelle Listen-ID:', currentListId);
  _logger.info(
    'Aktuelle Liste gefunden:',
    lists.some(l => l.id === currentListId)
  );
  _logger.info('==========================');
}

/**
 * Erweiterte Version der removeItem-Funktion mit Debug-Logging
 */
export function createDebuggedRemoveItem(
  originalRemoveItem: (item: IShoppingItem | string) => boolean,
  shoppingListsRef: Ref<IShoppingList[]>,
  currentListIdRef: Ref<string | null>,
  saveToStorage: (key: string, value: unknown) => void
): (item: IShoppingItem | string) => boolean {
  return function debuggedRemoveItem(item: IShoppingItem | string): boolean {
    // Item-ID aus dem Parameter extrahieren (falls ein Objekt übergeben wurde)
    const itemId = typeof item === 'object' ? item.id : item;

    __logger.info('=== DEBUG: removeItem aufgerufen ===');
    _logger.info('Zu entfernendes Item:', itemId);

    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    _logger.info('Aktuelle Listen-ID:', currentListIdRef.value);
    _logger.info('Gefundener Listenindex:', listIndex);

    if (listIndex === -1) {
      logger.error('FEHLER: Liste nicht gefunden!');
      logListsState(shoppingListsRef.value, currentListIdRef.value);
      return false;
    }

    const currentList = shoppingListsRef.value[listIndex];
    _logger.info('Liste vor Entfernen:', {
      id: currentList.id,
      name: currentList.name,
      itemCount: currentList.items.length ?? 0,
    });

    if (!Array.isArray(currentList.items)) {
      _logger.error('FEHLER: Liste hat keine items Array!');
      return false;
    }

    // Prüfen, ob das Item existiert
    const itemIndex = currentList.items.findIndex(item => item.id === itemId);
    _logger.info('Item-Index in Liste:', itemIndex);

    if (itemIndex === -1) {
      _logger.error('FEHLER: Item nicht in Liste gefunden!');

      // Alle Items der Liste anzeigen für Debugging
      _logger.info('Alle Items in der Liste:');
      currentList.items.forEach((item, idx) => {
        _logger.info(`  [${idx}] ID: ${item.id}, Name: ${item.name}`);
      });

      return false;
    }

    // Tiefe Kopie und Entfernen des Items
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));
    const newItems = newLists[listIndex].items.filter((item: IShoppingItem) => item.id !== itemId);

    _logger.info('Items vorher:', newLists[listIndex].items.length);
    _logger.info('Items nachher:', newItems.length);

    newLists[listIndex].items = newItems;

    // Update und Speichern
    shoppingListsRef.value = newLists;
    saveToStorage('shoppingLists', newLists);

    _logger.info(
      'Listen nach Update:',
      newLists.map((l: IShoppingList) => ({
        id: l.id,
        name: l.name,
        itemCount: l.items.length ?? 0,
      }))
    );
    _logger.info('=== DEBUG: removeItem Ende ===');

    return true;
  };
}
