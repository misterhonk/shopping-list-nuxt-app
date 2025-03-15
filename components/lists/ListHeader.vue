<template>
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
      {{ listName }}
    </h2>
    <div class="flex space-x-2">
      <!-- Einstellungen Button -->
      <ListSettingsModal 
        :list-name="listName"
        :template-id="templateId"
        :templates="templates"
        :is-favorite="isFavorite"
        @update:template-id="$emit('update:template-id', $event)"
        @update:name="$emit('update:name', $event)"
        @update:favorite="$emit('update:favorite', $event)"
      />
      
      <button
        v-if="hasCheckedItems"
        @click="$emit('clear-checked')"
        class="btn btn-secondary"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Erledigte löschen
        </span>
      </button>
      
      <button
        @click="$emit('add-item')"
        class="btn btn-primary"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Artikel hinzufügen
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import ListSettingsModal from '~/components/settings/ListSettingsModal.vue';

defineProps({
  listName: {
    type: String,
    required: true
  },
  templateId: {
    type: String,
    required: true
  },
  templates: {
    type: Array,
    required: true
  },
  hasCheckedItems: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
});

defineEmits([
  'add-item', 
  'clear-checked', 
  'update:template-id', 
  'update:name', 
  'update:favorite'
]);
</script>
