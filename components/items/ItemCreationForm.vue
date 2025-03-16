<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8" @keyup.esc="onCancel">
    <h3 class="text-xl font-bold mb-5 text-gray-800 dark:text-white">Neuer Artikel</h3>
    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Artikelname</label
          >
          <input
            v-model="item.name"
            type="text"
            placeholder="z.B. Äpfel"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            ref="nameInput"
            autofocus
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Menge</label
          >
          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            placeholder="1"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Kategorie</label
          >
          <select
            v-model="item.category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
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
            v-model.number="item.price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div class="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          @click="onCancel"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!isValid"
          :class="{ 'opacity-50 cursor-not-allowed': !isValid }"
        >
          Artikel hinzufügen
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => [
      'Obst & Gemüse',
      'Fleisch & Fisch',
      'Backwaren',
      'Milchprodukte',
      'Getränke',
      'Sonstiges',
    ],
  },
  allLists: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['add', 'cancel']);

const normalizedCategories = computed(() => {
  return props.categories.map(category => {
    // Wenn es bereits ein Objekt mit id und name ist
    if (typeof category === 'object' && category !== null && category.id && category.name) {
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
      id: 'unknown_' + Math.random().toString(36).substr(2, 9),
      name: String(category || 'Sonstiges'),
    };
  });
});

const item = reactive({
  name: '',
  quantity: 1,
  category: null,
  price: 0,
});

// Kategorie initialisieren, wenn normalizedCategories verfügbar ist
onMounted(() => {
  if (normalizedCategories.value.length > 0) {
    item.category = normalizedCategories.value[0];
  }
});

const nameInput = ref(null);

const isValid = computed(() => {
  return item.name && item.name.trim() !== '' && item.quantity > 0;
});

const onSubmit = () => {
  if (!isValid.value) return;

  const itemToAdd = {
    name: item.name,
    quantity: item.quantity,
    category:
      typeof item.category === 'object'
        ? item.category
        : {
            id: 'sonstiges',
            name: String(item.category || 'Sonstiges'),
          },
    price: parseFloat(item.price) || 0,
  };

  // Zum Verlauf hinzufügen - vereinfachte Version ohne Speichern
  try {
    const itemHistory = JSON.parse(localStorage.getItem('itemHistory') || '{}');
    const normalizedName = item.name.toLowerCase().trim();
    const now = new Date().toISOString();

    const existingItem = itemHistory[normalizedName] || {
      count: 0,
      lastUsed: null,
      categories: {},
      prices: [],
    };

    existingItem.count += 1;
    existingItem.lastUsed = now;

    const categoryId = item.category?.id || 'sonstiges';
    existingItem.categories[categoryId] = (existingItem.categories[categoryId] || 0) + 1;

    if (item.price && item.price > 0) {
      existingItem.prices.push({
        price: item.price,
        date: now,
      });

      if (existingItem.prices.length > 10) {
        existingItem.prices = existingItem.prices.slice(-10);
      }
    }

    itemHistory[normalizedName] = existingItem;
    localStorage.setItem('itemHistory', JSON.stringify(itemHistory));
  } catch (e) {
    console.error('Fehler beim Speichern des Artikelverlaufs:', e);
  }

  emit('add', itemToAdd);

  // Zurücksetzen nach dem Hinzufügen
  item.name = '';
  item.quantity = 1;
  item.price = 0;

  // Fokus setzen
  focusInput();
};

const onCancel = () => {
  item.name = '';
  item.quantity = 1;
  item.price = 0;
  emit('cancel');
};

const focusInput = () => {
  if (nameInput.value) {
    nameInput.value.focus();
  }
};

onMounted(() => {
  focusInput();
});
</script>
