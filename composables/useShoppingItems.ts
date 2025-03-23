import { reactive, ref, computed, onMounted, watch } from 'vue';

import { initializeServices } from '~/services';
import { createLogger } from '~/utils/logger';

import type { ShoppingItem, Category } from './types';
import type { Ref, ComputedRef } from 'vue';

// Services initialisieren
const { itemService, shoppingListService } = initializeServices();

// Logger initialisieren
const logger = createLogger('useShoppingItems');

/**
 * Composable für die Verwaltung von Artikeln in Einkaufslisten
 * Bietet Funktionen zum Hinzufügen, Bearbeiten, Löschen und Markieren von Artikeln
 *
 * @param providedCurrentListId - Optional: Eine Ref auf die aktuelle Listen-ID von außen
 */
export function useShoppingItems(providedCurrentListId?: Ref<string | null>): void {
  // UI-Status für Artikelformular
  const isAddingItem = ref<boolean>(false);
  const itemNameInput = ref<HTMLInputElement | null>(null);

  // Entweder providedCurrentListId verwenden oder eine neue Ref erstellen
  const currentListId = providedCurrentListId ?? ref<string | null>(null);

  const items = ref<ShoppingItem[]>([]);

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
   * Lädt die aktuelle Listen-ID und die aktuellen Artikel
   */
  const loadCurrentListData = (): void => {
    // Nur laden, wenn kein providedCurrentListId übergeben wurde
    if (!providedCurrentListId) {
      currentListId.value = shoppingListService.getCurrentListId();
    }
    refreshItems();
  };

  /**
   * Aktualisiert die Artikel der aktuellen Liste
   */
  const refreshItems = (): void => {
    // Get all items from all lists
    const allLists = shoppingListService.getAllLists();
    const allItemsFromAllLists: ShoppingItem[] = [];

    allLists.forEach(list => {
      // Get items from this list and make sure they have the listId
      const listItems = list.items.map(item => ({
        ...item,
        listId: list.id,
      }));

      allItemsFromAllLists.push(...listItems);
    });

    items.value = allItemsFromAllLists;
  };

  // Beim Mounting die aktuelle Liste und Artikel laden
  onMounted(() => {
    loadCurrentListData();
  });

  // Bei Änderung der aktuellen Listen-ID die Artikel aktualisieren
  watch(currentListId, () => {
    refreshItems();
  });

  /**
   * Gibt alle Artikel (aus allen Listen) zurück
   */
  const allItems: ComputedRef<ShoppingItem[]> = computed(() => items.value);

  /**
   * Gruppiert Artikel nach Kategorien
   */
  const getItemsGrouped = (categories: (string | Category)[]): Record<string, ShoppingItem[]> => {
    if (!currentListId.value) {
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
    return itemService.groupItemsByCategory(currentListId.value, categoryNames);
  };

  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu
   * @param itemData - Daten des neuen Artikels (optional)
   * @return Das hinzugefügte Item oder null bei Fehler
   */
  const addItem = (itemData: Partial<ShoppingItem> | null = null): ShoppingItem | null => {
    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!currentListId.value) {
      logger.error('Keine Liste ausgewählt.');
      return null;
    }

    // Wenn itemData übergeben wurde, verwenden wir das, ansonsten das newItem
    const itemToAdd = itemData ?? newItem;

    // Artikel hinzufügen
    const addedItem = itemService.addItem(currentListId.value, itemToAdd);

    // Wenn erfolgreich, Artikel aktualisieren
    if (addedItem) {
      refreshItems();

      // Formular zurücksetzen, wenn wir das interne newItem verwendet haben
      if (!itemData) {
        resetItemForm();
      }
    }

    return addedItem;
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
    // Item-Objekt und Liste-ID extrahieren
    const itemObj = typeof item === 'object' ? item : null;
    const listId = itemObj?.listId ?? currentListId.value;

    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!listId) {
      logger.error('Keine Liste ausgewählt.');
      return false;
    }

    // Item-ID aus dem Parameter extrahieren
    const itemId = typeof item === 'object' ? item.id : item;

    // Item entfernen
    const success = itemService.removeItem(listId, itemId);

    // Bei Erfolg Artikel aktualisieren
    if (success) {
      refreshItems();
    }

    return success;
  };

  /**
   * Ändert den Markierungsstatus eines Artikels
   * @param item - Das Item oder die ID des zu ändernden Artikels
   * @return true bei Erfolg, false bei Fehler
   */
  const toggleItemChecked = (item: ShoppingItem | string): boolean => {
    // Item-Objekt und Liste-ID extrahieren
    const itemObj = typeof item === 'object' ? item : null;
    const listId = itemObj?.listId ?? currentListId.value;

    // Wenn keine Liste ausgewählt ist und das Item kein listId hat, frühzeitig beenden
    if (!listId) {
      logger.error('Keine Liste ausgewählt oder keine listId im Item gefunden.');
      return false;
    }

    // Item-ID aus dem Parameter extrahieren
    const itemId = typeof item === 'object' ? item.id : item;

    // Status ändern
    const updatedItem = itemService.toggleItemChecked(listId, itemId);

    // Bei Erfolg Artikel aktualisieren
    const success = updatedItem !== null;
    if (success) {
      refreshItems();
    }

    return success;
  };

  /**
   * Entfernt alle erledigten Artikel aus der aktuellen Liste
   * @return true bei Erfolg, false bei Fehler
   */
  const clearCheckedItems = (): boolean => {
    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!currentListId.value) {
      logger.error('Keine Liste ausgewählt.');
      return false;
    }

    // Erledigte Artikel entfernen
    const success = itemService.clearCheckedItems(currentListId.value);

    // Bei Erfolg Artikel aktualisieren
    if (success) {
      refreshItems();
    }

    return success;
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
    if (!currentListId.value) {
      return 0;
    }

    return itemService.calculateTotalPrice(currentListId.value);
  };

  /**
   * Berechnet den Preis pro Kategorie
   * @param categoryId - Die ID der Kategorie
   * @return Der Preis für diese Kategorie
   */
  const getCategoryPrice = (categoryId: string): number => {
    if (!currentListId.value) {
      return 0;
    }

    return itemService.calculateCategoryPrice(currentListId.value, categoryId);
  };

  /**
   * Aktualisiert die Kategorienamen in allen Items
   * @param categoryId - Die ID der zu aktualisierenden Kategorie
   * @param newName - Der neue Name für die Kategorie
   */
  const updateCategoryInItems = (categoryId: string, newName: string): void => {
    if (!categoryId ?? !newName) {
      return;
    }

    // Alle Listen durchlaufen und nach Änderungsbedarf suchen
    const lists = shoppingListService.getAllLists();
    let hasChanges = false;

    for (const list of lists) {
      for (const item of list.items) {
        // Prüfen, ob das Item diese Kategorie verwendet
        let needsUpdate = false;

        if (typeof item.category === 'object' && item.category && item.category.id === categoryId) {
          needsUpdate = true;
        } else if (typeof item.category === 'string' && item.category === categoryId) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          // Item aktualisieren
          itemService.updateItem(list.id, item.id, {
            category: {
              id: categoryId,
              name: newName,
            },
          });
          hasChanges = true;
        }
      }
    }

    // Bei Änderungen die Items aktualisieren
    if (hasChanges) {
      refreshItems();
    }
  };

  return {
    // Status und Daten
    isAddingItem,
    itemNameInput,
    newItem,
    isFormValid,
    allItems,
    currentListId,

    // Berechnete Eigenschaften
    getItemsGrouped,
    getTotalPrice,
    getCategoryPrice,

    // Aktionen
    loadCurrentListData,
    refreshItems,
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
