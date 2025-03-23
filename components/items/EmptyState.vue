<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
    <div
      class="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-700 text-orange-500 rounded-full mb-4"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </div>
    <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
      Ihre Einkaufsliste ist leer
    </h3>
    <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium mb-4">
      Fügen Sie Artikel hinzu, um mit Ihrer Einkaufsliste zu beginnen.
    </p>
    <button
      class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
      @click="$emit('add')"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Ersten Artikel hinzufügen
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
const _emit = defineEmits<{
  (e: 'add'): void;
}>();
</script>
