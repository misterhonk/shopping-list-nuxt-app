<script setup lang="ts">
import { computed, ref } from 'vue';
import { VueDraggable } from 'vue-draggable-next';
import { useCategoryStore } from '~/stores/category';

// Store-Instanz erzeugen
const categoryStore = useCategoryStore();

// Eigenschaften der Komponente
const props = defineProps({
  showControls: {
    type: Boolean,
    default: true,
  },
});

// Emit für Ereignisse
const emit = defineEmits(['sortingChanged']);

// Lokale Variablen
const enabled = ref(true);
const isMounted = ref(false);

// Computed Properties für Kategorien und Sortierungsoptionen
const categories = computed(() => categoryStore.currentCategories);
const sortedCategories = computed(() => categoryStore.sortedCategories);
const isCustomSortActive = computed(() => categoryStore.isCustomSortActive);
const activeTemplate = computed(() => categoryStore.currentTemplate);
const hasDefaultOrder = computed(() => Boolean(activeTemplate.value.defaultCategoryOrder?.length));

// Sortierbare Kategorie-IDs
const draggableCategories = computed({
  get: () => {
    // Ids der sortierten Kategorien zurückgeben
    return sortedCategories.value.map(cat => cat.id);
  },
  set: (value: string[]) => {
    // Wenn sich die Reihenfolge geändert hat, im Store aktualisieren
    categoryStore.updateCustomSortOrder(value);
    emit('sortingChanged', value);
  },
});

// Kategorien-Map für schnelleren Zugriff
const categoriesMap = computed(() => {
  const map = new Map();
  categories.value.forEach(cat => {
    map.set(cat.id, cat);
  });
  return map;
});

// Methoden
const toggleSortMode = () => {
  categoryStore.toggleSortMode();
  emit('sortingChanged', draggableCategories.value);
};

const resetToDefaultSort = () => {
  categoryStore.resetToDefaultSort();
  emit('sortingChanged', draggableCategories.value);
};

// Kategorie vom Namen anhand der ID erhalten
const getCategoryById = (id: string) => {
  return categoriesMap.value.get(id) || { name: id, id };
};
</script>

<template>
  <div class="category-sorting-container">
    <!-- Sortierungssteuerung -->
    <div v-if="showControls" class="sorting-controls mb-4">
      <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
        <div class="flex items-center">
          <span class="mr-2 text-sm text-gray-700 dark:text-gray-300">
            {{ isCustomSortActive ? 'Benutzerdefinierte Sortierung' : 'Standard-Laufweg' }}
          </span>
        </div>
        <div class="flex items-center">
          <button
            v-if="hasDefaultOrder"
            @click="toggleSortMode"
            class="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 mr-2"
          >
            {{ isCustomSortActive ? 'Zum Standard-Laufweg' : 'Individuell sortieren' }}
          </button>
          <button
            v-if="isCustomSortActive"
            @click="resetToDefaultSort"
            class="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>

    <!-- Drag & Drop Bereich -->
    <VueDraggable
      v-model="draggableCategories"
      :disabled="!isCustomSortActive || !enabled"
      item-key="id"
      group="categories"
      handle=".drag-handle"
      ghost-class="ghost"
      drag-class="dragging"
      class="category-list"
    >
      <template #item="{ element }">
        <div class="category-item">
          <div class="category-content">
            <div
              v-if="isCustomSortActive"
              class="drag-handle cursor-move flex items-center justify-center mr-2"
            >
              <span class="drag-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 9l4-4 4 4"></path>
                  <path d="M5 15l4 4 4-4"></path>
                </svg>
              </span>
            </div>
            <div class="category-name">
              {{ getCategoryById(element).name }}
            </div>
          </div>
        </div>
      </template>
    </VueDraggable>
  </div>
</template>

<style scoped>
.category-sorting-container {
  width: 100%;
}

.category-list {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgb(243, 244, 246);
}

.dark .category-list {
  background-color: rgb(31, 41, 55);
}

.category-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.dark .category-item {
  background-color: rgb(55, 65, 81);
  color: rgb(243, 244, 246);
}

.category-content {
  display: flex;
  align-items: center;
}

.category-name {
  flex-grow: 1;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.dark .ghost {
  background: #344965;
}

.dragging {
  background: #f0f9ff;
}

.dark .dragging {
  background: #1e3a5f;
}

.sorting-controls {
  margin-bottom: 1rem;
}
</style>
