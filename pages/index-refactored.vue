<template>
  <div>
    <PageHeader title="Einkaufslisten">
      <template #actions>
        <div class="flex space-x-2">
          <div class="hidden md:block mr-4 text-sm text-orange-500 font-medium self-center p-1 rounded-md">
            Neu: Preisverfolgung & Statistiken 🏐
          </div>
          <NuxtLink
            to="/categories"
            class="btn btn-secondary"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="hidden sm:inline">Kategorien</span>
            </span>
          </NuxtLink>
          <button
            v-if="!isCreatingList"
            @click="isCreatingList = true"
            class="btn btn-primary"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="hidden sm:inline">Neue Liste</span>
            </span>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Form zum Erstellen einer neuen Liste -->
    <ListCreationForm 
      v-if="isCreatingList" 
      :templates="templatesList"
      @create="createNewList" 
      @cancel="isCreatingList = false" 
    />

    <!-- Listenauswahl -->
    <ListSelector 
      v-if="lists.length > 0" 
      :lists="lists" 
      :current-list-id="currentListId" 
      @select="selectList" 
      @delete="deleteList" 
    />

    <div v-if="currentListId && initialized">
      <!-- Listenname und Aktionsbuttons -->
      <ListHeader 
        :list-name="currentList.name" 
        :template-id="currentListTemplateId" 
        :templates="templatesList"
        :has-checked-items="getCheckedItemsCount() > 0" 
        :is-favorite="currentList.isFavorite"
        @add-item="isAddingItem = true"
        @clear-checked="clearCheckedItems"
        @update:template-id="updateCurrentListTemplate"
        @update:name="updateCurrentListName"
        @update:favorite="updateCurrentListFavorite"
        @export-list="handleExportList"
        @import-list="openImportDialog"
      />

      <!-- Artikel-Hinzufügen-Formular -->
      <ItemCreationForm 
        v-if="isAddingItem" 
        :categories="categories"
        @add="addNewItem" 
        @cancel="isAddingItem = false" 
      />
      
      <!-- Artikelliste -->
      <ItemList 
        :items="allItems" 
        @toggle="toggleItemChecked" 
        @remove="removeItem"
        @add-new="isAddingItem = true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useCategoryStore } from '../stores/categoryStore';
import { useShoppingLists, useShoppingItems, useListImportExport } from '../composables';

// Layout-Komponenten
import PageHeader from '../components/layout/PageHeader.vue';

// Listen-Komponenten
import ListCreationForm from '../components/lists/ListCreationForm.vue';
import ListSelector from '../components/lists/ListSelector.vue';
import ListHeader from '../components/lists/ListHeader.vue';

// Artikel-Komponenten
import ItemCreationForm from '../components/items/ItemCreationForm.vue';
import ItemList from '../components/items/ItemList.vue';

// UI-Zustand
const isCreatingList = ref(false);

// Kategorie-Store verwenden (mit Fallback)
let categoryStore = null;
let categories = ref(['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges']);

try {
  categoryStore = useCategoryStore();
  // Kategorien aus dem Store beziehen
  categories = computed(() => {
    try {
      return categoryStore?.currentCategories || ['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges'];
    } catch (e) {
      console.error('Fehler beim Abrufen der Kategorien:', e);
      return ['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges'];
    }
  });
} catch (e) {
  console.error('Pinia konnte nicht initialisiert werden:', e);
}

// Templates aus dem CategoryStore
const templatesList = computed(() => categoryStore?.templatesList || []);

// Einkaufslisten verwalten
const { 
  lists,
  currentListId,
  currentList,
  initialized,
  currentListTemplateId,
  loadLists,
  createList,
  selectList,
  deleteList,
  updateListTemplate: updateCurrentListTemplate,
  updateListName: updateCurrentListName,
  updateListFavorite: updateCurrentListFavorite,
  getCheckedItemsCount,
  getTotalItemsCount
} = useShoppingLists();

// Artikel verwalten
const {
  allItems,
  isAddingItem,
  addNewItem,
  removeItem,
  toggleItemChecked,
  clearCheckedItems
} = useShoppingItems(lists, currentListId);

// Import/Export-Funktionen
const {
  handleExportList,
  handleImportList,
  openImportDialog
} = useListImportExport(createList, addItem, allItems);

// Neue Liste erstellen
const createNewList = (name, options) => {
  createList(name, options);
  isCreatingList.value = false;
};

// App-Initialisierung
onMounted(() => {
  loadLists();
  
  // Kategorie-Store initialisieren, falls verfügbar
  if (categoryStore) {
    try {
      categoryStore.loadFromLocalStorage();
      
      // Aktiviere die passende Kategorie-Vorlage für die aktuelle Liste
      if (currentList.value && currentList.value.templateId) {
        categoryStore.activateTemplate(currentList.value.templateId);
      }
    } catch (e) {
      console.error('Fehler beim Laden der Kategorien:', e);
    }
  }
});

// Watch für isAddingItem
watch(isAddingItem, (newVal) => {
  if (!newVal) {
    // Formular zurücksetzen wenn geschlossen
  }
});
</script>

<style>
/* Basisstil für Buttons */
.btn {
  @apply px-2 sm:px-4 py-2 rounded-md font-medium transition-all text-sm sm:text-base;
}

.btn-primary {
  @apply bg-orange-500 text-white hover:bg-orange-600;
}

.btn-secondary {
  @apply bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600;
}
</style>