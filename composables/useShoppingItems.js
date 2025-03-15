import { reactive, ref, computed } from 'vue';
import { useLocalStorage } from './useLocalStorage';

/**
 * Composable für die Verwaltung von Artikeln in Einkaufslisten
 * Bietet Funktionen zum Hinzufügen, Bearbeiten, Löschen und Markieren von Artikeln
 */
export function useShoppingItems(shoppingListsRef, currentListIdRef) {
  const { saveToStorage } = useLocalStorage();
  
  // UI-Status für Artikelformular
  const isAddingItem = ref(false);
  const itemNameInput = ref(null);
  
  // Neues Item Formular
  const newItem = reactive({
    name: '',
    quantity: 1,
    category: 'Sonstiges'
  });
  
  // Berechnete Eigenschaften
  const isFormValid = computed(() => {
    return newItem.name && newItem.name.trim() !== '' && newItem.quantity > 0;
  });
  
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
      if (grouped[category]) {
        grouped[category].push(item);
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
   * @return {object|null} Das hinzugefügte Item oder null bei Fehler
   */
  const addItem = () => {
    if (!isFormValid.value) return null;
    
    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) return null;
    
    const newItemObj = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity,
      category: newItem.category,
      checked: false
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
    
    // Formular zurücksetzen
    resetItemForm();
    
    return newItemObj;
  };
  
  /**
   * Entfernt einen Artikel aus der aktuellen Liste
   * @param {string} itemId - Die ID des zu entfernenden Artikels
   * @return {boolean} true bei Erfolg, false bei Fehler
   */
  const removeItem = (itemId) => {
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
   * @param {string} itemId - Die ID des zu ändernden Artikels
   * @return {boolean} true bei Erfolg, false bei Fehler
   */
  const toggleItemChecked = (itemId) => {
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
  
  /**
   * Setzt das Artikelformular zurück
   * @param {string} defaultCategory - Die Standardkategorie für neue Artikel
   */
  const resetItemForm = (defaultCategory = 'Sonstiges') => {
    newItem.name = '';
    newItem.quantity = 1;
    newItem.category = defaultCategory;
    isAddingItem.value = false;
  };
  
  /**
   * Setzt den Fokus auf das Artikelnamen-Eingabefeld
   */
  const focusItemNameInput = () => {
    // Warten bis das DOM aktualisiert ist
    setTimeout(() => {
      if (itemNameInput.value) {
        itemNameInput.value.focus();
      }
    }, 100);
  };
  
  return {
    // Status und Daten
    isAddingItem,
    itemNameInput,
    newItem,
    isFormValid,
    allItems,
    
    // Berechnete Eigenschaften
    getItemsGrouped,
    
    // Aktionen
    addItem,
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    resetItemForm,
    focusItemNameInput
  };
}
