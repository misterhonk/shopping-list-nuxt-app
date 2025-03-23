<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Liste importieren</h3>

      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-300 mb-2">
          Wie möchten Sie die importierte Liste verarbeiten?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Importierte Liste: <span class="font-medium">{{ importData.name }}</span> mit
          {{ importData.items?.length ?? 0 }} Artikeln
        </p>

        <div class="space-y-2">
          <div class="flex items-start">
            <input
              id="option-new"
              v-model="selectedOption"
              type="radio"
              name="import-option"
              value="create"
              class="mt-1 mr-2"
            />
            <label for="option-new" class="text-gray-700 dark:text-gray-200">
              <span class="font-medium">Neue Liste erstellen</span>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Eine neue Liste mit allen importierten Artikeln erstellen.
              </p>
            </label>
          </div>

          <div v-if="availableLists.length > 0" class="flex items-start">
            <input
              id="option-update"
              v-model="selectedOption"
              type="radio"
              name="import-option"
              value="update"
              class="mt-1 mr-2"
            />
            <div class="flex-1">
              <label for="option-update" class="text-gray-700 dark:text-gray-200">
                <span class="font-medium">Bestehende Liste aktualisieren</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Artikel in eine bestehende Liste importieren.
                </p>
              </label>

              <div v-if="selectedOption === 'update'" class="mt-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ziel-Liste auswählen
                </label>
                <select
                  v-model="selectedListId"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option v-for="list in availableLists" :key="list.id" :value="list.id">
                    {{ list.name }} ({{ list.items?.length ?? 0 }} Artikel)
                  </option>
                </select>

                <!-- Optionen für den Import-Modus -->
                <div class="mt-4">
                  <div class="flex items-center mb-2">
                    <input
                      id="mode-append"
                      v-model="updateMode"
                      type="radio"
                      name="update-mode"
                      value="merge"
                      class="mr-2"
                    />
                    <label for="mode-append" class="text-sm text-gray-700 dark:text-gray-200">
                      Artikel hinzufügen (vorhandene behalten)
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input
                      id="mode-replace"
                      v-model="updateMode"
                      type="radio"
                      name="update-mode"
                      value="replace"
                      class="mr-2"
                    />
                    <label for="mode-replace" class="text-sm text-gray-700 dark:text-gray-200">
                      Alle Artikel ersetzen
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
          @click="$emit('cancel')"
        >
          Abbrechen
        </button>
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!isValid"
          :class="{ 'opacity-50 cursor-not-allowed': !isValid }"
          @click="confirmImport"
        >
          Importieren
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logger initialisieren
import { ref, computed, watch } from 'vue';

import { createLogger } from '~/utils/logger';

import type { ShoppingList, ShoppingItem } from '~/types/app-types';

const logger = createLogger('ImportOptionsModal');

interface ImportData {
  name: string;
  items: ShoppingItem[];
}

interface ImportOptions {
  mode: 'create' | 'merge' | 'replace';
  targetListId?: string;
  keepExistingItems: boolean;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    importData: ImportData;
    availableLists: ShoppingList[];
  }>(),
  {
    isOpen: false,
    importData: () => ({ name: '', items: [] }),
    availableLists: () => [],
  }
);

const emit = defineEmits<{
  (e: 'confirm', options: ImportOptions): void;
  (e: 'cancel'): void;
}>();

// Import-Option (neue Liste oder bestehende aktualisieren)
const selectedOption = ref<'create' | 'update'>('create');
const selectedListId = ref<string>('');
const updateMode = ref<'merge' | 'replace'>('merge'); // 'merge' oder 'replace'

// Wenn sich die Optionen ändern, aktualisiere Sichtbarkeit
watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      findMatchingList();
    }
  }
);

// Vorselektieren der Liste, falls Name identisch
const findMatchingList = (): void => {
  if (props.importData.name && props.availableLists.length > 0) {
    const matchingList = props.availableLists.find(
      list => list.name.toLowerCase() === props.importData.name.toLowerCase()
    );

    if (matchingList) {
      selectedOption.value = 'update';
      selectedListId.value = matchingList.id;
    }
  }
};

// Prüfen, ob alle notwendigen Optionen ausgewählt sind
const isValid = computed<boolean>(() => {
  if (selectedOption.value === 'create') {
    return true;
  }

  if (selectedOption.value === 'update') {
    return !!selectedListId.value;
  }

  return false;
});

// Import bestätigen
const confirmImport = (): void => {
  const options: ImportOptions = {
    mode: selectedOption.value === 'create' ? 'create' : updateMode.value,
    targetListId: selectedOption.value === 'update' ? selectedListId.value : undefined,
    keepExistingItems: updateMode.value === 'merge',
  };

  logger.info('Import-Optionen:', options);
  emit('confirm', options);
};
</script>
