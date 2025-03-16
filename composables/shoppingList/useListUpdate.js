import { useLocalStorage } from '../core/useLocalStorage';

/**
 * Composable zum Aktualisieren von bestehenden Listen
 */
export function useListUpdate(lists, currentListId) {
  const { saveToStorage } = useLocalStorage();

  /**
   * Aktualisiert eine bestehende Liste
   * 
   * @param {string} listId - ID der zu aktualisierenden Liste 
   * @param {array} items - Neue Items (optional, wenn nur leeren)
   * @param {string} templateId - Neue Template-ID (optional)
   * @returns {boolean} Erfolg der Aktualisierung
   */
  const updateList = (listId, items = null, templateId = null) => {
    const listIndex = lists.value.findIndex(list => list.id === listId);
    if (listIndex === -1) {
      console.error(`Liste mit ID ${listId} nicht gefunden`);
      return false;
    }

    const updatedLists = JSON.parse(JSON.stringify(lists.value));
    
    // Wenn items explizit übergeben wurden, diese setzen
    if (items !== null) {
      updatedLists[listIndex].items = items;
    }
    
    // Falls Template-ID übergeben, diese aktualisieren
    if (templateId) {
      updatedLists[listIndex].templateId = templateId;
    }
    
    // Listen aktualisieren und speichern
    lists.value = updatedLists;
    saveToStorage('shoppingLists', lists.value);
    
    return true;
  };

  /**
   * Leert alle Elemente einer Liste
   * 
   * @param {string} listId - ID der zu leerenden Liste
   * @returns {boolean} Erfolg des Löschens
   */
  const clearList = (listId) => {
    return updateList(listId, []);
  };

  return {
    updateList,
    clearList
  };
}
