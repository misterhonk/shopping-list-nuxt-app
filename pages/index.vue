<template>
  <div>
    <div class="mb-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-black text-gray-800 dark:text-gray-50">
          Einkaufslisten
        </h1>
        <button
          @click="isCreatingList = true"
          class="btn btn-primary"
          v-if="!isCreatingList"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Neue Liste
          </span>
        </button>
      </div>

      <!-- Form zum Erstellen einer neuen Liste -->
      <div v-if="isCreatingList" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Einkaufsliste</h3>
        <form @submit.prevent="createNewList">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Listenname
            </label>
            <input
              v-model="newListName"
              type="text"
              placeholder="z.B. Wocheneinkauf"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              autofocus
            />
          </div>
          <div class="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              @click="isCreatingList = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              :disabled="!newListName.trim()"
              :class="{'opacity-50 cursor-not-allowed': !newListName.trim()}"
            >
              Liste erstellen
            </button>
          </div>
        </form>
      </div>

      <!-- Listenauswahl -->
      <div v-if="shoppingLists.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-4">Meine Listen:</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="list in shoppingLists"
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
                v-if="shoppingLists.length > 1"
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
    </div>

    <div v-if="currentListId && initialized" class="mb-8">
      <!-- Listenname und Aktionsbuttons -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {{ getCurrentList().name }}
        </h2>
        <div class="flex space-x-2">
          <button
            @click="clearCheckedItems"
            class="btn btn-secondary"
            :disabled="getCheckedItemsCount() === 0"
            :class="{'opacity-50 cursor-not-allowed': getCheckedItemsCount() === 0}"
            v-if="getTotalItemsCount() > 0"
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
            v-if="!isAddingItem"
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

      <!-- Einstellungen für die aktuelle Liste -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-4">Listeneinstellungen:</h3>
        
        <!-- Vorlagenauswahl für die aktuelle Liste -->
        <div class="mb-4">
          <label for="templateSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vorlage für diese Liste</label>
          <div class="flex gap-2">
            <select 
              id="templateSelect"
              v-model="currentListTemplateId"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              @change="updateCurrentListTemplate"
            >
              <option v-for="template in templatesList" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
            <NuxtLink 
              to="/categories" 
              class="btn btn-secondary whitespace-nowrap"
              v-if="categoryStore"
              title="Kategorien verwalten"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Artikel-Hinzufügen-Formular -->
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
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useCategoryStore } from '../stores/categoryStore'

// Kategorie-Store verwenden (mit Fallback für den Fall, dass Pinia nicht verfügbar ist)
let categoryStore = null
let categories = ref(['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges'])

// Hilfsreferenz für die aktuelle Listen-Template
const currentListTemplateId = ref('')
const templatesList = computed(() => categoryStore?.templatesList || [])

try {
  categoryStore = useCategoryStore()
  // Kategorien aus dem Store beziehen
  categories = computed(() => {
    try {
      return categoryStore?.currentCategories || ['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges']
    } catch (e) {
      console.error('Fehler beim Abrufen der Kategorien:', e)
      return ['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges']
    }
  })
} catch (e) {
  console.error('Pinia konnte nicht initialisiert werden:', e)
}

// UI-Zustand und Daten
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
  category: 'Sonstiges' // Standardwert wird später aktualisiert
})

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
  const current = getCurrentList();
  const grouped = {};
  
  // Prüfen, ob items ein gültiges Array ist
  if (!Array.isArray(current.items)) {
    return categories.value.reduce((obj, cat) => { obj[cat] = []; return obj }, {});
  }
  
  // Für jede Kategorie ein Array erstellen (auch wenn leer)
  categories.value.forEach(category => {
    grouped[category] = [];
  });
  
  // Dann Elemente in die entsprechenden Kategorien einsortieren
  current.items.forEach(item => {
    const category = item.category || 'Sonstiges';
    if (grouped[category]) {
      grouped[category].push(item);
    } else {
      // Wenn die Kategorie nicht mehr existiert, zum Punkt "Sonstiges" hinzufügen
      if (!grouped['Sonstiges']) {
        grouped['Sonstiges'] = [];
      }
      grouped['Sonstiges'].push(item);
    }
  });
  
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
  
  // Finde einen passenden Template-ID basierend auf dem Namen (fallback auf 'supermarket')
  let templateId = 'supermarket';
  const lowerName = newListName.value.toLowerCase();
  
  // Versuche, aus dem Namen auf den Geschäftstyp zu schließen
  if (lowerName.includes('drogerie') || lowerName.includes('apotheke') || lowerName.includes('kosmetik')) {
    templateId = 'drugstore';
  } else if (lowerName.includes('baumarkt') || lowerName.includes('werkzeug') || lowerName.includes('bau')) {
    templateId = 'hardware';
  } else if (lowerName.includes('elektronik') || lowerName.includes('technik') || lowerName.includes('computer')) {
    templateId = 'electronics';
  }
  
  const newList = {
    id: Date.now().toString(),
    name: newListName.value.trim(),
    items: [],
    templateId: templateId
  }
  
  shoppingLists.value = [...shoppingLists.value, newList]
  currentListId.value = newList.id
  isCreatingList.value = false
  newListName.value = ''
  
  saveToLocalStorage()
}

// Beim Wechseln einer Liste auch die Kategorie-Vorlage wechseln
const selectList = (listId) => {
  currentListId.value = listId
  
  // Aktiviere die passende Kategorie-Vorlage für diese Liste
  const selectedList = shoppingLists.value.find(list => list.id === listId)
  if (selectedList && categoryStore && selectedList.templateId) {
    try {
      categoryStore.activateTemplate(selectedList.templateId)
      // Aktualisiere die currentListTemplateId
      currentListTemplateId.value = selectedList.templateId
    } catch (e) {
      console.error('Fehler beim Aktivieren der Template:', e)
    }
  }
  
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

// Funktion zum Aktualisieren des Templates der aktuellen Liste
const updateCurrentListTemplate = () => {
  const listIndex = shoppingLists.value.findIndex(list => list.id === currentListId.value)
  if (listIndex === -1) return
  
  // Aktualisiere die templateId in der Liste
  const newLists = JSON.parse(JSON.stringify(shoppingLists.value))
  newLists[listIndex].templateId = currentListTemplateId.value
  shoppingLists.value = newLists
  
  // Aktiviere das Template im Store
  if (categoryStore) {
    try {
      categoryStore.activateTemplate(currentListTemplateId.value)
    } catch (e) {
      console.error('Fehler beim Aktivieren der Template:', e)
    }
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
    
    // Speichern und Form zurücksetzen
    saveToLocalStorage()
    
    newItem.name = ''
    newItem.quantity = 1
    newItem.category = categories.value.length > 0 ? categories.value[0] : 'Sonstiges'
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
        items: Array.isArray(list.items) ? list.items : [],
        templateId: list.templateId || 'supermarket' // Fallback wenn keine Template-ID vorhanden ist
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
    items: [],
    templateId: 'supermarket' // Standardvorlage für neue Listen
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
      items: Array.isArray(list.items) ? list.items : [],
      templateId: list.templateId || 'supermarket'
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
  
  // Kategorie-Store initialisieren, falls verfügbar
  if (categoryStore) {
    try {
      categoryStore.loadFromLocalStorage()
      
      // Aktiviere die passende Kategorie-Vorlage für die aktuelle Liste
      const currentList = getCurrentList()
      if (currentList && currentList.templateId) {
        categoryStore.activateTemplate(currentList.templateId)
        currentListTemplateId.value = currentList.templateId
      }
    } catch (e) {
      console.error('Fehler beim Laden der Kategorien:', e)
    }
  }
})

// Watch für Kategorieänderungen, um Standardkategorie zu aktualisieren
watch(() => categories.value, (newCategories) => {
  if (newCategories && newCategories.length > 0 && !isAddingItem.value) {
    newItem.category = newCategories[0];
  }
}, { immediate: true });

// Watch für isAddingItem, um den Fokus zu setzen
watch(isAddingItem, (newVal) => {
  if (newVal) {
    focusItemNameInput()
  }
})
</script>

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
