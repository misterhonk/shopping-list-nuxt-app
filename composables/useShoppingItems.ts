import { reactive, ref, computed } from 'vue';

import { useLocalStorage } from './core/useLocalStorage';
import {
  createItemObject,
  itemBelongsToCategory,
  updateItemCategory,
  groupItemsByCategory,
  calculateTotalPrice,
  calculateCategoryPrice,
} from './utils/itemUtils';
import {
  findListById,
  addItemToList,
  removeItemFromList,
  updateItemInList,
  removeItemsFromList
} from './utils/operations';
import { createLogger } from '~/utils/logger';

import type { ShoppingItem, ShoppingList, Category } from './types';
import type { Ref, ComputedRef } from 'vue';

// Logger initialisieren
const logger = createLogger('useShoppingItems');

/**
 * Composable für die Verwaltung von Artikeln in Einkaufslisten
 * Bietet Funktionen zum Hinzufügen, Bearbeiten, Löschen und Markieren von Artikeln
 */
export function useShoppingItems(
  shoppingListsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>
) {
  const { saveToStorage } = useLocalStorage();

  // UI-Status für Artikelformular
  const isAddingItem = ref<boolean>(false);
  const itemNameInput = ref<HTMLInputElement | null>(null);

  // Neues Item Formular
  const newItem = reactive<{
    name: string;
    quantity: number;
    category: string | Category;
    price: number;
  }>({
    name: '',
    quantity: 1,
    category: 'Sonstiges',
    price: 0,
  });

  // Berechnete Eigenschaften
  const isFormValid = computed((): boolean => newItem.name.trim() !== '' && newItem.quantity > 0);

  /**
   * Gibt alle Artikel der aktuellen Liste zurück
   */
  const allItems: ComputedRef<ShoppingItem[]> = computed(() => {
    const currentList = findListById(shoppingListsRef.value, currentListIdRef.value || '');
    if (!currentList || !Array.isArray(currentList.items)) {
      return [];
    }
    return currentList.items;
  });

  /**
   * Gruppiert Artikel nach Kategorien
   */
  const getItemsGrouped = (categories: (string | Category)[]): Record<string, ShoppingItem[]> => {
    const currentList = findListById(shoppingListsRef.value, currentListIdRef.value || '');

    // Prüfen, ob items ein gültiges Array ist
    if (!currentList || !Array.isArray(currentList.items)) {
      return categories.reduce(
        (obj, cat) => {
          const categoryName = typeof cat === 'object' ? cat.name : cat;
          obj[categoryName] = [];
          return obj;
        },
        {} as Record<string, ShoppingItem[]>
      );
    }

    // Kategorienamen aus dem Objekt extrahieren
    const categoryNames = categories.map(cat => (typeof cat === 'object' ? cat.name : cat));
    return groupItemsByCategory(currentList.items, categoryNames);
  };

  /**
   * Speichert die aktualisierten Listen und aktualisiert die Referenz
   * @param updatedLists - Die aktualisierten Listen
   * @returns true bei Erfolg, false bei Fehler
   */
  const saveUpdatedLists = (updatedLists: ShoppingList[] | null): boolean => {
    if (!updatedLists) {
      return false;
    }
    
    shoppingListsRef.value = updatedLists;
    saveToStorage('shoppingLists', updatedLists);
    return true;
  };

  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu
   * @param itemData - Daten des neuen Artikels (optional)
   * @return Das hinzugefügte Item oder null bei Fehler
   */
  const addItem = (itemData: Partial<ShoppingItem> | null = null): ShoppingItem | null => {
    // Wenn no listId, frühzeitig beenden
    if (!currentListIdRef.value) {
      logger.error('Keine Liste ausgewählt.');
      return null;
    }
    
    // Wenn itemData übergeben wurde, verwenden wir das, ansonsten das newItem
    const itemToAdd = itemData || newItem;

    // Prüfen, ob die Daten gültig sind
    if (!itemToAdd.name || itemToAdd.name.trim() === '' || 
        !(itemToAdd.quantity && itemToAdd.quantity > 0)) {
      logger.error('Ungültige Artikeldaten.');
      return null;
    }

    // Item-Objekt erstellen
    const newItemObj = createItemObject(itemToAdd);

    // Basisfunktion zur Aktualisierung der Listen verwenden
    const updatedLists = addItemToList(
      shoppingListsRef.value,
      currentListIdRef.value,
      newItemObj
    );

    // Update der Listen-Referenz und Speichern
    if (!saveUpdatedLists(updatedLists)) {
      return null;
    }

    // Formular zurücksetzen, wenn wir das interne newItem verwendet haben
    if (!itemData) {
      resetItemForm();
    }

    return newItemObj;
  };

  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu (Alias für addItem)
   * @param itemData - Daten des neuen Artikels
   * @return Das hinzugefügte Item oder null bei Fehler
   */
  const addNewItem = (itemData: Partial<ShoppingItem>): ShoppingItem | null => {
    // Öffnet das Formular (falls nicht bereits offen)
    isAddingItem.value = true;

    const result = addItem(itemData);

    // Schließt das Formular nach dem Hinzufügen
    if (result) {
      isAddingItem.value = false;
    }

    return result;
  };

  /**
   * Entfernt einen Artikel aus der aktuellen Liste
   * @param item - Das Item oder die ID des zu entfernenden Artikels
   * @return true bei Erfolg, false bei Fehler
   */
  const removeItem = (item: ShoppingItem | string): boolean => {
    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!currentListIdRef.value) {
      logger.error('Keine Liste ausgewählt.');
      return false;
    }
    
    // Item-ID aus dem Parameter extrahieren
    const itemId = typeof item === 'object' ? item.id : item;
    
    // Basisfunktion zur Entfernung des Items verwenden
    const updatedLists = removeItemFromList(
      shoppingListsRef.value,
      currentListIdRef.value,
      itemId
    );
    
    // Update der Listen-Referenz und Speichern
    return saveUpdatedLists(updatedLists);
  };

  /**
   * Ändert den Markierungsstatus eines Artikels
   * @param item - Das Item oder die ID des zu ändernden Artikels
   * @return true bei Erfolg, false bei Fehler
   */
  const toggleItemChecked = (item: ShoppingItem | string): boolean => {
    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!currentListIdRef.value) {
      logger.error('Keine Liste ausgewählt.');
      return false;
    }
    
    // Item-ID aus dem Parameter extrahieren
    const itemId = typeof item === 'object' ? item.id : item;
    
    // Basisfunktion zur Aktualisierung des Items verwenden
    const updatedLists = updateItemInList(
      shoppingListsRef.value,
      currentListIdRef.value,
      itemId,
      (item) => ({
        ...item,
        checked: !item.checked,
        modifiedAt: Date.now()
      })
    );
    
    // Update der Listen-Referenz und Speichern
    return saveUpdatedLists(updatedLists);
  };

  /**
   * Entfernt alle erledigten Artikel aus der aktuellen Liste
   * @return true bei Erfolg, false bei Fehler
   */
  const clearCheckedItems = (): boolean => {
    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!currentListIdRef.value) {
      logger.error('Keine Liste ausgewählt.');
      return false;
    }
    
    // Basisfunktion zur Entfernung der erledigten Items verwenden
    const updatedLists = removeItemsFromList(
      shoppingListsRef.value,
      currentListIdRef.value,
      (item) => item.checked
    );
    
    // Update der Listen-Referenz und Speichern
    return saveUpdatedLists(updatedLists);
  };

  /**
   * Setzt das Artikelformular zurück
   * @param defaultCategory - Die Standardkategorie für neue Artikel
   */
  const resetItemForm = (defaultCategory: string | Category = 'Sonstiges'): void => {
    newItem.name = '';
    newItem.quantity = 1;
    newItem.category = defaultCategory;
    newItem.price = 0;
    isAddingItem.value = false;
  };

  /**
   * Setzt den Fokus auf das Artikelnamen-Eingabefeld
   */
  const focusItemNameInput = (): void => {
    // Warten bis das DOM aktualisiert ist
    setTimeout(() => {
      if (itemNameInput.value) {
        itemNameInput.value.focus();
      }
    }, 100);
  };

  /**
   * Berechnet den Gesamtpreis aller Artikel in der aktuellen Liste
   * @return Der Gesamtpreis
   */
  const getTotalPrice = (): number => {
    const currentList = findListById(shoppingListsRef.value, currentListIdRef.value || '');

    if (!currentList || !Array.isArray(currentList.items)) {
      return 0;
    }

    return calculateTotalPrice(currentList.items);
  };

  /**
   * Berechnet den Preis pro Kategorie
   * @param categoryId - Die ID der Kategorie
   * @return Der Preis für diese Kategorie
   */
  const getCategoryPrice = (categoryId: string): number => {
    const currentList = findListById(shoppingListsRef.value, currentListIdRef.value || '');

    if (!currentList || !Array.isArray(currentList.items)) {
      return 0;
    }

    return calculateCategoryPrice(currentList.items, categoryId);
  };

  /**
   * Aktualisiert die Kategorienamen in allen Items
   * @param categoryId - Die ID der zu aktualisierenden Kategorie
   * @param newName - Der neue Name für die Kategorie
   */
  const updateCategoryInItems = (categoryId: string, newName: string): void => {
    if (!categoryId || !newName) {
      return;
    }

    // Alle Listen durchgehen und die Kategorie in den Items aktualisieren
    let hasUpdates = false;
    let updatedLists = [...shoppingListsRef.value];

    updatedLists = updatedLists.map(list => {
      if (!Array.isArray(list.items)) {
        return list;
      }
      
      // Updates für diese Liste überprüfen
      let listUpdated = false;
      const updatedItems = list.items.map(item => {
        const matchFound = itemBelongsToCategory(item, categoryId);
        
        // Wenn Match gefunden, Kategorie aktualisieren
        if (matchFound) {
          listUpdated = true;
          hasUpdates = true;
          return updateItemCategory(item, categoryId, newName);
        }
        
        return item;
      });
      
      // Nur aktualisieren, wenn Änderungen vorgenommen wurden
      if (listUpdated) {
        return {
          ...list,
          items: updatedItems,
          modifiedAt: Date.now()
        };
      }
      
      return list;
    });

    // Nur speichern, wenn Änderungen vorgenommen wurden
    if (hasUpdates) {
      shoppingListsRef.value = updatedLists;
      saveToStorage('shoppingLists', updatedLists);
    }
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
    getTotalPrice,
    getCategoryPrice,

    // Aktionen
    addItem,
    addNewItem, // Alias für addItem mit besserer Semantik für die UI
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    resetItemForm,
    focusItemNameInput,
    updateCategoryInItems,
  };
}
