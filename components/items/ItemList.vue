<template>
  <div class="mb-8">
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-bold text-lg text-orange-500">Einkaufsliste</h3>
      <div
        v-if="totalPrice > 0"
        class="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
      >
        Gesamtpreis: {{ formatPrice(totalPrice) }}
      </div>
    </div>

    <div v-if="items.length > 0">
      <div v-for="category in groupedCategories" :key="category.id" class="mb-4">
        <h4
          class="text-md font-semibold text-gray-600 dark:text-gray-300 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-t-lg flex justify-between items-center"
        >
          <span>{{ category.name }}</span>
          <span
            v-if="getCategoryTotal(category.id) > 0"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            {{ formatPrice(getCategoryTotal(category.id)) }}
          </span>
        </h4>
        <ul
          class="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700"
        >
          <ItemListItem
            v-for="item in category.items"
            :key="item.id"
            :item="item"
            @toggle="$emit('toggle', item)"
            @remove="$emit('remove', item)"
          />
        </ul>
      </div>
    </div>
    <EmptyState v-else @add="$emit('add-new')" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

import EmptyState from './EmptyState.vue';
import ItemListItem from './ItemListItem.vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['toggle', 'remove', 'add-new']);

// Berechne den Gesamtpreis aller Artikel
const totalPrice = computed(() =>
  props.items.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0)
);

// Kategorien für die Gruppierung
const groupedItems = computed(() => {
  const groups = {};

  props.items.forEach(item => {
    const categoryId = item.category?.id || 'sonstiges';
    const categoryName = item.category?.name || 'Sonstiges';

    if (!groups[categoryId]) {
      groups[categoryId] = {
        id: categoryId,
        name: categoryName,
        items: [],
      };
    }

    groups[categoryId].items.push(item);
  });

  return groups;
});

// Liste der gruppierten Kategorien
const groupedCategories = computed(() =>
  Object.values(groupedItems.value).sort((a, b) => a.name.localeCompare(b.name))
);

// Berechne den Gesamtpreis pro Kategorie
const getCategoryTotal = categoryId => {
  if (!groupedItems.value[categoryId]) {
    return 0;
  }

  return groupedItems.value[categoryId].items.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );
};

// Formatiere den Preis
const formatPrice = price =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
</script>
