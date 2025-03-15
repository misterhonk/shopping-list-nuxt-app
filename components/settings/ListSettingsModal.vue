<template>
  <div>
    <!-- Settings Button -->
    <button @click="showSettings = true" class="btn btn-secondary">
      <span class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="hidden sm:inline">Einstellungen</span>
      </span>
    </button>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">Listeneinstellungen</h3>
          <button @click="showSettings = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Liste umbenennen -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Listenname
            </label>
            <div class="flex">
              <input 
                v-model="editedName" 
                type="text" 
                placeholder="Listenname" 
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <button 
                @click="updateListName" 
                class="ml-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                :disabled="!editedName.trim() || editedName === listName"
                :class="{'opacity-50 cursor-not-allowed': !editedName.trim() || editedName === listName}"
              >
                Ändern
              </button>
            </div>
          </div>
          
          <!-- Template auswählen -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategorien-Vorlage
            </label>
            <select 
              v-model="selectedTemplateId" 
              @change="updateTemplateId"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option 
                v-for="template in templates" 
                :key="template.id" 
                :value="template.id"
              >
                {{ template.name }}
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bestimmt, welche Kategorien für Artikel verfügbar sind
            </p>
            <p class="mt-1 text-sm text-blue-500 dark:text-blue-400">
              Mehr Vorlagen können auf der "Kategorien verwalten"-Seite erstellt werden
            </p>
          </div>
          
          <!-- Als Favorit markieren -->
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="favorite-checkbox" 
              v-model="isFavorite" 
              @change="updateFavoriteStatus"
              class="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label for="favorite-checkbox" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Als Favorit markieren
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <NuxtLink 
            to="/categories"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <span class="hidden xs:inline">Kategorien verwalten</span>
            <span class="xs:hidden">Kategorien</span>
          </NuxtLink>
          <button 
            @click="showSettings = false" 
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <span class="hidden xs:inline">Schließen</span>
            <span class="xs:hidden">×</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';

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
  isFavorite: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:template-id', 
  'update:name',
  'update:favorite'
]);

// UI Status
const showSettings = ref(false);

// Form data
const editedName = ref('');
const selectedTemplateId = ref('');
const isFavorite = ref(false);

// Initialize form data when props change
watch(() => props.listName, (newValue) => {
  editedName.value = newValue;
}, { immediate: true });

watch(() => props.templateId, (newValue) => {
  selectedTemplateId.value = newValue;
}, { immediate: true });

watch(() => props.isFavorite, (newValue) => {
  isFavorite.value = newValue;
}, { immediate: true });

// Update methods
const updateListName = () => {
  if (editedName.value.trim() && editedName.value !== props.listName) {
    emit('update:name', editedName.value);
  }
};

const updateTemplateId = () => {
  emit('update:template-id', selectedTemplateId.value);
};

const updateFavoriteStatus = () => {
  emit('update:favorite', isFavorite.value);
};

onMounted(() => {
  editedName.value = props.listName;
  selectedTemplateId.value = props.templateId;
  isFavorite.value = props.isFavorite;
});
</script>
