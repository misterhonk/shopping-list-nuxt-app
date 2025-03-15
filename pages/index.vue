<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'

// Entfernen der nicht mehr benötigten Debug-Variablen
const initialized = ref(false)
const shoppingLists = ref([])
const currentListId = ref(null)
const isCreatingList = ref(false)
const newListName = ref('')
const isAddingItem = ref(false)
const itemNameInput = ref(null)
const newItem = reactive({
  name: '',
  quantity: 1,
  category: 'Obst & Gemüse'
})

const categories = [
  'Obst & Gemüse', 
  'Fleisch & Fisch', 
  'Backwaren', 
  'Milchprodukte', 
  'Getränke', 
  'Sonstiges'
]

// Helfer-Funktionen
const getCurrentList = () => {
  const list = shoppingLists.value.find(list => list.id === currentListId.value) 
  return list || { id: null, name: '', items: [] }
}

const getItemsCount = (list) => {
  return Array.isArray(list.items) ? list.items.length : 0
}

const getCheckedItemsCount = () => {
  const current = getCurrentList()
  return Array.isArray(current.items) 
    ? current.items.filter(item => item.checked).length 
    : 0
}

const getTotalItemsCount = () => {
  const current = getCurrentList()
  return Array.isArray(current.items) ? current.items.length : 0
}

// Kategoriebasierte Gruppierung von Elementen
const getItemsGrouped = computed(() => {
  console.log('getItemsGrouped wird berechnet');
  const current = getCurrentList();
  console.log('getCurrentList()', current);
  
  const grouped = {};
  
  // Prüfen, ob items ein gültiges Array ist
  if (!Array.isArray(current.items)) {
    console.log('items ist kein Array!');
    return categories.reduce((obj, cat) => { obj[cat] = []; return obj }, {});
  }
  
  console.log('Anzahl der Items:', current.items.length);
  
  // Für jede Kategorie ein Array erstellen (auch wenn leer)
  categories.forEach(category => {
    grouped[category] = [];
  });
  
  // Dann Elemente in die entsprechenden Kategorien einsortieren
  current.items.forEach(item => {
    console.log('Verarbeite Item:', item);
    const category = item.category || 'Sonstiges';
    if (grouped[category]) {
      grouped[category].push(item);
    } else {
      grouped['Sonstiges'].push(item);
    }
  });
  
  console.log('Kategorien mit Items:', Object.keys(grouped).filter(cat => grouped[cat].length > 0));
  return grouped;
})

// Alle Items in der aktuellen Liste für einfache Anzeige
const allItems = computed(() => {
  const current = getCurrentList()
  if (!Array.isArray(current.items)) {
    return []
  }
  return current.items
})

// Formularvalidierung
const isFormValid = computed(() => {
  return newItem.name && newItem.name.trim() !== '' && newItem.quantity > 0
})

// Daten-Aktionen
const createNewList = () => {
  if (!newListName.value.trim()) return
  
  const newList = {
    id: Date.now().toString(),
    name: newListName.value.trim(),
    items: [] 
  }
  
  shoppingLists.value = [...shoppingLists.value, newList]
  currentListId.value = newList.id
  isCreatingList.value = false
  newListName.value = ''
  
  saveToLocalStorage()
}

const selectList = (listId) => {
  currentListId.value = listId
  saveToLocalStorage()
}

const deleteList = (listId) => {
  if (shoppingLists.value.length <= 1) return
  
  shoppingLists.value = shoppingLists.value.filter(list => list.id !== listId)
  
  if (listId === currentListId.value) {
    currentListId.value = shoppingLists.value[0].id
  }
  
  saveToLocalStorage()
}

const addNewItem = () => {
  if (!isFormValid.value) return
  
  const newItemObj = {
    id: Date.now().toString(),
    name: newItem.name,
    quantity: newItem.quantity,
    category: newItem.category,
    checked: false
  }
  
  const listIndex = shoppingLists.value.findIndex(list => list.id === currentListId.value)
  
  if (listIndex !== -1) {
    // Tiefe Kopie der Liste erstellen
    const newLists = JSON.parse(JSON.stringify(shoppingLists.value))
    
    // Sicherstellen, dass items existiert
    if (!Array.isArray(newLists[listIndex].items)) {
      newLists[listIndex].items = []
    }
    
    // Item hinzufügen
    newLists[listIndex].items.push(newItemObj)
    shoppingLists.value = newLists
    
    console.log('Item hinzugefügt:', newItemObj)
    console.log('Neue Liste:', newLists[listIndex])
    
    // Speichern und Form zurücksetzen
    saveToLocalStorage()
    
    newItem.name = ''
    newItem.quantity = 1
    newItem.category = 'Obst & Gemüse'
    isAddingItem.value = false
  }
}

const toggleItemChecked = (id) => {
  const listIndex = shoppingLists.value.findIndex(list => list.id === currentListId.value)
  if (listIndex === -1) return
  
  if (!Array.isArray(shoppingLists.value[listIndex].items)) {
    return
  }
  
  const itemIndex = shoppingLists.value[listIndex].items.findIndex(item => item.id === id)
  if (itemIndex !== -1) {
    const newLists = JSON.parse(JSON.stringify(shoppingLists.value))
    newLists[listIndex].items[itemIndex].checked = !newLists[listIndex].items[itemIndex].checked
    shoppingLists.value = newLists
    saveToLocalStorage()
  }
}

const removeItem = (id) => {
  const listIndex = shoppingLists.value.findIndex(list => list.id === currentListId.value)
  if (listIndex === -1) return
  
  if (!Array.isArray(shoppingLists.value[listIndex].items)) {
    return
  }
  
  const newLists = JSON.parse(JSON.stringify(shoppingLists.value))
  newLists[listIndex].items = newLists[listIndex].items.filter(item => item.id !== id)
  shoppingLists.value = newLists
  saveToLocalStorage()
}

const clearCheckedItems = () => {
  const listIndex = shoppingLists.value.findIndex(list => list.id === currentListId.value)
  if (listIndex === -1) return
  
  if (!Array.isArray(shoppingLists.value[listIndex].items)) {
    return
  }
  
  const newLists = JSON.parse(JSON.stringify(shoppingLists.value))
  newLists[listIndex].items = newLists[listIndex].items.filter(item => !item.checked)
  shoppingLists.value = newLists
  saveToLocalStorage()
}

// LocalStorage-Funktionen
const loadFromLocalStorage = () => {
  try {
    const storedLists = localStorage.getItem('shoppingLists')
    
    if (storedLists) {
      const parsedLists = JSON.parse(storedLists)
      
      if (!Array.isArray(parsedLists)) {
        createDefaultList()
        return
      }
      
      // Explizite Aufbereitung der Daten
      shoppingLists.value = parsedLists.map(list => ({
        id: list.id,
        name: list.name,
        items: Array.isArray(list.items) ? list.items : []
      }))
      
      const currentId = localStorage.getItem('currentListId')
      if (currentId && shoppingLists.value.some(list => list.id === currentId)) {
        currentListId.value = currentId
      } else if (shoppingLists.value.length > 0) {
        currentListId.value = shoppingLists.value[0].id
      }
    } else {
      createDefaultList()
    }
  } catch (error) {
    createDefaultList()
  }
}

const createDefaultList = () => {
  const defaultList = {
    id: Date.now().toString(),
    name: 'Wocheneinkauf',
    items: []
  }
  
  shoppingLists.value = [defaultList]
  currentListId.value = defaultList.id
  saveToLocalStorage()
}

const saveToLocalStorage = () => {
  try {
    const cleanedLists = shoppingLists.value.map(list => ({
      id: list.id,
      name: list.name,
      items: Array.isArray(list.items) ? list.items : []
    }))
    
    localStorage.setItem('shoppingLists', JSON.stringify(cleanedLists))
    localStorage.setItem('currentListId', currentListId.value)
  } catch (error) {
    console.error('Fehler beim Speichern in localStorage:', error)
  }
}

// Fokus-Behandlung
const focusItemNameInput = () => {
  // Warten bis das DOM aktualisiert ist
  setTimeout(() => {
    if (itemNameInput.value) {
      itemNameInput.value.focus()
    }
  }, 100)
}

// App-Initialisierung
onMounted(() => {
  loadFromLocalStorage()
  initialized.value = true
})

// Watch für isAddingItem, um den Fokus zu setzen
watch(isAddingItem, (newVal) => {
  if (newVal) {
    focusItemNameInput()
  }
})
</script>

<template>
  <div>
    <!-- Ladeindikator -->
    <div v-if="!initialized" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin h-10 w-10 mx-auto mb-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-300 font-medium">Lädt Einkaufslisten...</p>
      </div>
    </div>

    <!-- Hauptinhalt der App -->
    <div v-else>
      <!-- Listen-Navigation -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-3xl font-black text-gray-800 dark:text-gray-50">
            Meine Einkaufslisten
          </h2>
          <button 
            @click="isCreatingList = true" 
            class="btn btn-primary hover:bg-orange-600"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Neue Liste
            </span>
          </button>
        </div>

        <!-- Liste der verfügbaren Einkaufslisten -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div 
            v-for="list in shoppingLists" 
            :key="list.id" 
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md"
            :class="{'ring-2 ring-orange-500': list.id === currentListId}"
            @click="selectList(list.id)"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-bold text-gray-800 dark:text-gray-100">{{ list.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ getItemsCount(list) }} Artikel
                </p>
              </div>
              <button 
                @click.stop="deleteList(list.id)" 
                class="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                v-if="shoppingLists.length > 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Formular zum Erstellen einer neuen Liste -->
        <div v-if="isCreatingList" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mt-4">
          <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Einkaufsliste erstellen</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name der Liste</label>
            <input 
              v-model="newListName" 
              type="text" 
              placeholder="z.B. Wocheneinkauf"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="mt-4 flex justify-end space-x-3">
            <button 
              @click="isCreatingList = false" 
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
            >
              Abbrechen
            </button>
            <button 
              @click="createNewList" 
              class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              :disabled="!newListName.trim()"
              :class="{'opacity-50 cursor-not-allowed': !newListName.trim()}"
            >
              Liste erstellen
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="shoppingLists.length > 0" class="border-t border-gray-200 dark:border-gray-700 pt-6">
        <!-- Aktuelle Liste Header -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-black text-gray-800 dark:text-gray-50">
              {{ getCurrentList().name }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mt-1 font-medium">
              <span class="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ getCheckedItemsCount() }}/{{ getTotalItemsCount() }} Artikel eingekauft
              </span>
            </p>
          </div>
          
          <div class="flex gap-3">
            <button 
              @click="clearCheckedItems" 
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
              @click="isAddingItem = true" 
              class="btn btn-primary"
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Hinzufügen
              </span>
            </button>
          </div>
        </div>

        <div v-if="isAddingItem" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8" @keyup.esc="isAddingItem = false">
          <h3 class="text-xl font-bold mb-5 text-gray-800 dark:text-white">Neuer Artikel</h3>
          <form @submit.prevent="isFormValid && addNewItem()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Artikelname</label>
                <input 
                  v-model="newItem.name" 
                  type="text" 
                  placeholder="z.B. Äpfel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  ref="itemNameInput"
                  autofocus
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Menge</label>
                <input 
                  v-model.number="newItem.quantity" 
                  type="number" 
                  min="1"
                  placeholder="1"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorie</label>
                <select 
                  v-model="newItem.category"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button 
                type="button"
                @click="isAddingItem = false" 
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              >
                Abbrechen
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                :disabled="!isFormValid"
                :class="{'opacity-50 cursor-not-allowed': !isFormValid}"
              >
                Artikel hinzufügen
              </button>
            </div>
          </form>
        </div>
        
        <!-- OPTIMIERTE ARTIKELANSICHT MIT KATEGORIEKENNZEICHNUNG -->
        <div class="mb-8">
          <h3 class="font-bold text-xl text-orange-500 mb-3">Alle Artikel:</h3>
          <ul class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
            <li v-for="item in allItems" :key="item.id" class="p-4 flex justify-between items-center">
              <div class="flex items-center flex-1">
                <input 
                  type="checkbox" 
                  :checked="item.checked" 
                  @change="toggleItemChecked(item.id)" 
                  class="mr-3 h-5 w-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div class="flex flex-col sm:flex-row sm:items-center flex-1">
                  <span :class="{'line-through text-gray-400 dark:text-gray-500': item.checked}" class="font-medium mr-2">
                    {{ item.name }} ({{ item.quantity }})
                  </span>
                  <span class="text-sm text-orange-500 dark:text-orange-400 sm:ml-auto">
                    {{ item.category }}
                  </span>
                </div>
              </div>
              <button 
                @click="removeItem(item.id)" 
                class="p-1 ml-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          </ul>
        </div>

        <!-- Kategoriebasierte Gruppierung wurde durch verbesserte einheitliche Listenansicht ersetzt -->
        
        <div v-if="getTotalItemsCount() === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div class="inline-flex justify-center items-center w-16 h-16 bg-gray-100 dark:bg-gray-700 text-orange-500 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Ihre Einkaufsliste ist leer</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
            Fügen Sie Artikel hinzu, um mit Ihrer Einkaufsliste zu beginnen.
          </p>
          <button 
            @click="isAddingItem = true" 
            class="mt-5 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ersten Artikel hinzufügen
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Basisstil für Buttons */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-all;
}

.btn-primary {
  @apply bg-orange-500 text-white hover:bg-orange-600;
}

.btn-secondary {
  @apply bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600;
}
</style>
