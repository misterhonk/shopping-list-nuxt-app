<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-black text-gray-800 dark:text-gray-50">Kategorien verwalten</h1>
      <NuxtLink to="/" class="btn btn-secondary">
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Zurück
        </span>
      </NuxtLink>
    </div>

    <CategoryManager />
  </div>
</template>

<script setup lang="ts">
// Logger initialisieren
import { onMounted } from 'vue';

import CategoryManager from '~/components/categories/CategoryManager.vue';
import { createLogger } from '~/utils/logger';

const _logger = createLogger('categories');

// Stelle sicher, dass die Komponente ordnungsgemäß initialisiert ist
onMounted(() => {
  _logger.info('Categories page mounted');
});
</script>
