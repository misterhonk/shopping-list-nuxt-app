import { computed } from 'vue';
import { useLocalStorage } from '../core/useLocalStorage';

/**
 * Composable für die Verwaltung von Artikeln
 * Bietet Funktionen zum Hinzufügen, Entfernen und Markieren von Artikeln
 */
export function useItemManagement(shoppingListsRef, currentListIdRef) {
  const { saveToStorage } = useLocalStorage();

  /**
   * Gibt alle Artikel der aktuellen Liste zurück
   */
  const allItems = computed(() => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    if (!currentList || !Array.isArray(currentList.items)) {
      return [];
    }
    return currentList.items;
  });
  
  /**
   * Gruppiert Artikel nach Kategorien
   */
  const getItemsGrouped = (categories) => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    const grouped = {};
    
    // Prüfen, ob items ein gültiges Array ist
    if (!currentList || !Array.isArray(currentList.items)) {
      return categories.reduce((obj, cat) => { obj[cat] = []; return obj; }, {});
    }
    
    // Für jede Kategorie ein Array erstellen (auch wenn leer)
    categories.forEach(category => {
      grouped[category] = [];
    });
    
    // Dann Elemente in die entsprechenden Kategorien einsortieren
    currentList.items.forEach(item => {
      const category = item.category || 'Sonstiges';
      const categoryId = typeof category === 'object' ? category.id : 'sonstiges';
      const categoryName = typeof category === 'object' ? category.name : category;
      
      if (grouped[categoryName]) {
        grouped[categoryName].push(item);
      } else {
        // Wenn die Kategorie nicht mehr existiert, zum Punkt "Sonstiges" hinzufügen
        if (!grouped['Sonstiges']) {
          grouped['Sonstiges'] = [];
        }
        grouped['Sonstiges'].push(item);
      }
    });
    
    return grouped;
  };
  
  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu
   * @param {object} itemData - Daten des neuen Artikels
   * @return {object|null} Das hinzugefügte Item oder null bei Fehler
   */
  const addItem = (itemData) => {
    // Prüfen, ob die Daten gültig sind
    if (!itemData.name || itemData.name.trim() === '' || !(itemData.quantity > 0)) {
      return null;
    }
    
    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) return null;
    
    const newItemObj = {
      id: itemData.id || Date.now().toString(), // Vorhandene ID verwenden oder neue erstellen
      name: itemData.name,
      quantity: itemData.quantity,
      category: itemData.category,
      checked: itemData.checked || false,
      price: itemData.price || 0
    };
    
    // Tiefe Kopie der Liste erstellen
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));
    
    // Sicherstellen, dass items existiert
    if (!Array.isArray(newLists[listIndex].items)) {
      newLists[listIndex].items = [];
    }
    
    // Item hinzufügen
    newLists[listIndex].items.push(newItemObj);
    
    // Update der Listen-Referenz und Speichern
    shoppingListsRef.value = newLists;
    saveToStorage('shoppingLists', newLists);
    
    return newItemObj;
  };
  
  /**
   * Entfernt einen Artikel aus der aktuellen Liste
   * @param {object|string} item - Das Item oder die ID des zu entfernenden Artikels
   * @return {boolean} true bei Erfolg, false bei Fehler
   */
  const removeItem = (item) => {
    // Item-ID aus dem Parameter extrahieren (falls ein Objekt übergeben wurde)
    const itemId = typeof item === 'object' ? item.id : item;
    
    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) return false;
    
    if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
      return false;
    }
    
    // Prüfen, ob das Item existiert
    const itemIndex = shoppingListsRef.value[listIndex].items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;
    
    // Tiefe Kopie und Entfernen des Items
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));
    newLists[listIndex].items = newLists[listIndex].items.filter(item => item.id !== itemId);
    
    // Update und Speichern
    shoppingListsRef.value = newLists;
    saveToStorage('shoppingLists', newLists);
    
    return true;
  };
  
  /**
   * Ändert den Markierungsstatus eines Artikels
   * @param {object|string} item - Das Item oder die ID des zu ändernden Artikels
   * @return {boolean} true bei Erfolg, false bei Fehler
   */
  const toggleItemChecked = (item) => {
    // Item-ID aus dem Parameter extrahieren (falls ein Objekt übergeben wurde)
    const itemId = typeof item === 'object' ? item.id : item;
    
    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) return false;
    
    if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
      return false;
    }
    
    const itemIndex = shoppingListsRef.value[listIndex].items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;
    
    // Tiefe Kopie und Ändern des Status
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));
    newLists[listIndex].items[itemIndex].checked = !newLists[listIndex].items[itemIndex].checked;
    
    // Update und Speichern
    shoppingListsRef.value = newLists;
    saveToStorage('shoppingLists', newLists);
    
    return true;
  };
  
  /**
   * Entfernt alle erledigten Artikel aus der aktuellen Liste
   * @return {boolean} true bei Erfolg, false bei Fehler
   */
  const clearCheckedItems = () => {
    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) return false;
    
    if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
      return false;
    }
    
    // Tiefe Kopie und Filtern der nicht erledigten Items
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));
    newLists[listIndex].items = newLists[listIndex].items.filter(item => !item.checked);
    
    // Update und Speichern
    shoppingListsRef.value = newLists;
    saveToStorage('shoppingLists', newLists);
    
    return true;
  };

  return {
    // Berechnete Eigenschaften
    allItems,
    getItemsGrouped,
    
    // Aktionen
    addItem,
    removeItem,
    toggleItemChecked,
    clearCheckedItems
  };
}