import { computed } from 'vue';
import { useLocalStorage } from '../core/useLocalStorage';

/**
 * Composable für die Verwaltung von Einkaufslisten-Eigenschaften
 * Bietet Funktionen zum Aktualisieren von Namen und Favoriten-Status
 */
export function useListProperties(lists, currentListId) {
  const { saveToStorage } = useLocalStorage();
  
  /**
   * Ermittelt die Anzahl der Artikel in einer Liste
   * @param {object} list - Die zu prüfende Liste
   * @return {number} - Die Anzahl der Artikel
   */
  const getItemsCount = (list) => {
    return Array.isArray(list?.items) ? list.items.length : 0;
  };

  /**
   * Ermittelt die Anzahl der erledigten Artikel in der aktuellen Liste
   * @return {number} - Die Anzahl der erledigten Artikel
   */
  const getCheckedItemsCount = () => {
    const currentList = lists.value.find(list => list.id === currentListId.value);
    return Array.isArray(currentList?.items) 
      ? currentList.items.filter(item => item.checked).length 
      : 0;
  };

  /**
   * Ermittelt die Gesamtanzahl der Artikel in der aktuellen Liste
   * @return {number} - Die Gesamtanzahl der Artikel
   */
  const getTotalItemsCount = () => {
    const currentList = lists.value.find(list => list.id === currentListId.value);
    return Array.isArray(currentList?.items) 
      ? currentList.items.length 
      : 0;
  };
  
  /**
   * Aktualisiert den Namen einer Liste
   * @param {string} newName - Der neue Name der Liste
   */
  const updateListName = (newName) => {
    if (!newName || newName.trim() === '') return;
    
    const listIndex = lists.value.findIndex(list => list.id === currentListId.value);
    if (listIndex === -1) return;
    
    // Tiefe Kopie der Listen erstellen
    const newLists = JSON.parse(JSON.stringify(lists.value));
    newLists[listIndex].name = newName.trim();
    lists.value = newLists;
    
    saveToStorage('shoppingLists', lists.value);
  };
  
  /**
   * Aktualisiert den Favoriten-Status einer Liste
   * @param {boolean} isFavorite - Der neue Favoriten-Status
   */
  const updateListFavorite = (isFavorite) => {
    const listIndex = lists.value.findIndex(list => list.id === currentListId.value);
    if (listIndex === -1) return;
    
    // Tiefe Kopie der Listen erstellen
    const newLists = JSON.parse(JSON.stringify(lists.value));
    newLists[listIndex].isFavorite = isFavorite;
    
    // Sortiere Listen - Favoriten zuerst
    newLists.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
    
    lists.value = newLists;
    saveToStorage('shoppingLists', lists.value);
  };

  return {
    // Funktionen
    getItemsCount,
    getCheckedItemsCount,
    getTotalItemsCount,
    updateListName,
    updateListFavorite
  };
}