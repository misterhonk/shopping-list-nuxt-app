<template>
  <!-- Optimized list container without unnecessary elements -->
  <div class="shopping-lists-container">
    <!-- Lists rendered directly without additional padding or headers -->
    <div
      v-for="list in shoppingListsStore.lists"
      :id="`list-${list.id}`"
      :key="list.id"
      class="list-item"
      @touchstart="e => handleTouchStart(e, list.id)"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchCancel"
    >
      <!-- List content -->
      <div class="list-content" @click="navigateToList(list.id)">
        <div class="list-title">{{ list.name }}</div>
        <div class="list-info">
          <span>{{ list.items.length }} Artikel</span>
          <span v-if="list.lastModified">Bearbeitet: {{ formatDate(list.lastModified) }}</span>
        </div>
      </div>

      <!-- Swipe action indicators (only visible during swipe) -->
      <div class="swipe-action-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
        <span>Löschen</span>
      </div>

      <div class="swipe-action-right">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          />
        </svg>
        <span>Bearbeiten</span>
      </div>
    </div>

    <!-- Add new list button - Floating action button style -->
    <button class="add-list-button" @click="showNewListDialog">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { useShoppingListsStore } from '@/stores/shoppingLists';

// Store
const shoppingListsStore = useShoppingListsStore();

// Touch handling parameters
const touchStartX = ref(0);
const touchEndX = ref(0);
const swipeThreshold = 80; // Minimum distance for swipe to trigger action
const currentSwipedListId = ref<string | null>(null);

// Methods for swipe actions
const handleTouchStart = (event: TouchEvent, listId: string): void => {
  touchStartX.value = event.touches[0].clientX;
  currentSwipedListId.value = listId;
};

const handleTouchMove = (event: TouchEvent): void => {
  if (!currentSwipedListId.value) {
    return;
  }
  touchEndX.value = event.touches[0].clientX;

  // Get the element being swiped
  const listElement = document.getElementById(`list-${currentSwipedListId.value}`);
  if (!listElement) {
    return;
  }

  // Calculate swipe distance
  const swipeDistance = touchEndX.value - touchStartX.value;

  // Apply transform during swipe for visual feedback (with limits)
  if (Math.abs(swipeDistance) < 150) {
    listElement.style.transform = `translateX(${swipeDistance}px)`;

    // Show action indicators based on swipe direction
    if (swipeDistance > 20) {
      listElement.classList.add('swiping-right');
      listElement.classList.remove('swiping-left');
    } else if (swipeDistance < -20) {
      listElement.classList.add('swiping-left');
      listElement.classList.remove('swiping-right');
    } else {
      listElement.classList.remove('swiping-left', 'swiping-right');
    }
  }
};

const handleTouchEnd = (): void => {
  if (!currentSwipedListId.value) {
    return;
  }

  // Get the element
  const listElement = document.getElementById(`list-${currentSwipedListId.value}`);
  if (!listElement) {
    return;
  }

  // Calculate the final swipe distance
  const swipeDistance = touchEndX.value - touchStartX.value;

  // Determine the action based on swipe direction and distance
  if (swipeDistance < -swipeThreshold) {
    // Swiped left (Delete action)
    performDeleteAction(currentSwipedListId.value);
  } else if (swipeDistance > swipeThreshold) {
    // Swiped right (Edit action)
    performEditAction(currentSwipedListId.value);
  }

  // Reset the element position with animation
  listElement.style.transition = 'transform 0.3s ease';
  listElement.style.transform = 'translateX(0)';
  listElement.classList.remove('swiping-left', 'swiping-right');

  // Reset state after animation completes
  setTimeout(() => {
    if (listElement) {
      listElement.style.transition = '';
    }
    currentSwipedListId.value = null;
  }, 300);
};

const performDeleteAction = (listId: string): void => {
  // Show confirmation dialog or directly delete
  if (confirm('Möchten Sie diese Liste wirklich löschen?')) {
    shoppingListsStore.deleteList(listId);
  }
};

const performEditAction = (listId: string): void => {
  // Navigate to edit page or show edit dialog
  // Implementation depends on your app's navigation/editing logic
  console.log(`Edit list: ${listId}`);
};

// Cancel swipe if touch is canceled
const handleTouchCancel = (): void => {
  handleTouchEnd();
};

onMounted(() => {
  // Add passive listeners for better performance on mobile
  document.addEventListener(
    'touchmove',
    e => {
      // Prevent default only when swiping a list item to avoid interfering with page scrolling
      if (currentSwipedListId.value) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
});
</script>

<style scoped>
.shopping-lists-container {
  position: relative;
  width: 100%;
  /* No padding at container level */
  padding: 0;
  /* Ensure the container fills the available space */
  display: flex;
  flex-direction: column;
  gap: 8px; /* Small gap between list items */
}

.list-item {
  position: relative;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  touch-action: pan-y; /* Allow vertical scrolling, but handle horizontal ourselves */
  transition: background-color 0.2s;
}

.dark .list-item {
  background-color: #2d3748;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Style for the actual list content */
.list-content {
  padding: 12px 16px;
  z-index: 1;
  position: relative;
  background-color: inherit;
}

.list-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.list-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.dark .list-info {
  color: #cbd5e0;
}

/* Swipe action indicators */
.swipe-action-left,
.swipe-action-right {
  position: absolute;
  top: 0;
  height: 100%;
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.swipe-action-left {
  right: 0;
  background-color: #e53e3e; /* Red for delete */
}

.swipe-action-right {
  left: 0;
  background-color: #3182ce; /* Blue for edit */
}

.swipe-action-left svg,
.swipe-action-right svg {
  fill: white;
  margin-bottom: 4px;
}

.swiping-left .swipe-action-left {
  opacity: 1;
}

.swiping-right .swipe-action-right {
  opacity: 1;
}

/* Floating action button */
.add-list-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3182ce;
  color: white;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.2s;
  z-index: 10;
}

.add-list-button:hover,
.add-list-button:focus {
  background-color: #2b6cb0;
}

.add-list-button:active {
  transform: scale(0.95);
}

.add-list-button svg {
  fill: white;
}

/* Media query for desktop */
@media (min-width: 768px) {
  .shopping-lists-container {
    padding: 0 12px; /* Add minimal padding on larger screens */
    gap: 12px; /* Slightly larger gap on desktop */
  }

  .list-item {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .list-content {
    padding: 16px 20px;
  }

  .list-title {
    font-size: 18px;
  }

  .list-info {
    font-size: 14px;
  }
}
</style>
