<template>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0 truncate">
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="hidden sm:inline">Erledigte löschen</span>
        </span>
      </button>
      
      <button
        @click="$emit('add-item')"
        class="btn btn-primary"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="hidden sm:inline">Artikel hinzufügen</span>
        </span>
      </button>

      <!-- Export/Import Dropdown -->
      <div class="relative inline-block text-left export-menu">
        <button
          @click="toggleExportMenu"
          class="btn btn-secondary"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            <span class="hidden sm:inline">Mehr</span>
          </span>
        </button>

        <div 
          v-if="showExportMenu" 
          class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10"
        >
          <div class="py-1" role="menu" aria-orientation="vertical">
            <button 
              @click="exportList"
              class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
              role="menuitem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Liste exportieren
            </button>
            <button 
              @click="importList"
              class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left cursor-pointer"
              role="menuitem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Liste importieren
            </button>
            <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
            <NuxtLink
              to="/statistics"
              class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
              role="menuitem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistiken anzeigen
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Composables und Komponenten
import { ref, onMounted, onUnmounted } from 'vue';
import ListSettingsModal from '~/components/settings/ListSettingsModal.vue';

const props = defineProps({
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

const emit = defineEmits([
  'add-item', 
  'clear-checked', 
  'update:template-id', 
  'update:name', 
  'update:favorite',
  'import-list',
  'export-list'
]);

const showExportMenu = ref(false);

// Toggle für das Export-Menü
const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value;
};

// Schließen des Menüs beim Klick außerhalb
const closeOnOutsideClick = (event) => {
  if (showExportMenu.value && !event.target.closest('.export-menu')) {
    showExportMenu.value = false;
  }
};

// Event-Listener für Klicks außerhalb des Menüs
onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeOnOutsideClick);
});

// Export-Funktion - nur noch ein Event an die Elternkomponente emittieren
const exportList = () => {
  console.log('Export-Funktion aufgerufen für:', props.listName);
  
  // Wir emittieren das Event ohne Daten, die Elternkomponente hat den aktuellen Zustand
  emit('export-list');
  showExportMenu.value = false;
};

// Import-Funktion
const importList = () => {
  emit('import-list');
  showExportMenu.value = false;
};
</script>
