<template>
  <div class="page-container">
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold mb-6">Einstellungen</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Kategorie-Sortierung -->
        <NuxtLink
          to="/settings/category-sorting"
          class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Kategorie-Sortierung
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Sortierung der Kategorien nach Laufweg anpassen
                </p>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Platzhalter für weitere Einstellungen -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="p-5">
            <div class="flex items-center">
              <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Allgemeine Einstellungen
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Weitere Einstellungsmöglichkeiten folgen
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Keine zusätzlichen Funktionen notwendig
</script>
