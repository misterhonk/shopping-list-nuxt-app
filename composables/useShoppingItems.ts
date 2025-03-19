import { reactive, ref, computed } from 'vue';

import { useLocalStorage } from './core/useLocalStorage';
import { 
  createItemObject, 
  itemBelongsToCategory, 
  updateItemCategory, 
  groupItemsByCategory,
  calculateTotalPrice,
  calculateCategoryPrice
} from './utils/itemUtils';

import type { ShoppingItem, ShoppingList, Category } from './types';
import type { Ref, ComputedRef } from 'vue';

/**
 * Composable für die Verwaltung von Artikeln in Einkaufslisten
 * Bietet Funktionen zum Hinzufügen, Bearbeiten, Löschen und Markieren von Artikeln
 */
export function useShoppingItems(
  shoppingListsRef: Ref<ShoppingList[]>,
  currentListIdRef: Ref<string | null>
) {
  const { saveToStorage, createImmutableCopy } = useLocalStorage();

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
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    if (!currentList || !Array.isArray(currentList.items)) {
      return [];
    }
    return currentList.items;
  });

  /**
   * Gruppiert Artikel nach Kategorien
   */
  const getItemsGrouped = (categories: (string | Category)[]): Record<string, ShoppingItem[]> => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    
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
    const categoryNames = categories.map(cat => typeof cat === 'object' ? cat.name : cat);
    return groupItemsByCategory(currentList.items, categoryNames);
  };

  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu
   * @param itemData - Daten des neuen Artikels (optional)
   * @return Das hinzugefügte Item oder null bei Fehler
   */
  const addItem = (itemData: Partial<ShoppingItem> | null = null): ShoppingItem | null => {
    // Wenn itemData übergeben wurde, verwenden wir das, ansonsten das newItem
    const itemToAdd = itemData || newItem;

    // Prüfen, ob die Daten gültig sind
    if (
      !itemToAdd.name ||
      itemToAdd.name.trim() === '' ||
      !(itemToAdd.quantity && itemToAdd.quantity > 0)
    ) {
      return null;
    }

    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) {
      return null;
    }

    const newItemObj = createItemObject(itemToAdd);

    // Immutable Update der Listen mit dem neuen Item
    const updatedLists = createImmutableCopy(shoppingListsRef.value);

    // Sicherstellen, dass items existiert
    if (!Array.isArray(updatedLists[listIndex].items)) {
      updatedLists[listIndex].items = [];
    }

    // Item hinzufügen
    updatedLists[listIndex].items.push(newItemObj);
    updatedLists[listIndex].modifiedAt = Date.now();

    // Update der Listen-Referenz und Speichern
    shoppingListsRef.value = updatedLists;
    saveToStorage('shoppingLists', updatedLists);

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
    // Item-ID aus dem Parameter extrahieren (falls ein Objekt übergeben wurde)
    const itemId = typeof item === 'object' ? item.id : item;

    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) {
      return false;
    }

    if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
      return false;
    }

    // Prüfen, ob das Item existiert
    const itemIndex = shoppingListsRef.value[listIndex].items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return false;
    }

    // Immutable Update und Entfernen des Items
    const updatedLists = createImmutableCopy(shoppingListsRef.value);
    updatedLists[listIndex].items = updatedLists[listIndex].items.filter(item => item.id !== itemId);
    updatedLists[listIndex].modifiedAt = Date.now();

    // Update und Speichern
    shoppingListsRef.value = updatedLists;
    saveToStorage('shoppingLists', updatedLists);

    return true;
  };

  /**
   * Ändert den Markierungsstatus eines Artikels
   * @param item - Das Item oder die ID des zu ändernden Artikels
   * @return true bei Erfolg, false bei Fehler
   */
  const toggleItemChecked = (item: ShoppingItem | string): boolean => {
    // Item-ID aus dem Parameter extrahieren (falls ein Objekt übergeben wurde)
    const itemId = typeof item === 'object' ? item.id : item;

    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) {
      return false;
    }

    if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
      return false;
    }

    const itemIndex = shoppingListsRef.value[listIndex].items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return false;
    }

    // Immutable Update und Ändern des Status
    const updatedLists = createImmutableCopy(shoppingListsRef.value);
    updatedLists[listIndex].items = updatedLists[listIndex].items.map((item, index) => {
      if (index === itemIndex) {
        return {
          ...item,
          checked: !item.checked,
          modifiedAt: Date.now(),
        };
      }
      return item;
    });
    updatedLists[listIndex].modifiedAt = Date.now();

    // Update und Speichern
    shoppingListsRef.value = updatedLists;
    saveToStorage('shoppingLists', updatedLists);

    return true;
  };

  /**
   * Entfernt alle erledigten Artikel aus der aktuellen Liste
   * @return true bei Erfolg, false bei Fehler
   */
  const clearCheckedItems = (): boolean => {
    const listIndex = shoppingListsRef.value.findIndex(list => list.id === currentListIdRef.value);
    if (listIndex === -1) {
      return false;
    }

    if (!Array.isArray(shoppingListsRef.value[listIndex].items)) {
      return false;
    }

    // Immutable Update und Filtern der nicht erledigten Items
    const updatedLists = createImmutableCopy(shoppingListsRef.value);
    updatedLists[listIndex].items = updatedLists[listIndex].items.filter(item => !item.checked);
    updatedLists[listIndex].modifiedAt = Date.now();

    // Update und Speichern
    shoppingListsRef.value = updatedLists;
    saveToStorage('shoppingLists', updatedLists);

    return true;
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
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);

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
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);

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
    const updatedLists = createImmutableCopy(shoppingListsRef.value);

    let hasUpdates = false;

    updatedLists.forEach((list: ShoppingList, listIndex: number) => {
      if (Array.isArray(list.items)) {
        // Alle Items in der Liste durchgehen
        updatedLists[listIndex].items = list.items.map(item => {
          const matchFound = itemBelongsToCategory(item, categoryId);

          // Wenn Match gefunden, Kategorie aktualisieren
          if (matchFound) {
            hasUpdates = true;
            return updateItemCategory(item, categoryId, newName);
          }

          return item;
        });
        
        // Nur die Liste als geändert markieren, wenn Items geändert wurden
        if (hasUpdates) {
          updatedLists[listIndex].modifiedAt = Date.now();
        }
      }
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
