import { Ref } from 'vue';
import { ShoppingList, ShoppingItem } from '../types';

/**
 * Debug-Helfer für Einkaufslisten und Artikel
 */

/**
 * Protokolliert den Zustand der aktuellen Listen und die ID der aktuellen Liste
 * @param lists - Die Listen
 * @param currentListId - Die ID der aktuellen Liste
 */
export function logListsState(lists: ShoppingList[], currentListId: string | null): void {
  console.log('=== DEBUG: Listen-Status ===');
  console.log('Aktuelle Listen:', lists.map(l => ({ 
    id: l.id, 
    name: l.name, 
    itemCount: l.items?.length || 0,
  })));
  console.log('Aktuelle Listen-ID:', currentListId);
  console.log('Aktuelle Liste gefunden:', lists.some(l => l.id === currentListId));
  console.log('==========================');
}

/**
 * Typ-Definition für die removeItem-Funktion
 */
type RemoveItemFunction = (item: ShoppingItem | string) => boolean;

/**
 * Typ-Definition für die saveToStorage-Funktion
 */
type SaveToStorageFunction = (key: string, data: any) => boolean;

/**
 * Erweiterte Version der removeItem-Funktion mit Debug-Logging
 * @param originalRemoveItem - Die ursprüngliche Funktion
 * @param shoppingListsRef - Referenz auf die Einkaufslisten
 * @param currentListIdRef - Referenz auf die aktuelle Listen-ID
 * @param saveToStorage - Funktion zum Speichern in den Storage
 * @returns Die erweiterte Funktion
 */
export function createDebuggedRemoveItem(
  originalRemoveItem: RemoveItemFunction,
  shoppingListsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>,
  saveToStorage: SaveToStorageFunction
): RemoveItemFunction {
  return function debuggedRemoveItem(item: ShoppingItem | string): boolean {
    // Item-ID aus dem Parameter extrahieren (falls ein Objekt übergeben wurde)
    const itemId = typeof item === 'object' ? item.id : item;
    
    console.log('=== DEBUG: removeItem aufgerufen ===');
    console.log('Zu entfernendes Item:', itemId);
    
    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    console.log('Aktuelle Listen-ID:', currentListIdRef.value);
    console.log('Gefundener Listenindex:', listIndex);
    
    if (listIndex === -1) {
      console.error('FEHLER: Liste nicht gefunden!');
      logListsState(shoppingListsRef.value, currentListIdRef.value);
      return false;
    }
    
    const currentList = shoppingListsRef.value[listIndex];
    console.log('Liste vor Entfernen:', { 
      id: currentList.id, 
      name: currentList.name, 
      itemCount: currentList.items?.length || 0 
    });
    
    if (!Array.isArray(currentList.items)) {
      console.error('FEHLER: Liste hat keine items Array!');
      return false;
    }
    
    // Prüfen, ob das Item existiert
    const itemIndex = currentList.items.findIndex(item => item.id === itemId);
    console.log('Item-Index in Liste:', itemIndex);
    
    if (itemIndex === -1) {
      console.error('FEHLER: Item nicht in Liste gefunden!');
      
      // Alle Items der Liste anzeigen für Debugging
      console.log('Alle Items in der Liste:');
      currentList.items.forEach((item, idx) => {
        console.log(`  [${idx}] ID: ${item.id}, Name: ${item.name}`);
      });
      
      return false;
    }
    
    // Direkt die originale Funktion aufrufen
    const result = originalRemoveItem(item);
    
    console.log('Listen nach Update:', shoppingListsRef.value.map(l => ({ 
      id: l.id, 
      name: l.name, 
      itemCount: l.items?.length || 0 
    })));
    console.log('=== DEBUG: removeItem Ende ===');
    console.log('Ergebnis:', result);
    
    return result;
  };
}
