<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">
      Kategorie-Vorlagen
    </h2>

    <!-- Template-Auswahl -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Vorlage auswählen
      </label>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="template in templatesList"
          :key="template.id"
          class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
          :class="{
            'border-orange-500 bg-orange-50 dark:bg-gray-700': activeTemplateId === template.id,
            'border-gray-200 dark:border-gray-700': activeTemplateId !== template.id
          }"
          @click="activateTemplate(template.id)"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-gray-800 dark:text-white">
                {{ template.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ template.description }}
              </p>
            </div>
            <div class="flex space-x-1">
              <span 
                v-if="template.isCustom" 
                class="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded-full"
              >
                Eigene
              </span>
              <span 
                v-else 
                class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full"
              >
                Standard
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aktuelle Kategorien -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          Kategorien in "{{ currentTemplate.name }}"
        </h3>
        <div class="flex space-x-2">
          <button
            v-if="!isEditMode"
            @click="toggleEditMode"
            class="btn btn-secondary"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Bearbeiten
            </span>
          </button>
          <button
            v-else
            @click="toggleEditMode"
            class="btn btn-secondary"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Abbrechen
            </span>
          </button>
          <button
            v-if="isEditMode"
            @click="showNewCategoryModal = true"
            class="btn btn-primary"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Kategorie hinzufügen
            </span>
          </button>
        </div>
      </div>

      <!-- Kategorienliste -->
      <ul class="bg-gray-50 dark:bg-gray-900 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="(category, index) in currentCategories"
          :key="category"
          class="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center"
        >
          <span class="font-medium text-gray-800 dark:text-gray-200">
            {{ category }}
          </span>
          <div v-if="isEditMode" class="flex space-x-2">
            <button
              @click="editCategory(category)"
              class="p-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="deleteCategory(category)"
              class="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Aktionen für Templates -->
    <div class="border-t pt-4 border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap gap-3">
        <button
          @click="showNewTemplateModal = true"
          class="btn btn-secondary"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Neue Vorlage erstellen
          </span>
        </button>
        <button
          v-if="isTemplateCustom"
          @click="showEditTemplateModal = true"
          class="btn btn-secondary"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Vorlage bearbeiten
          </span>
        </button>
        <button
          v-if="isTemplateCustom"
          @click="confirmDeleteTemplate"
          class="btn btn-danger"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Vorlage löschen
          </span>
        </button>
        <button
          @click="resetToDefaults"
          class="btn btn-secondary"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Alle zurücksetzen
          </span>
        </button>
      </div>
    </div>

    <!-- Modal für neue Kategorie -->
    <div v-if="showNewCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Kategorie hinzufügen</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kategoriename
          </label>
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="z.B. Gewürze"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            @keyup.enter="addNewCategory"
          />
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showNewCategoryModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          >
            Abbrechen
          </button>
          <button
            @click="addNewCategory"
            class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            :disabled="!newCategoryName.trim()"
            :class="{'opacity-50 cursor-not-allowed': !newCategoryName.trim()}"
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>

    <!-- Modal für Kategorie bearbeiten -->
    <div v-if="showEditCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Kategorie bearbeiten</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kategoriename
          </label>
          <input
            v-model="editCategoryName"
            type="text"
            placeholder="Kategoriename"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            @keyup.enter="saveEditedCategory"
          />
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showEditCategoryModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          >
            Abbrechen
          </button>
          <button
            @click="saveEditedCategory"
            class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            :disabled="!editCategoryName.trim()"
            :class="{'opacity-50 cursor-not-allowed': !editCategoryName.trim()}"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>

    <!-- Modal für neue Vorlage -->
    <div v-if="showNewTemplateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Vorlage erstellen</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name der Vorlage
            </label>
            <input
              v-model="newTemplate.name"
              type="text"
              placeholder="z.B. Mein Wochenmarkt"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Beschreibung (optional)
            </label>
            <input
              v-model="newTemplate.description"
              type="text"
              placeholder="Kurze Beschreibung der Vorlage"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Basiert auf (optional)
            </label>
            <select
              v-model="newTemplate.baseTemplateId"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">Leere Vorlage</option>
              <option 
                v-for="template in templatesList" 
                :key="template.id" 
                :value="template.id"
              >
                {{ template.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showNewTemplateModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          >
            Abbrechen
          </button>
          <button
            @click="createNewTemplate"
            class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            :disabled="!newTemplate.name.trim()"
            :class="{'opacity-50 cursor-not-allowed': !newTemplate.name.trim()}"
          >
            Vorlage erstellen
          </button>
        </div>
      </div>
    </div>

    <!-- Modal für Vorlage bearbeiten -->
    <div v-if="showEditTemplateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Vorlage bearbeiten</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name der Vorlage
            </label>
            <input
              v-model="editTemplate.name"
              type="text"
              placeholder="Name der Vorlage"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Beschreibung
            </label>
            <input
              v-model="editTemplate.description"
              type="text"
              placeholder="Beschreibung der Vorlage"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showEditTemplateModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          >
            Abbrechen
          </button>
          <button
            @click="saveEditedTemplate"
            class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            :disabled="!editTemplate.name.trim()"
            :class="{'opacity-50 cursor-not-allowed': !editTemplate.name.trim()}"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>

    <!-- Modal für Template-Löschung bestätigen -->
    <div v-if="showDeleteTemplateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Vorlage löschen</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">
          Sind Sie sicher, dass Sie die Vorlage "{{ currentTemplate.name }}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteTemplateModal = false"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          >
            Abbrechen
          </button>
          <button
            @click="deleteCurrentTemplate"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCategoryStore } from '../../stores/categoryStore';

// Wrapper für den Pinia-Store mit Fehlerbehandlung
let categoryStore = null;
try {
  categoryStore = useCategoryStore();
} catch (e) {
  console.error('Fehler beim Initialisieren des CategoryStore:', e);
}

// Daten aus dem Store
const templatesList = computed(() => categoryStore?.templatesList || []);
const currentTemplate = computed(() => categoryStore?.currentTemplate || { name: 'Standard', categories: [] });
const currentCategories = computed(() => categoryStore?.currentCategories || []);
const activeTemplateId = computed(() => categoryStore?.activeTemplateId || '');
const isTemplateCustom = computed(() => {
  return categoryStore?.customTemplates && categoryStore.customTemplates[activeTemplateId.value] !== undefined;
});

// UI-Zustand
const isEditMode = ref(false);
const showNewCategoryModal = ref(false);
const showEditCategoryModal = ref(false);
const showNewTemplateModal = ref(false);
const showEditTemplateModal = ref(false);
const showDeleteTemplateModal = ref(false);

// Formulardaten
const newCategoryName = ref('');
const editCategoryName = ref('');
const currentEditingCategory = ref('');
const newTemplate = ref({
  name: '',
  description: '',
  baseTemplateId: ''
});
const editTemplate = ref({
  name: '',
  description: ''
});

// Beim Laden der Komponente
onMounted(() => {
  if (categoryStore) {
    try {
      categoryStore.loadFromLocalStorage();
    } catch (e) {
      console.error('Fehler beim Laden aus localStorage:', e);
    }
  }
});

// Methoden
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const activateTemplate = (templateId) => {
  if (!categoryStore) return;
  categoryStore.activateTemplate(templateId);
};

const addNewCategory = () => {
  if (!categoryStore) return;
  if (newCategoryName.value.trim()) {
    categoryStore.addCategory(newCategoryName.value.trim());
    newCategoryName.value = '';
    showNewCategoryModal.value = false;
  }
};

const editCategory = (category) => {
  currentEditingCategory.value = category;
  editCategoryName.value = category;
  showEditCategoryModal.value = true;
};

const saveEditedCategory = () => {
  if (!categoryStore) return;
  if (editCategoryName.value.trim() && currentEditingCategory.value) {
    categoryStore.editCategory(currentEditingCategory.value, editCategoryName.value.trim());
    showEditCategoryModal.value = false;
    currentEditingCategory.value = '';
    editCategoryName.value = '';
  }
};

const deleteCategory = (category) => {
  if (!categoryStore) return;
  if (confirm(`Möchten Sie die Kategorie "${category}" wirklich löschen?`)) {
    categoryStore.deleteCategory(category);
  }
};

const createNewTemplate = () => {
  if (!categoryStore) return;
  if (newTemplate.value.name.trim()) {
    categoryStore.createTemplate(
      newTemplate.value.name.trim(),
      newTemplate.value.description.trim(),
      newTemplate.value.baseTemplateId || null
    );
    
    newTemplate.value = {
      name: '',
      description: '',
      baseTemplateId: ''
    };
    
    showNewTemplateModal.value = false;
  }
};

const confirmDeleteTemplate = () => {
  showDeleteTemplateModal.value = true;
};

const deleteCurrentTemplate = () => {
  if (!categoryStore) return;
  categoryStore.deleteTemplate(activeTemplateId.value);
  showDeleteTemplateModal.value = false;
};

const saveEditedTemplate = () => {
  if (!categoryStore) return;
  if (editTemplate.value.name.trim()) {
    categoryStore.updateTemplate(
      activeTemplateId.value,
      editTemplate.value.name.trim(),
      editTemplate.value.description.trim()
    );
    
    showEditTemplateModal.value = false;
  }
};

const resetToDefaults = () => {
  if (!categoryStore) return;
  if (confirm("Möchten Sie wirklich alle benutzerdefinierten Vorlagen zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
    categoryStore.resetToDefault();
  }
};
</script>

<style scoped>
.btn-danger {
  @apply px-4 py-2 rounded-md font-medium transition-all bg-red-500 text-white hover:bg-red-600;
}
</style>
