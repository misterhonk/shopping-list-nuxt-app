import { ref, reactive, computed } from 'vue';

import type { ShoppingItem, Category } from '../types';
import type { Ref } from 'vue';

/**
 * Interface für das Formular zum Hinzufügen neuer Artikel
 */
interface ItemForm {
  name: string;
  quantity: number;
  category: Category | string;
  price: number;
  note?: string;
}

/**
 * Composable für das Artikel-Hinzufügen-Formular
 * Bietet Status und Funktionen für das Formular
 */
export function useItemForm() {
  // UI-Status für Artikelformular
  const isAddingItem = ref(false);
  const itemNameInput: Ref<HTMLInputElement | null> = ref(null);

  // Neues Item Formular
  const newItem = reactive<ItemForm>({
    name: '',
    quantity: 1,
    category: 'Sonstiges',
    price: 0,
    note: '',
  });

  // Berechnete Eigenschaften
  const isFormValid = computed<boolean>(() =>
    Boolean(newItem.name && newItem.name.trim() !== '' && newItem.quantity > 0)
  );

  /**
   * Setzt das Artikelformular zurück
   * @param defaultCategory - Die Standardkategorie für neue Artikel
   */
  const resetItemForm = (defaultCategory: Category | string = 'Sonstiges'): void => {
    newItem.name = '';
    newItem.quantity = 1;
    newItem.category = defaultCategory;
    newItem.price = 0;
    newItem.note = '';
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
   * Befüllt das Formular mit den Daten eines vorhandenen Artikels
   * @param item - Der zu bearbeitende Artikel
   */
  const populateFormWithItem = (item: ShoppingItem): void => {
    if (!item) {
      return;
    }

    newItem.name = item.name;
    newItem.quantity = item.quantity;
    newItem.category = item.category;
    newItem.price = item.price;
    newItem.note = item.note || '';

    isAddingItem.value = true;

    // Fokus auf das Namensfeld setzen
    focusItemNameInput();
  };

  return {
    // Status und Daten
    isAddingItem,
    itemNameInput,
    newItem,
    isFormValid,

    // Aktionen
    resetItemForm,
    focusItemNameInput,
    populateFormWithItem,
  };
}
