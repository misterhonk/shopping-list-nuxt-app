import { ref, reactive, computed } from 'vue';

/**
 * Composable für das Artikel-Hinzufügen-Formular
 */
export function useItemForm() {
  // UI-Status für Artikelformular
  const isAddingItem = ref(false);
  const itemNameInput = ref(null);
  
  // Neues Item Formular
  const newItem = reactive({
    name: '',
    quantity: 1,
    category: 'Sonstiges',
    price: 0
  });
  
  // Berechnete Eigenschaften
  const isFormValid = computed(() => {
    return newItem.name && newItem.name.trim() !== '' && newItem.quantity > 0;
  });
  
  /**
   * Setzt das Artikelformular zurück
   * @param {string} defaultCategory - Die Standardkategorie für neue Artikel
   */
  const resetItemForm = (defaultCategory = 'Sonstiges') => {
    newItem.name = '';
    newItem.quantity = 1;
    newItem.category = defaultCategory;
    newItem.price = 0;
    isAddingItem.value = false;
  };
  
  /**
   * Setzt den Fokus auf das Artikelnamen-Eingabefeld
   */
  const focusItemNameInput = () => {
    // Warten bis das DOM aktualisiert ist
    setTimeout(() => {
      if (itemNameInput.value) {
        itemNameInput.value.focus();
      }
    }, 100);
  };

  return {
    // Status und Daten
    isAddingItem,
    itemNameInput,
    newItem,
    isFormValid,
    
    // Aktionen
    resetItemForm,
    focusItemNameInput
  };
}