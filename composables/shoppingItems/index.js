import { useItemManagement } from './useItemManagement';
import { useItemForm } from './useItemForm';
import { useItemAnalytics } from './useItemAnalytics';

/**
 * Hauptcomposable für die Verwaltung von Einkaufsartikeln
 * Kombiniert die verschiedenen Aspekte der Artikelverwaltung
 */
export function useShoppingItems(shoppingListsRef, currentListIdRef) {
  // Grundlegende Artikelverwaltung
  const itemManagement = useItemManagement(shoppingListsRef, currentListIdRef);
  
  // Artikelformular
  const itemForm = useItemForm();
  
  // Artikel-Analyse und Statistiken
  const itemAnalytics = useItemAnalytics(shoppingListsRef, currentListIdRef);
  
  /**
   * Neuen Artikel hinzufügen über das Formular
   * @param {object} item - Die Artikeldaten aus dem Formular
   */
  const addNewItem = (item) => {
    // Kategorie aus dem Item extrahieren
    let categoryValue;
    
    if (typeof item.category === 'object' && item.category !== null) {
      if (item.category.id && item.category.name) {
        // Neues Format: Kategorie als Objekt mit id und name
        categoryValue = item.category;
      } else {
        // Objekt, aber keine id/name - Fallback
        categoryValue = { 
          id: 'sonstiges_' + Date.now(), 
          name: String(item.category) || 'Sonstiges' 
        };
      }
    } else {
      // Altes Format: Kategorie als String
      categoryValue = { 
        id: (item.category || '').toString().toLowerCase().replace(/\s+/g, '_') || 'sonstiges', 
        name: String(item.category) || 'Sonstiges' 
      };
    }
    
    const newItem = {
      name: item.name,
      quantity: item.quantity,
      category: categoryValue,
      price: item.price || 0
    };
    
    itemManagement.addItem(newItem);
    itemForm.resetItemForm();
  };

  return {
    // Artikel-Daten
    allItems: itemManagement.allItems,
    
    // Formularverwaltung
    isAddingItem: itemForm.isAddingItem,
    itemNameInput: itemForm.itemNameInput,
    newItem: itemForm.newItem,
    isFormValid: itemForm.isFormValid,
    resetItemForm: itemForm.resetItemForm,
    focusItemNameInput: itemForm.focusItemNameInput,
    
    // Artikelmanagement
    addItem: itemManagement.addItem,
    addNewItem,
    removeItem: itemManagement.removeItem,
    toggleItemChecked: itemManagement.toggleItemChecked,
    clearCheckedItems: itemManagement.clearCheckedItems,
    getItemsGrouped: itemManagement.getItemsGrouped,
    
    // Artikel-Analyse
    getTotalPrice: itemAnalytics.getTotalPrice,
    getCategoryPrice: itemAnalytics.getCategoryPrice,
    getItemCountByCategory: itemAnalytics.getItemCountByCategory
  };
}