<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
    <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-4">Meine Listen:</h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="list in lists"
        :key="list.id"
        @click="selectList(list.id)"
        class="px-4 py-2 rounded-md relative"
        :class="{
          'bg-orange-500 text-white': list.id === currentListId,
          'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600': list.id !== currentListId
        }"
      >
        <div class="flex items-center">
          <!-- Favoriten-Stern -->
          <svg 
            v-if="list.isFavorite" 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 mr-1 text-yellow-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          
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
  if (confirm('Möchtest du diese Liste wirklich löschen?')) {
    emit('delete', listId);
  }
};
</script>
