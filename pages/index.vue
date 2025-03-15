<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white transition-colors duration-200">
        Wöchentliche Einkaufsliste
        <span class="ml-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{{ checkedItemsCount }}/{{ totalItemsCount }} Artikel</span>
      </h2>
      <div class="flex gap-2">
        <button 
          @click="clearCheckedItems" 
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Erledigte löschen
        </button>
        <button 
          @click="isAddingItem = true" 
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
        >
          Hinzufügen
        </button>
      </div>
    </div>

    <div v-if="isAddingItem" class="mb-6 p-4 bg-white rounded-lg shadow dark:bg-dark-surface dark:text-white transition-colors duration-200">
      <h3 class="text-lg font-medium mb-3 dark:text-white">Neuer Artikel</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Name</label>
          <input 
            v-model="newItem.name" 
            type="text" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-200"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Menge</label>
          <input 
            v-model.number="newItem.quantity" 
            type="number" 
            min="1"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-200"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Kategorie</label>
          <select 
            v-model="newItem.category" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-200"
          >
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex justify-end space-x-3">
        <button 
          @click="isAddingItem = false" 
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Abbrechen
        </button>
        <button 
          @click="addNewItem" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          :disabled="!isFormValid"
        >
          Hinzufügen
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="(items, category) in itemsGrouped" :key="category" v-if="items && items.length > 0">
        <h3 class="text-lg font-medium text-gray-800 mb-2 dark:text-white transition-colors duration-200">{{ category }}</h3>
        <div class="bg-white rounded-lg shadow overflow-hidden dark:bg-dark-surface transition-colors duration-200">
          <ul class="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            <li v-for="item in items" :key="item.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    :id="item.id" 
                    :checked="item.checked" 
                    @change="toggleItemChecked(item.id)" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 transition-colors duration-200"
                  />
                  <label :for="item.id" class="ml-3 block">
                    <span :class="{
                      'line-through text-gray-400 dark:text-gray-500': item.checked, 
                      'text-gray-900 dark:text-white': !item.checked
                    }" class="transition-colors duration-200">
                      {{ item.name }} ({{ item.quantity }})
                    </span>
                  </label>
                </div>
                <button 
                  @click="removeItem(item.id)" 
                  class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                >
                  Löschen
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div v-if="totalItemsCount === 0" class="text-center p-12 bg-white rounded-lg shadow mt-4 dark:bg-dark-surface dark:text-gray-300 transition-colors duration-200">
      <p class="text-gray-500 dark:text-gray-400">Ihre Einkaufsliste ist leer. Fügen Sie Artikel hinzu, um loszulegen.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      categories: ['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges'],
      isAddingItem: false,
      newItem: {
        name: '',
        quantity: 1,
        category: 'Obst & Gemüse'
      }
    }
  },
  
  computed: {
    itemsGrouped() {
      const grouped = {};
      
      this.categories.forEach(category => {
        grouped[category] = this.items.filter(item => item.category === category);
      });
      
      return grouped;
    },
    
    checkedItemsCount() {
      return this.items.filter(item => item.checked).length;
    },
    
    totalItemsCount() {
      return this.items.length;
    },
    
    isFormValid() {
      return this.newItem.name && this.newItem.name.trim() !== '' && this.newItem.quantity > 0;
    }
  },
  
  methods: {
    addNewItem() {
      if (this.isFormValid) {
        const newItemObj = {
          id: Date.now().toString(),
          name: this.newItem.name,
          quantity: this.newItem.quantity,
          category: this.newItem.category,
          checked: false
        };
        
        this.items.push(newItemObj);
        this.saveToLocalStorage();
        
        // Reset form
        this.newItem = {
          name: '',
          quantity: 1,
          category: 'Obst & Gemüse'
        };
        
        this.isAddingItem = false;
      }
    },
    
    toggleItemChecked(id) {
      const item = this.items.find(item => item.id === id);
      if (item) {
        item.checked = !item.checked;
        this.saveToLocalStorage();
      }
    },
    
    removeItem(id) {
      this.items = this.items.filter(item => item.id !== id);
      this.saveToLocalStorage();
    },
    
    clearCheckedItems() {
      this.items = this.items.filter(item => !item.checked);
      this.saveToLocalStorage();
    },
    
    loadFromLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          const storedItems = localStorage.getItem('shoppingList');
          if (storedItems) {
            this.items = JSON.parse(storedItems);
          }
        } catch (error) {
          console.error('Failed to load from localStorage:', error);
        }
      }
    },
    
    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('shoppingList', JSON.stringify(this.items));
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
        }
      }
    }
  },
  
  mounted() {
    this.loadFromLocalStorage();
  }
}
</script>