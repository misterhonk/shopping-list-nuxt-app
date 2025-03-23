<template>
  <!-- Modal für neue Kategorie -->
  <div
    v-if="newCategoryModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Neue Kategorie hinzufügen
      </h3>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Kategoriename
        </label>
        <input
          v-model="localNewCategoryName"
          type="text"
          placeholder="z.B. Gewürze"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          @keyup.enter="$emit('addCategory')"
        />
      </div>
      <div class="mt-6 flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          @click="updateNewCategoryModal(false)"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!localNewCategoryName.trim()"
          :class="{ 'opacity-50 cursor-not-allowed': !localNewCategoryName.trim() }"
          @click="$emit('addCategory')"
        >
          Hinzufügen
        </button>
      </div>
    </div>
  </div>

  <!-- Modal für Kategorie bearbeiten -->
  <div
    v-if="editCategoryModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Kategorie bearbeiten</h3>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Kategoriename
        </label>
        <input
          v-model="localEditCategoryName"
          type="text"
          placeholder="Kategoriename"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          @keyup.enter="$emit('saveEditedCategory')"
        />
      </div>
      <div class="mt-6 flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          @click="updateEditCategoryModal(false)"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!localEditCategoryName.trim()"
          :class="{ 'opacity-50 cursor-not-allowed': !localEditCategoryName.trim() }"
          @click="$emit('saveEditedCategory')"
        >
          Speichern
        </button>
      </div>
    </div>
  </div>

  <!-- Modal für neue Vorlage -->
  <div
    v-if="newTemplateModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Vorlage erstellen</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name der Vorlage
          </label>
          <input
            v-model="localNewTemplate.name"
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
            v-model="localNewTemplate.description"
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
            v-model="localNewTemplate.baseTemplateId"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="">Leere Vorlage</option>
            <option v-for="template in templatesList" :key="template.id" :value="template.id">
              {{ template.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="mt-6 flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          @click="updateNewTemplateModal(false)"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!localNewTemplate.name.trim()"
          :class="{ 'opacity-50 cursor-not-allowed': !localNewTemplate.name.trim() }"
          @click="$emit('createTemplate')"
        >
          Vorlage erstellen
        </button>
      </div>
    </div>
  </div>

  <!-- Modal für Vorlage bearbeiten -->
  <div
    v-if="editTemplateModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Vorlage bearbeiten</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name der Vorlage
          </label>
          <input
            v-model="localEditTemplate.name"
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
            v-model="localEditTemplate.description"
            type="text"
            placeholder="Beschreibung der Vorlage"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div class="mt-6 flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          @click="updateEditTemplateModal(false)"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!localEditTemplate.name.trim()"
          :class="{ 'opacity-50 cursor-not-allowed': !localEditTemplate.name.trim() }"
          @click="$emit('saveEditedTemplate')"
        >
          Speichern
        </button>
      </div>
    </div>
  </div>

  <!-- Modal für Template-Löschung bestätigen -->
  <div
    v-if="deleteTemplateModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Vorlage löschen</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Sind Sie sicher, dass Sie die Vorlage "{{ currentTemplate.name }}" löschen möchten? Diese
        Aktion kann nicht rückgängig gemacht werden.
      </p>
      <div class="flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          @click="updateDeleteTemplateModal(false)"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          @click="$emit('deleteTemplate')"
        >
          Löschen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Category, CategoryTemplate } from '~/types/app-types';

interface NewTemplate {
  name: string;
  description: string;
  baseTemplateId: string;
}

interface EditTemplate {
  name: string;
  description: string;
}

// Eigenschaften, die von außen übergeben werden
const props = withDefaults(
  defineProps<{
    newCategoryModal: boolean;
    editCategoryModal: boolean;
    newTemplateModal: boolean;
    editTemplateModal: boolean;
    deleteTemplateModal: boolean;
    newCategoryName: string;
    editCategoryName: string;
    newTemplate: NewTemplate;
    editTemplate: EditTemplate;
    currentEditingCategory: Category | null;
    currentTemplate: CategoryTemplate;
    templatesList: CategoryTemplate[];
  }>(),
  {
    newCategoryName: '',
    editCategoryName: '',
    newTemplate: () => ({ name: '', description: '', baseTemplateId: '' }),
    editTemplate: () => ({ name: '', description: '' }),
    currentEditingCategory: null,
    currentTemplate: () => ({ id: '', name: '', categories: [] }),
    templatesList: () => [],
  }
);

// Emits für Ereignisse
const emit = defineEmits<{
  (e: 'update:newCategoryModal', value: boolean): void;
  (e: 'update:editCategoryModal', value: boolean): void;
  (e: 'update:newTemplateModal', value: boolean): void;
  (e: 'update:editTemplateModal', value: boolean): void;
  (e: 'update:deleteTemplateModal', value: boolean): void;
  (e: 'update:newCategoryName', value: string): void;
  (e: 'update:editCategoryName', value: string): void;
  (e: 'update:newTemplate', value: NewTemplate): void;
  (e: 'update:editTemplate', value: EditTemplate): void;
  (e: 'update:currentEditingCategory', value: Category | null): void;
  (e: 'addCategory'): void;
  (e: 'saveEditedCategory'): void;
  (e: 'createTemplate'): void;
  (e: 'saveEditedTemplate'): void;
  (e: 'deleteTemplate'): void;
}>();

// Lokale berechnete Eigenschaften mit Zwei-Wege-Bindung
const localNewCategoryName = computed<{
  get: () => string;
  set: (value: string) => void;
}>({
  get: () => props.newCategoryName,
  set: value => emit('update:newCategoryName', value),
});

const localEditCategoryName = computed<{
  get: () => string;
  set: (value: string) => void;
}>({
  get: () => props.editCategoryName,
  set: value => emit('update:editCategoryName', value),
});

const localNewTemplate = computed<{
  get: () => NewTemplate;
  set: (value: NewTemplate) => void;
}>({
  get: () => props.newTemplate,
  set: value => emit('update:newTemplate', value),
});

const localEditTemplate = computed<{
  get: () => EditTemplate;
  set: (value: EditTemplate) => void;
}>({
  get: () => props.editTemplate,
  set: value => emit('update:editTemplate', value),
});

// Hilfsmethoden für die Aktualisierung der Modals
const updateNewCategoryModal = (value: boolean): void => {
  emit('update:newCategoryModal', value);
};

const updateEditCategoryModal = (value: boolean): void => {
  emit('update:editCategoryModal', value);
};

const updateNewTemplateModal = (value: boolean): void => {
  emit('update:newTemplateModal', value);
};

const updateEditTemplateModal = (value: boolean): void => {
  emit('update:editTemplateModal', value);
};

const updateDeleteTemplateModal = (value: boolean): void => {
  emit('update:deleteTemplateModal', value);
};
</script>
