import { reactive, ref, computed, onMounted, watch } from 'vue';

import { initializeServices } from '~/services';
import { createLogger } from '~/utils/logger';

import type { Ref, ComputedRef } from 'vue';
import type { IShoppingItem, ICategory } from '~/types/app-types';

// Interface für den Rückgabetyp
export interface IUseShoppingItemsReturn {
  // Status und Daten
  isAddingItem: Ref<boolean>;
  itemNameInput: Ref<HTMLInputElement | null>;
  newItem: {
    name: string;
    quantity: number;
    category: string | ICategory;
    price: number;
  };
  _isFormValid: ComputedRef<boolean>;
  allItems: ComputedRef<IShoppingItem[]>;
  currentListId: Ref<string | null>;

  // Berechnete Eigenschaften
  getItemsGrouped: (categories: (string | ICategory)[]) => Record<string, IShoppingItem[]>;
  getTotalPrice: () => number;
  getCategoryPrice: (categoryId: string) => number;

  // Aktionen
  loadCurrentListData: () => void;
  refreshItems: () => void;
  addItem: (itemData?: Partial<IShoppingItem> | null) => IShoppingItem | null;
  addNewItem: (itemData: Partial<IShoppingItem>) => IShoppingItem | null;
  removeItem: (item: IShoppingItem | string) => boolean;
  toggleItemChecked: (item: IShoppingItem | string) => boolean;
  _clearCheckedItems: () => boolean;
  _resetItemForm: (defaultCategory?: string | ICategory) => void;
  focusItemNameInput: () => void;
  updateCategoryInItems: (categoryId: string, newName: string) => void;
}

// Services initialisieren
const { itemService, shoppingListService } = initializeServices();

// Logger initialisieren
const _logger = createLogger('useShoppingItems');

/**
 * Composable für die Verwaltung von Artikeln in Einkaufslisten
 * Bietet Funktionen zum Hinzufügen, Bearbeiten, Löschen und Markieren von Artikeln
 *
 * @param providedCurrentListId - Optional: Eine Ref auf die aktuelle Listen-ID von außen
 * @returns Ein Objekt mit Funktionen und Daten zur Verwaltung von Einkaufsartikeln
 */
export function useShoppingItems(
  providedCurrentListId?: Ref<string | null>
): IUseShoppingItemsReturn {
  // UI-Status für Artikelformular
  const isAddingItem = ref<boolean>(false);
  const itemNameInput = ref<HTMLInputElement | null>(null);

  // Entweder providedCurrentListId verwenden oder eine neue Ref erstellen
  const currentListId = providedCurrentListId ?? ref<string | null>(null);

  const items = ref<IShoppingItem[]>([]);

  // Neues Item Formular
  const newItem = reactive<{
    name: string;
    quantity: number;
    category: string | ICategory;
    price: number;
  }>({
    name: '',
    quantity: 1,
    category: 'Sonstiges',
    price: 0,
  });

  // Berechnete Eigenschaften
  const _isFormValid = computed((): boolean => newItem.name.trim() !== '' && newItem.quantity > 0);

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
    const allItemsFromAllLists: IShoppingItem[] = [];

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
  const allItems: ComputedRef<IShoppingItem[]> = computed(() => items.value);

  /**
   * Gruppiert Artikel nach Kategorien
   * @param categories - Liste der Kategorien
   * @returns Ein Objekt mit Kategorienamen als Schlüssel und Arrays von Artikeln als Werte
   */
  const getItemsGrouped = (categories: (string | ICategory)[]): Record<string, IShoppingItem[]> => {
    if (!currentListId.value) {
      return categories.reduce(
        (obj, cat) => {
          const categoryName = typeof cat === 'object' ? cat.name : cat;
          obj[categoryName] = [];
          return obj;
        },
        {} as Record<string, IShoppingItem[]>
      );
    }

    // Kategorienamen aus dem Objekt extrahieren
    const categoryNames = categories.map(cat => (typeof cat === 'object' ? cat.name : cat));
    return itemService.groupItemsByCategory(currentListId.value, categoryNames);
  };

  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu
   * @param itemData - Daten des neuen Artikels (optional)
   * @returns Das hinzugefügte Item oder null bei Fehler
   */
  const addItem = (itemData: Partial<IShoppingItem> | null = null): IShoppingItem | null => {
    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!currentListId.value) {
      _logger.error('Keine Liste ausgewählt.');
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
        _resetItemForm();
      }
    }

    return addedItem;
  };

  /**
   * Fügt einen neuen Artikel zur aktuellen Liste hinzu (Alias für addItem)
   * @param itemData - Daten des neuen Artikels
   * @returns Das hinzugefügte Item oder null bei Fehler
   */
  const addNewItem = (itemData: Partial<IShoppingItem>): IShoppingItem | null => {
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
   * @returns true bei Erfolg, false bei Fehler
   */
  const removeItem = (item: IShoppingItem | string): boolean => {
    // Item-Objekt und Liste-ID extrahieren
    const itemObj = typeof item === 'object' ? item : null;
    const listId = itemObj?.listId ?? currentListId.value;

    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!listId) {
      _logger.error('Keine Liste ausgewählt.');
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
   * @returns true bei Erfolg, false bei Fehler
   */
  const toggleItemChecked = (item: IShoppingItem | string): boolean => {
    // Item-Objekt und Liste-ID extrahieren
    const itemObj = typeof item === 'object' ? item : null;
    const listId = itemObj?.listId ?? currentListId.value;

    // Wenn keine Liste ausgewählt ist und das Item kein listId hat, frühzeitig beenden
    if (!listId) {
      _logger.error('Keine Liste ausgewählt oder keine listId im Item gefunden.');
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
   * @returns true bei Erfolg, false bei Fehler
   */
  const _clearCheckedItems = (): boolean => {
    // Wenn keine Liste ausgewählt ist, frühzeitig beenden
    if (!currentListId.value) {
      _logger.error('Keine Liste ausgewählt.');
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
  const _resetItemForm = (defaultCategory: string | ICategory = 'Sonstiges'): void => {
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
   * @returns Der Gesamtpreis
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
   * @returns Der Preis für diese Kategorie
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
    if (!categoryId || !newName) {
      return;
    }

    // Alle Listen durchlaufen und nach Änderungsbedarf suchen
    const lists = shoppingListService.getAllLists();
    let hasChanges = false;

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
    _isFormValid,
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
    _clearCheckedItems,
    _resetItemForm,
    focusItemNameInput,
    updateCategoryInItems,
  };
}
