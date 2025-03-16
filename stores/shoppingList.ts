import { defineStore } from 'pinia';

// HINWEIS: Dieser Store wird nicht mehr verwendet.
// Die Einkaufslisten-Logik wurde direkt in die index.vue-Komponente verschoben.
// Diese Datei bleibt zur Dokumentation erhalten.

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  checked: boolean;
}

export const useShoppingListStore = defineStore('shoppingList', {
  state: () => ({
    // Dieser Store wurde durch direkte localStorage-Verwaltung in der Komponente ersetzt
    items: [] as ShoppingItem[],
    categories: [
      'Obst & Gemüse',
      'Fleisch & Fisch',
      'Backwaren',
      'Milchprodukte',
      'Getränke',
      'Sonstiges',
    ],
  }),

  actions: {
    // Diese Aktionen werden nicht mehr verwendet
    addItem() {},
    removeItem() {},
    toggleItemChecked() {},
    updateItem() {},
    clearCheckedItems() {},
    clearAllItems() {},
    loadFromLocalStorage() {},
    saveToLocalStorage() {},
  },

  getters: {
    // Diese Getter werden nicht mehr verwendet
    itemsByCategory: () => ({}),
    checkedItemsCount: () => 0,
    totalItemsCount: () => 0,
  },
});
