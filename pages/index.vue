<template>
  <div>
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-display font-semibold text-warmgray-800 dark:text-warmgray-50 theme-transition">
          Wöchentliche Einkaufsliste
        </h2>
        <p class="text-warmgray-600 dark:text-warmgray-400 theme-transition mt-1">
          <span class="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ checkedItemsCount }}/{{ totalItemsCount }} Artikel eingekauft
          </span>
        </p>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="clearCheckedItems" 
          class="btn btn-secondary btn-small hover-lift"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Erledigte löschen
          </span>
        </button>
        <button 
          @click="isAddingItem = true" 
          class="btn btn-primary hover-lift"
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

    <div v-if="isAddingItem" class="card mb-8 theme-transition">
      <h3 class="text-xl font-display font-semibold mb-5 text-warmgray-800 dark:text-white theme-transition">Neuer Artikel</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1 theme-transition">Artikelname</label>
          <input 
            v-model="newItem.name" 
            type="text" 
            placeholder="z.B. Äpfel"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1 theme-transition">Menge</label>
          <input 
            v-model.number="newItem.quantity" 
            type="number" 
            min="1"
            placeholder="1"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-warmgray-700 dark:text-warmgray-300 mb-1 theme-transition">Kategorie</label>
          <select 
            v-model="newItem.category" 
            class="input-field"
          >
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
      <div class="mt-6 flex justify-end space-x-3">
        <button 
          @click="isAddingItem = false" 
          class="btn btn-secondary hover-lift"
        >
          Abbrechen
        </button>
        <button 
          @click="addNewItem" 
          class="btn btn-primary hover-lift"
          :disabled="!isFormValid"
          :class="{'opacity-50 cursor-not-allowed': !isFormValid}"
        >
          Artikel hinzufügen
        </button>
      </div>
    </div>

    <div class="space-y-8">
      <div v-for="(items, category) in itemsGrouped" :key="category" v-if="items && items.length > 0">
        <div class="flex items-center mb-4 text-warmgray-800 dark:text-warmgray-100 theme-transition">
          <h3 class="text-lg font-display font-semibold">{{ category }}</h3>
          <div class="ml-3 h-px flex-grow bg-warmgray-200 dark:bg-warmgray-700 theme-transition"></div>
        </div>
        
        <div class="card theme-transition">
          <ul class="divide-y divide-warmgray-100 dark:divide-warmgray-800 theme-transition">
            <li v-for="item in items" :key="item.id" class="py-4 first:pt-0 last:pb-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="mr-3">
                    <input 
                      type="checkbox" 
                      :id="item.id" 
                      :checked="item.checked" 
                      @change="toggleItemChecked(item.id)" 
                    />
                  </div>
                  <label :for="item.id" class="block">
                    <span :class="{
                      'line-through text-warmgray-400 dark:text-warmgray-600': item.checked, 
                      'text-warmgray-800 dark:text-warmgray-100': !item.checked
                    }" class="font-medium theme-transition">
                      {{ item.name }}
                    </span>
                    <span class="ml-2 text-sm text-warmgray-500 dark:text-warmgray-400 theme-transition">
                      ({{ item.quantity }})
                    </span>
                  </label>
                </div>
                <button 
                  @click="removeItem(item.id)" 
                  class="p-1 rounded-full text-warmgray-500 hover:text-brand-600 hover:bg-warmgray-100 dark:hover:bg-warmgray-800 dark:text-warmgray-400 dark:hover:text-brand-400 theme-transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div v-if="totalItemsCount === 0" class="card text-center py-12 theme-transition">
      <div class="inline-flex justify-center items-center w-16 h-16 bg-warmgray-100 dark:bg-warmgray-800 text-brand-500 rounded-full mb-4 theme-transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-display font-semibold text-warmgray-700 dark:text-warmgray-200 mb-2 theme-transition">Ihre Einkaufsliste ist leer</h3>
      <p class="text-warmgray-500 dark:text-warmgray-400 max-w-sm mx-auto theme-transition">
        Fügen Sie Artikel hinzu, um mit Ihrer Einkaufsliste zu beginnen.
      </p>
      <button 
        @click="isAddingItem = true" 
        class="btn btn-primary mt-5 hover-lift"
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