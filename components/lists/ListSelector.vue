<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
    <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-4">Meine Listen:</h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="list in lists"
        :key="list.id"
        @click="selectList(list.id)"
        class="px-4 py-2 rounded-md"
        :class="{
          'bg-orange-500 text-white': list.id === currentListId,
          'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600': list.id !== currentListId
        }"
      >
        <div class="flex items-center">
          <span>{{ list.name }}</span>
          <span class="ml-2 text-xs bg-white bg-opacity-30 rounded-full px-2 py-0.5">{{ getItemsCount(list) }}</span>
          <button
            v-if="lists.length > 1"
            @click.stop="deleteList(list.id)"
            class="ml-2 text-white text-opacity-70 hover:text-opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lists: {
    type: Array,
    default: () => []
  },
  currentListId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select', 'delete']);

const getItemsCount = (list) => {
  return Array.isArray(list.items) ? list.items.length : 0;
};

const selectList = (listId) => {
  emit('select', listId);
};

const deleteList = (listId) => {
  emit('delete', listId);
};
</script>
