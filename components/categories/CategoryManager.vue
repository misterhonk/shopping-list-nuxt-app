<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Kategorie-Vorlagen</h2>

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
            'border-gray-200 dark:border-gray-700': activeTemplateId !== template.id,
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

    <!-- Aktuelle Kategorien mit Sortierungsoptionen -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          Kategorien in "{{ currentTemplate.name }}"
        </h3>
        <div class="flex space-x-2">
          <button class="btn btn-primary" @click="showNewCategoryModal = true">
            <span class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Kategorie hinzufügen
            </span>
          </button>
        </div>
      </div>

      <!-- Sortierungssteuerung -->
      <div class="sorting-controls mb-4">
        <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
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

      <!-- Drag & Drop Kategorien-Liste -->
      <draggable
        v-model="sortableCategoriesArray"
        v-bind="dragOptions"
        item-key="id"
        handle=".drag-handle"
        class="bg-gray-50 dark:bg-gray-900 rounded-lg divide-y divide-gray-200 dark:divide-gray-700"
      >
        <template #item="{ element }">
          <li
            class="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center group relative"
          >
            <div class="flex items-center">
              <div
                v-if="isCustomSortActive"
                class="drag-handle cursor-move flex items-center justify-center mr-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 9l4-4 4 4"></path>
                  <path d="M5 15l4 4 4-4"></path>
                </svg>
              </div>
              <span class="font-medium text-gray-800 dark:text-gray-200">
                {{ element.name }}
              </span>
            </div>

            <div
              class="flex space-x-2 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity duration-200 absolute right-4 bg-gray-100 dark:bg-gray-800 py-1 px-2 rounded"
            >
              <button
                class="p-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                @click="editCategory(element)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                class="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                @click="deleteCategory(element)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </li>
        </template>
      </draggable>
    </div>

    <!-- Aktionen für Templates -->
    <div class="border-t pt-4 border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap gap-3">
        <button class="btn btn-secondary" @click="showNewTemplateModal = true">
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Neue Vorlage erstellen
          </span>
        </button>
        <button
          v-if="isTemplateCustom"
          class="btn btn-secondary"
          @click="showEditTemplateModal = true"
        >
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Vorlage bearbeiten
          </span>
        </button>
        <button v-if="isTemplateCustom" class="btn btn-danger" @click="confirmDeleteTemplate">
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Vorlage löschen
          </span>
        </button>
        <button class="btn btn-secondary" @click="resetToDefaults">
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Alle zurücksetzen
          </span>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <CategoryModals 
      v-model:new-category-modal="showNewCategoryModal"
      v-model:edit-category-modal="showEditCategoryModal"
      v-model:new-template-modal="showNewTemplateModal"
      v-model:edit-template-modal="showEditTemplateModal"
      v-model:delete-template-modal="showDeleteTemplateModal"
      v-model:new-category-name="newCategoryName"
      v-model:edit-category-name="editCategoryName"
      v-model:new-template="newTemplate"
      v-model:edit-template="editTemplate"
      v-model:current-editing-category="currentEditingCategory"
      :current-template="currentTemplate"
      :templates-list="templatesList"
      @add-category="addNewCategory"
      @save-edited-category="saveEditedCategory"
      @create-template="createNewTemplate"
      @save-edited-template="saveEditedTemplate"
      @delete-template="deleteCurrentTemplate"
    />
  </div>
</template>

<script>
import script from './CategoryManager.script.js';
export default script;
</script>

<style scoped>
/* CSS für Touch-Geräte */
@media (hover: none) {
  .group:active .group-hover\:opacity-100 {
    opacity: 1;
  }
}

.btn-danger {
  @apply px-4 py-2 rounded-md font-medium transition-all bg-red-500 text-white hover:bg-red-600;
}

.btn-primary {
  @apply px-4 py-2 rounded-md font-medium transition-all bg-orange-500 text-white hover:bg-orange-600;
}

.btn-secondary {
  @apply px-4 py-2 rounded-md font-medium transition-all bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
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
</style>
