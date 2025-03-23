<template>
  <li
    class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
  >
    <div class="flex items-center flex-1" @click="handleToggle">
      <div class="custom-checkbox mr-3 cursor-pointer" @click.stop="handleToggle">
        <input type="checkbox" :checked="item.checked" class="custom-checkbox-input" />
        <div class="custom-checkbox-mark relative">
          <svg
            v-if="item.checked"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center flex-1">
        <span
          :class="{ 'line-through text-gray-400 dark:text-gray-500': item.checked }"
          class="font-medium mr-2 transition-all duration-200"
        >
          {{ item.name }} ({{ item.quantity }})
        </span>
        <span v-if="item.price" class="text-sm text-gray-600 dark:text-gray-400 sm:ml-auto">
          {{ formatPrice(item.price * item.quantity) }}
        </span>
      </div>
    </div>
    <button
      class="p-1 ml-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      @click.stop="$emit('remove')"
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
  </li>
</template>

<script setup lang="ts">
import type { ShoppingItem } from '~/types/app-types';

interface Props {
  item: ShoppingItem;
}

const _props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'toggle'): void;
  (e: 'remove'): void;
}>();

// Funktion zum Formatieren des Preises
const formatPrice = (price: number): string =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);

// Wrapper-Funktion für das Toggle-Event
const handleToggle = (): void => {
  emit('toggle');
};
</script>
