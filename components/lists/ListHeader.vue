<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <!-- Listenname und Favoriten-Symbol -->
      <div class="flex items-center mb-4 sm:mb-0">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mr-2">{{ listName }}</h2>
        <button
          class="text-gray-400 hover:text-yellow-400 dark:text-gray-500 dark:hover:text-yellow-400 focus:outline-none"
          @click="toggleFavorite"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            :class="{ 'text-yellow-400': isFavorite }"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </div>

      <!-- Aktions-Buttons -->
      <div class="flex space-x-2">
        <button class="btn btn-primary" @click="$emit('add-item')">
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
            Artikel hinzufügen
          </span>
        </button>

        <div class="relative inline-block text-left">
          <div>
            <button type="button" class="btn btn-secondary" @click="isMenuOpen = !isMenuOpen">
              <span class="flex items-center">
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
                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                  />
                </svg>
              </span>
            </button>
          </div>

          <div
            v-if="isMenuOpen"
            class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          >
            <div
              class="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div v-if="hasCheckedItems" class="px-4 py-2 text-sm">
                <button
                  class="flex w-full text-left text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  @click="clearChecked"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
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
                  Abgehakte Artikel löschen
                </button>
              </div>

              <div class="border-t border-gray-100 dark:border-gray-700"></div>

              <div class="px-4 py-2 text-sm">
                <button
                  class="flex w-full text-left text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  @click="openRenameDialog"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Liste umbenennen
                </button>
              </div>

              <div class="px-4 py-2 text-sm">
                <div class="flex w-full text-left text-gray-700 dark:text-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <div>
                    <label class="block mb-1">Kategorie-Vorlage</label>
                    <select
                      class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                      @change="updateTemplateId($event.target.value)"
                    >
                      <option
                        v-for="template in templates"
                        :key="template.id"
                        :value="template.id"
                        :selected="templateId === template.id"
                      >
                        {{ template.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-gray-700"></div>

              <div class="px-4 py-2 text-sm">
                <button
                  class="flex w-full text-left text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  @click="exportList"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Liste exportieren
                </button>
              </div>

              <div class="px-4 py-2 text-sm">
                <button
                  class="flex w-full text-left text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                  @click="importList"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Liste importieren
                </button>
              </div>

              <div class="px-4 py-2 text-sm">
                <NuxtLink
                  to="/statistics"
                  class="flex w-full text-left text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Statistiken & Ausgaben
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Umbenennungs-Dialog -->
    <div v-if="isRenaming" class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
      <div class="flex space-x-2">
        <input
          ref="renameInput"
          v-model="newListName"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
          placeholder="Listenname"
          @keydown.enter="saveNewName"
          @keydown.esc="cancelRename"
        />
        <button
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          @click="saveNewName"
        >
          Speichern
        </button>
        <button
          class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
          @click="cancelRename"
        >
          Abbrechen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

import type { CategoryTemplate } from '~/types/app-types';

const _props = withDefaults(
  defineProps<{
    listName: string;
    templateId: string;
    templates: CategoryTemplate[];
    hasCheckedItems: boolean;
    isFavorite: boolean;
  }>(),
  {
    templateId: 'supermarket',
    templates: () => [],
    hasCheckedItems: false,
    isFavorite: false,
  }
);

const emit = defineEmits<{
  (e: 'add-item'): void;
  (e: 'clear-checked'): void;
  (e: 'update:name', name: string): void;
  (e: 'update:template-id', templateId: string): void;
  (e: 'update:favorite', isFavorite: boolean): void;
  (e: 'export-list'): void;
  (e: 'import-list'): void;
}>();

// Menüstatus
const isMenuOpen = ref<boolean>(false);

// Umbenennungs-Dialog
const isRenaming = ref<boolean>(false);
const newListName = ref<string>(_props.listName);
const renameInput = ref<HTMLInputElement | null>(null);

// Menü öffnen/schließen beim Klick außerhalb
const handleClickOutside = (event: MouseEvent): void => {
  // Prüfen, ob der Klick außerhalb des Menüs war
  if (isMenuOpen.value && !(event.target as HTMLElement).closest('.relative')) {
    isMenuOpen.value = false;
  }
};

// Event-Listener beim Mounten hinzufügen
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// Umbenennungs-Dialog öffnen
const openRenameDialog = (): void => {
  // Menü schließen
  isMenuOpen.value = false;

  // Dialog öffnen
  isRenaming.value = true;
  newListName.value = _props.listName;

  // Input fokussieren
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus();
    }
  });
};

// Neuen Namen speichern
const saveNewName = (): void => {
  // Prüfen, ob der Name nicht leer ist
  if (newListName.value.trim() !== '') {
    emit('update:name', newListName.value.trim());
  }

  // Dialog schließen
  isRenaming.value = false;
};

// Umbenennung abbrechen
const cancelRename = (): void => {
  isRenaming.value = false;
};

// Vorlage aktualisieren
const updateTemplateId = (id: string): void => {
  emit('update:template-id', id);
  isMenuOpen.value = false;
};

// Favoriten-Status umschalten
const toggleFavorite = (): void => {
  emit('update:favorite', !_props.isFavorite);
};

// Abgehakte Artikel löschen
const clearChecked = (): void => {
  isMenuOpen.value = false;
  emit('clear-checked');
};

// Liste exportieren
const exportList = (): void => {
  isMenuOpen.value = false;
  emit('export-list');
};

// Liste importieren
const importList = (): void => {
  isMenuOpen.value = false;
  emit('import-list');
};
</script>
