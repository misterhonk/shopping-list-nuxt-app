/**
 * Debug-Helfer für Einkaufslisten und Artikel
 */

/**
 * Protokolliert den Zustand der aktuellen Listen und die ID der aktuellen Liste
 */
export function logListsState(lists, currentListId) {
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
 * Erweiterte Version der removeItem-Funktion mit Debug-Logging
 */
export function createDebuggedRemoveItem(originalRemoveItem, shoppingListsRef, currentListIdRef, saveToStorage) {
  return function debuggedRemoveItem(item) {
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
    
    // Tiefe Kopie und Entfernen des Items
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));
    const newItems = newLists[listIndex].items.filter(item => item.id !== itemId);
    
    console.log('Items vorher:', newLists[listIndex].items.length);
    console.log('Items nachher:', newItems.length);
    
    newLists[listIndex].items = newItems;
    
    // Update und Speichern
    shoppingListsRef.value = newLists;
    saveToStorage('shoppingLists', newLists);
    
    console.log('Listen nach Update:', newLists.map(l => ({ 
      id: l.id, 
      name: l.name, 
      itemCount: l.items?.length || 0 
    })));
    console.log('=== DEBUG: removeItem Ende ===');
    
    return true;
  };
}
