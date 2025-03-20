<template>
  <div class="mb-4">
    <!-- Horizontaler Scrollbereich für Listen -->
    <div class="overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
      <div class="inline-flex space-x-2">
        <button
          v-for="list in lists"
          :key="list.id"
          class="px-3 py-2 rounded-md relative inline-flex items-center whitespace-nowrap"
          :class="{
            'bg-orange-500 text-white': list.id === currentListId,
            'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600':
              list.id !== currentListId,
          }"
          @click="selectList(list.id)"
          @touchstart="handleTouchStart($event, list.id)"
          @touchmove="handleTouchMove($event)"
          @touchend="handleTouchEnd(list.id)"
          @touchcancel="handleTouchCancel()"
        >
          <!-- Favoriten-Stern -->
          <svg
            v-if="list.isFavorite"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 flex-shrink-0 text-yellow-400 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>

          <span class="truncate">{{ list.name }}</span>
          <span
            class="ml-1 text-xs bg-white bg-opacity-30 rounded-full px-1 sm:px-2 py-0.5 flex-shrink-0"
            >{{ getItemsCount(list) }}</span
          >
          
          <!-- Delete button - shown on non-touch devices -->
          <button
            v-if="lists.length > 1 && !isMobileDevice"
            class="ml-1 text-white text-opacity-70 hover:text-opacity-100 flex-shrink-0"
            @click.stop="deleteList(list.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          <!-- Swipe indicators (visible during swipe) -->
          <div 
            v-if="currentSwipedListId === list.id && swipeDirection === 'left'" 
            class="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white px-2 rounded-r-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
          </div>
          
          <div 
            v-if="currentSwipedListId === list.id && swipeDirection === 'right'" 
            class="absolute inset-y-0 left-0 flex items-center justify-center bg-blue-500 text-white px-2 rounded-l-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Quick Action Bar für aktuelle Liste (ersetzt ListHeader) -->
    <div v-if="currentListId" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <button 
          class="btn btn-primary"
          @click="$emit('add-item')"
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
            Artikel hinzufügen
          </span>
        </button>
      </div>
      <div>
        <button class="btn btn-secondary">
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
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  lists: {
    type: Array,
    default: () => [],
  },
  currentListId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['select', 'delete', 'add-item']);

const getItemsCount = (list: any) => (Array.isArray(list.items) ? list.items.length : 0);

const selectList = (listId: string) => {
  emit('select', listId);
};

const deleteList = (listId: string) => {
  if (confirm('Möchtest du diese Liste wirklich löschen?')) {
    emit('delete', listId);
  }
};

// Touch swipe functionality
const touchStartX = ref(0);
const touchEndX = ref(0);
const currentSwipedListId = ref<string | null>(null);
const swipeDirection = ref<string | null>(null);
const isMobileDevice = ref(false);

// Detecting if it's a mobile device
onMounted(() => {
  isMobileDevice.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
});

const handleTouchStart = (event: TouchEvent, listId: string) => {
  touchStartX.value = event.touches[0].clientX;
  currentSwipedListId.value = listId;
  swipeDirection.value = null;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!currentSwipedListId.value) return;
  
  touchEndX.value = event.touches[0].clientX;
  const swipeDistance = touchEndX.value - touchStartX.value;
  
  // Determine swipe direction for visual feedback
  if (swipeDistance > 50) {
    swipeDirection.value = 'right';
  } else if (swipeDistance < -50) {
    swipeDirection.value = 'left';
  } else {
    swipeDirection.value = null;
  }
};

const handleTouchEnd = (listId: string) => {
  if (!currentSwipedListId.value) return;
  
  const swipeDistance = touchEndX.value - touchStartX.value;
  
  // Swipe right to edit (placeholder)
  if (swipeDistance > 100) {
    console.log('Swipe right on list:', listId);
    // Placeholder for edit action
  }
  
  // Swipe left to delete
  if (swipeDistance < -100) {
    deleteList(listId);
  }
  
  // Reset
  resetSwipe();
};

const handleTouchCancel = () => {
  resetSwipe();
};

const resetSwipe = () => {
  currentSwipedListId.value = null;
  swipeDirection.value = null;
};
</script>

<style scoped>
/* Verstecken der Scrollbar, aber Beibehalten der Funktionalität */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Touch swipe transitions */
button {
  transition: transform 0.2s ease;
}
</style>
