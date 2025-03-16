<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Liste importieren</h3>
      
      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-300 mb-2">
          Wie möchten Sie die importierte Liste verarbeiten?
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Importierte Liste: <span class="font-medium">{{ importData.name }}</span> 
          mit {{ importData.items?.length || 0 }} Artikeln
        </p>
        
        <div class="space-y-2">
          <div class="flex items-start">
            <input 
              type="radio" 
              id="option-new" 
              name="import-option" 
              value="new"
              v-model="selectedOption"
              class="mt-1 mr-2"
            />
            <label for="option-new" class="text-gray-700 dark:text-gray-200">
              <span class="font-medium">Neue Liste erstellen</span>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Eine neue Liste mit allen importierten Artikeln erstellen.
              </p>
            </label>
          </div>
          
          <div class="flex items-start" v-if="availableLists.length > 0">
            <input 
              type="radio" 
              id="option-update" 
              name="import-option" 
              value="update"
              v-model="selectedOption"
              class="mt-1 mr-2"
            />
            <div class="flex-1">
              <label for="option-update" class="text-gray-700 dark:text-gray-200">
                <span class="font-medium">Bestehende Liste aktualisieren</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Artikel in eine bestehende Liste importieren.
                </p>
              </label>
              
              <div v-if="selectedOption === 'update'" class="mt-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ziel-Liste auswählen
                </label>
                <select 
                  v-model="selectedListId"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option 
                    v-for="list in availableLists" 
                    :key="list.id" 
                    :value="list.id"
                  >
                    {{ list.name }} ({{ list.itemCount }} Artikel)
                  </option>
                </select>
                
                <!-- Optionen für den Import-Modus -->
                <div class="mt-4">
                  <div class="flex items-center mb-2">
                    <input 
                      type="radio" 
                      id="mode-append" 
                      name="update-mode" 
                      value="append"
                      v-model="updateMode"
                      class="mr-2"
                    />
                    <label for="mode-append" class="text-sm text-gray-700 dark:text-gray-200">
                      Artikel hinzufügen (vorhandene behalten)
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input 
                      type="radio" 
                      id="mode-replace" 
                      name="update-mode" 
                      value="replace"
                      v-model="updateMode"
                      class="mr-2"
                    />
                    <label for="mode-replace" class="text-sm text-gray-700 dark:text-gray-200">
                      Alle Artikel ersetzen
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
        >
          Abbrechen
        </button>
        <button
          @click="confirmImport"
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!isValid"
          :class="{'opacity-50 cursor-not-allowed': !isValid}"
        >
          Importieren
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  importData: {
    type: Object,
    default: () => ({ name: '', items: [] })
  },
  availableLists: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['confirm', 'cancel']);

// Import-Option (neue Liste oder bestehende aktualisieren)
const selectedOption = ref('new');
const selectedListId = ref('');
const updateMode = ref('append'); // 'append' oder 'replace'

// Vorselektieren der Liste, falls Name identisch
const findMatchingList = () => {
  if (props.importData?.name && props.availableLists.length > 0) {
    const matchingList = props.availableLists.find(list => 
      list.name.toLowerCase() === props.importData.name.toLowerCase()
    );
    
    if (matchingList) {
      selectedOption.value = 'update';
      selectedListId.value = matchingList.id;
    }
  }
};

// Beim Öffnen des Modals prüfen, ob eine passende Liste existiert
if (props.isOpen) {
  findMatchingList();
}

// Prüfen, ob alle notwendigen Optionen ausgewählt sind
const isValid = computed(() => {
  if (selectedOption.value === 'new') {
    return true;
  }
  
  if (selectedOption.value === 'update') {
    return !!selectedListId.value;
  }
  
  return false;
});

// Import bestätigen
const confirmImport = () => {
  emit('confirm', {
    option: selectedOption.value,
    listId: selectedOption.value === 'update' ? selectedListId.value : null,
    updateMode: updateMode.value
  });
};
</script>
