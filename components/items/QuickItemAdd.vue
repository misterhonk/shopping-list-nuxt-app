<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4">
    <form class="flex items-center" @submit.prevent="addItem">
      <input
        ref="nameInput"
        v-model="itemName"
        type="text"
        placeholder="Artikel hinzufügen..."
        class="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        @focus="showDetails = true"
        @blur="hideDetailsOnBlur"
      />
      <button
        type="submit"
        class="px-3 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        :disabled="!isValid"
        :class="{ 'cursor-not-allowed': !isValid }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </form>

    <!-- Erweiterter Bereich für Details -->
    <div v-if="showDetails" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Menge</label
          >
          <div class="flex items-center h-9">
            <button
              type="button"
              class="px-2 py-1 h-full bg-orange-500 text-white rounded-l-md hover:bg-orange-600"
              @click="decreaseQuantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <input
              v-model.number="itemQuantity"
              type="number"
              min="1"
              class="w-12 h-full px-2 py-1 text-center border-t border-b border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              class="px-2 py-1 h-full bg-orange-500 text-white rounded-r-md hover:bg-orange-600"
              @click="increaseQuantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Kategorie</label
          >
          <select
            v-model="itemCategory"
            class="w-full px-2 py-1 h-9 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option v-for="category in normalizedCategories" :key="category.id" :value="category">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Preis (€)</label
          >
          <input
            v-model.number="itemPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full px-2 py-1 h-9 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div class="flex items-end">
          <button
            type="button"
            class="w-full px-3 py-1 h-9 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            @click="hideDetails"
          >
            Weniger Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

import type { Category } from '~/types/app-types';

type CategoryInput = Category | string;

const props = withDefaults(
  defineProps<{
    categories: CategoryInput[];
  }>(),
  {
    categories: () => [
      'Obst & Gemüse',
      'Fleisch & Fisch',
      'Backwaren',
      'Milchprodukte',
      'Getränke',
      'Sonstiges',
    ],
  }
);

interface NewItem {
  name: string;
  quantity: number;
  category: Category;
  price: number;
}

const emit = defineEmits<{
  (e: 'add-item', item: NewItem): void;
}>();

// Eingabefelder
const itemName = ref<string>('');
const itemQuantity = ref<number>(1);
const itemPrice = ref<number>(0);
const itemCategory = ref<Category | null>(null);
const showDetails = ref<boolean>(false);

// DOM-Referenzen
const nameInput = ref<HTMLInputElement | null>(null);

// Normalisierte Kategorien
const normalizedCategories = computed(() =>
  props.categories.map(category => {
    // Wenn es bereits ein Objekt mit id und name ist
    if (typeof category === 'object' && category.id && category.name) {
      return category;
    }
    // Wenn es ein String ist, konvertiere es zu einem Objekt
    if (typeof category === 'string') {
      return {
        id: category.toLowerCase().replace(/[\s&]/g, '_'),
        name: category,
      };
    }
    // Fallback
    return {
      id: `unknown_${Math.random().toString(36).substr(2, 9)}`,
      name: String(category ?? 'Sonstiges'),
    };
  })
);

// Kategorien überwachen und Auswahl aktualisieren wenn die Kategorien sich ändern
watch(
  normalizedCategories,
  newCategories => {
    if (newCategories.length > 0) {
      // Wenn die alte Kategorie nicht mehr in der Liste ist oder keine Kategorie gesetzt ist
      const currentCategoryExists =
        itemCategory.value &&
        newCategories.some(
          cat => cat.id === itemCategory.value.id || cat.name === itemCategory.value.name
        );

      if (!currentCategoryExists) {
        itemCategory.value = newCategories[0];
      }
    }
  },
  { immediate: true }
);

// Validierung
const isValid = computed(() => itemName.value && itemName.value.trim() !== '');

// Artikel hinzufügen
const addItem = () => {
  if (!isValid.value) {
    return;
  }

  const newItem = {
    name: itemName.value.trim(),
    quantity: itemQuantity.value,
    category: itemCategory.value,
    price: parseFloat(itemPrice.value) || 0,
  };

  emit('add-item', newItem);

  // Zurücksetzen und Fokus
  itemName.value = '';
  itemQuantity.value = 1;
  itemPrice.value = 0;

  // Fokus auf das Namensfeld setzen
  if (nameInput.value) {
    nameInput.value.focus();
  }
};

// Menge erhöhen/verringern
const increaseQuantity = () => {
  itemQuantity.value++;
};

const decreaseQuantity = () => {
  if (itemQuantity.value > 1) {
    itemQuantity.value--;
  }
};

// Details ausblenden
const hideDetails = () => {
  showDetails.value = false;
};

// Details ausblenden, wenn nicht mehr im Fokus
const hideDetailsOnBlur = (event: FocusEvent): void => {
  // Wir prüfen, ob wir zu einem Element innerhalb des Formulars navigieren
  // Wenn ja, dann behalten wir die Details offen
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  if (relatedTarget && (relatedTarget.closest('form') || relatedTarget.closest('.mt-3'))) {
    return;
  }

  // Ansonsten blenden wir die Details aus
  if (itemName.value.trim() === '') {
    showDetails.value = false;
  }
};

// Beim Mounten
onMounted(() => {
  // Fokus auf das Namensfeld setzen
  if (nameInput.value) {
    nameInput.value.focus();
  }
});
</script>
