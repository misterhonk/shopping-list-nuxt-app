/**
 * Typ-Definitionen für Composables in der Shopping-List-App
 *
 * Diese Datei enthält Rückgabetypen für Composables, um TypeScript-Fehler
 * bei den Return-Statements zu vermeiden.
 */

import type {
  IShoppingItem,
  IShoppingList,
  ICategory,
  ItemSuggestion,
  ItemHistoryEntry,
} from './app-types';
import type { Ref, ComputedRef } from 'vue';

/**
 * Schnittstelle für das useShoppingItems-Composable
 */
export interface IUseShoppingItems {
  // Zustände
  isAddingItem: Ref<boolean>;
  itemNameInput: Ref<HTMLInputElement | null>;
  newItem: {
    name: string;
    quantity: number;
    category: string | ICategory;
    price: number;
  };

  // Getter und berechnete Eigenschaften
  allItems: ComputedRef<IShoppingItem[]>;

  // Methoden
  getItemsGrouped: (categories: string[]) => Record<string, IShoppingItem[]>;
  addItem: (itemData: Partial<IShoppingItem>) => IShoppingItem | null;
  removeItem: (item: string | IShoppingItem) => boolean;
  toggleItemChecked: (item: string | IShoppingItem) => boolean;
  clearCheckedItems: () => boolean;
  updateCategoryInItems: (categoryId: string, newName: string) => void;

  // Formular-Methoden
  showItemForm: () => void;
  hideItemForm: () => void;
  submitItemForm: () => void;
  resetItemForm: () => void;
}

/**
 * Schnittstelle für das useShoppingLists-Composable
 */
export interface IUseShoppingLists {
  // Zustände
  lists: Ref<IShoppingList[]>;
  currentListId: Ref<string | null>;

  // Getter und berechnete Eigenschaften
  currentList: ComputedRef<IShoppingList>;

  // Methoden
  loadLists: () => boolean;
  createList: (
    name: string,
    options?: {
      isFavorite?: boolean;
      templateId?: string;
    }
  ) => IShoppingList | null;
  selectList: (id: string) => boolean;
  deleteList: (id: string) => boolean;
  updateTemplateId: (templateId: string) => boolean;
  updateListName: (newName: string) => boolean;
  updateListFavorite: (isFavorite: boolean) => boolean;
  saveLists: () => boolean;
}

/**
 * Schnittstelle für das useListProperties-Composable
 */
export interface IUseListProperties {
  getItemsCount: (list: IShoppingList) => number;
  getCheckedItemsCount: () => number;
  getTotalItemsCount: () => number;
  updateListName: (newName: string) => boolean;
  updateListFavorite: (isFavorite: boolean) => boolean;
}

/**
 * Schnittstelle für das useListUpdate-Composable
 */
export interface IUseListUpdate {
  updateList: (listData: Partial<IShoppingList> & { id: string }) => boolean;
  clearList: (listId?: string) => boolean;
  addItemsToList: (
    listId: string,
    items: IShoppingItem[],
    options?: { skipDuplicates?: boolean }
  ) => boolean;
}

/**
 * Schnittstelle für das useItemForm-Composable
 */
export interface IUseItemForm {
  isAddingItem: Ref<boolean>;
  itemNameInput: Ref<HTMLInputElement | null>;
  focusItemNameInput: () => void;
  clearItemNameInput: () => void;
  showItemForm: () => void;
  hideItemForm: () => void;
  closeItemForm: () => void;
}

/**
 * Schnittstelle für das useItemManagement-Composable
 */
export interface IUseItemManagement {
  allItems: ComputedRef<IShoppingItem[]>;
  getItemsGrouped: (categories: string[]) => Record<string, IShoppingItem[]>;
  addItem: (itemData: Partial<IShoppingItem>) => IShoppingItem | null;
  removeItem: (item: string | ShoppingItem) => boolean;
  toggleItemChecked: (item: string | IShoppingItem) => boolean;
  clearCheckedItems: () => boolean;
  updateCategoriesInItems: (categoryId: string, newName: string) => boolean;
}

/**
 * Schnittstelle für das useItemSuggestions-Composable
 */
export interface IUseItemSuggestions {
  itemHistory: Ref<Record<string, ItemHistoryEntry>>;
  getSuggestions: (term?: string) => ItemSuggestion[];
  addToHistory: (item: IShoppingItem) => void;
  initializeHistory: () => void;
  historyStats: ComputedRef<{
    totalItems: number;
    uniqueItems: number;
    topCategories: { name: string; count: number }[];
  }>;
}

/**
 * Schnittstelle für das useLocalStorage-Composable
 */
export interface IUseLocalStorage {
  saveItem: <T>(key: string, data: T) => boolean;
  loadItem: <T>(key: string, defaultValue?: T) => T | null;
  removeItem: (key: string) => boolean;
  clear: () => boolean;
}

/**
 * Schnittstelle für das useDarkMode-Composable
 */
export interface IUseDarkMode {
  isDarkMode: Ref<boolean>;
  toggleDarkMode: () => void;
  enableDarkMode: () => void;
  disableDarkMode: () => void;
}
