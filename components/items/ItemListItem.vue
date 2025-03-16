<template>
  <li class="p-4 flex justify-between items-center">
    <div class="flex items-center flex-1">
      <input
        type="checkbox"
        :checked="item.checked"
        @change="$emit('toggle')"
        class="mr-3 h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
      />
      <div class="flex flex-col sm:flex-row sm:items-center flex-1">
        <span
          :class="{ 'line-through text-gray-400 dark:text-gray-500': item.checked }"
          class="font-medium mr-2"
        >
          {{ item.name }} ({{ item.quantity }})
        </span>
        <span v-if="item.price" class="text-sm text-gray-600 dark:text-gray-400">
          {{ formatPrice(item.price * item.quantity) }}
        </span>
        <span class="text-sm text-orange-500 dark:text-orange-400 sm:ml-auto">
          {{ getCategoryName(item.category) }}
        </span>
      </div>
    </div>
    <button
      @click="$emit('remove')"
      class="p-1 ml-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const getCategoryName = category => {
  if (typeof category === 'object' && category !== null && category.name) {
    return category.name;
  }
  if (typeof category === 'string') {
    return category;
  }
  return 'Sonstiges';
};

defineEmits(['toggle', 'remove']);

const formatPrice = price => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
};
</script>
