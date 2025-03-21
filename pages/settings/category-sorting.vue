<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCategoryStore } from '~/stores/category';
import CategorySortingList from '~/components/category-sorting/CategorySortingList.vue';

// Store-Instanz erzeugen
const categoryStore = useCategoryStore();

// Lokale Variablen
const isLoading = ref(true);

// Computed-Eigenschaften
const activeTemplate = computed(() => categoryStore.currentTemplate);
const isCustomSortActive = computed(() => categoryStore.isCustomSortActive);

// Templates laden
onMounted(() => {
  // Store aus dem lokalen Speicher laden
  categoryStore.loadFromLocalStorage();
  isLoading.value = false;
});

// Event-Handler für Änderungen der Sortierung
const handleSortingChanged = () => {
  // Optional: Feedback an den Benutzer geben
};
</script>

<template>
  <div class="page-container">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold mb-6">Kategorien-Sortierung</h1>

      <div v-if="isLoading" class="flex justify-center items-center py-10">
        <span class="text-gray-500">Wird geladen...</span>
      </div>

      <div v-else>
        <div class="mb-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <h2 class="text-lg font-semibold mb-2">
              {{ activeTemplate.name }} - Sortierung nach Laufweg
            </h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Hier können Sie die Reihenfolge der Kategorien anpassen, um den typischen Laufweg in
              Ihrem Markt abzubilden. Die Sortierung wird für die Anzeige der Artikel in Ihrer
              Einkaufsliste verwendet.
            </p>

            <div class="bg-blue-50 dark:bg-blue-900 p-3 rounded-md mb-4">
              <div class="flex">
                <div class="shrink-0 text-blue-500 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-700 dark:text-blue-300">
                    {{ isCustomSortActive ? 'Im individuellen Sortiermodus können Sie die Reihenfolge per Drag & Drop anpassen.' : 'Aktuell wird die Standard-Reihenfolge verwendet. Wechseln Sie zum individuellen Sortiermodus, um Änderungen vorzunehmen.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sortierungsliste -->
          <CategorySortingList @sorting-changed="handleSortingChanged" />
        </div>

        <!-- Hinweis zur Verwendung -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-md font-semibold mb-2">Hinweise</h3>
          <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              Die Sortierung wirkt sich auf die Anzeige der Kategorien in Ihrer Einkaufsliste aus.
            </li>
            <li>
              Sie können zwischen Standard-Laufweg und individueller Sortierung wechseln.
            </li>
            <li>
              Der Standard-Laufweg entspricht dem typischen Aufbau des ausgewählten Markttyps.
            </li>
            <li>
              Die individuelle Sortierung bleibt auch nach Schließen der App erhalten.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
