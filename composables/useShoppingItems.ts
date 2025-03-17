import { reactive, ref, computed, Ref, ComputedRef } from 'vue';

import { useLocalStorage } from './core/useLocalStorage';
import { ShoppingItem, ShoppingList, Category } from './types';

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
    const grouped: Record<string, ShoppingItem[]> = {};

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

    // Für jede Kategorie ein Array erstellen (auch wenn leer)
    categories.forEach(category => {
      const categoryName = typeof category === 'object' ? category.name : category;
      grouped[categoryName] = [];
    });

    // Dann Elemente in die entsprechenden Kategorien einsortieren
    currentList.items.forEach(item => {
      const category = item.category || 'Sonstiges';
      const categoryName = typeof category === 'object' ? category.name : category;

      if (grouped[categoryName]) {
        grouped[categoryName].push(item);
      } else {
        // Wenn die Kategorie nicht mehr existiert, zum Punkt "Sonstiges" hinzufügen
        if (!grouped.Sonstiges) {
          grouped.Sonstiges = [];
        }
        grouped.Sonstiges.push(item);
      }
    });

    return grouped;
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

    const newItemObj: ShoppingItem = {
      id: itemToAdd.id || Date.now().toString(), // Vorhandene ID verwenden oder neue erstellen
      name: itemToAdd.name,
      quantity: itemToAdd.quantity || 1,
      category: itemToAdd.category || 'Sonstiges',
      checked: itemToAdd.checked || false,
      price: itemToAdd.price || 0,
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

    return currentList.items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + itemPrice * itemQuantity;
    }, 0);
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

    return currentList.items
      .filter(item => {
        const itemCategoryId = typeof item.category === 'object' ? item.category.id : 'sonstiges';
        return itemCategoryId === categoryId;
      })
      .reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        return total + itemPrice * itemQuantity;
      }, 0);
  };

  /**
   * Aktualisiert die Kategorienamen in allen Items
   * @param categoryId - Die ID der zu aktualisierenden Kategorie
   * @param newName - Der neue Name für die Kategorie
   */
  const updateCategoryInItems = (categoryId: string, newName: string): void => {
    // Alle Listen durchgehen und die Kategorie in den Items aktualisieren
    const newLists = JSON.parse(JSON.stringify(shoppingListsRef.value));

    let hasUpdates = false;

    newLists.forEach((list: ShoppingList) => {
      if (Array.isArray(list.items)) {
        list.items.forEach(item => {
          if (typeof item.category === 'object' && item.category.id === categoryId) {
            item.category.name = newName;
            hasUpdates = true;
          }
        });
      }
    });

    if (hasUpdates) {
      shoppingListsRef.value = newLists;
      saveToStorage('shoppingLists', newLists);
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
