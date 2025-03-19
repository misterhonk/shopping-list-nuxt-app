import { reactive, ref, computed } from 'vue';

import type { Category } from '../types';

/**
 * Composable für die Verwaltung des Artikelformulars
 * Bietet Funktionen zum Hinzufügen und Bearbeiten von Artikeln
 */
export function useItemForm() {
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
   * Öffnet das Formular für ein neues Item
   */
  const openItemForm = (): void => {
    isAddingItem.value = true;
    focusItemNameInput();
  };

  /**
   * Schließt das Formular für ein neues Item
   */
  const closeItemForm = (): void => {
    isAddingItem.value = false;
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
    openItemForm,
    closeItemForm,
  };
}
