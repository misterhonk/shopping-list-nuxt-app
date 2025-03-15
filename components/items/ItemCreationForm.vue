<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8" @keyup.esc="onCancel">
    <h3 class="text-xl font-bold mb-5 text-gray-800 dark:text-white">Neuer Artikel</h3>
    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Artikelname</label>
          <input 
            v-model="item.name" 
            type="text" 
            placeholder="z.B. Äpfel"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            ref="nameInput"
            autofocus
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Menge</label>
          <input 
            v-model.number="item.quantity" 
            type="number" 
            min="1"
            placeholder="1"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategorie</label>
          <select 
            v-model="item.category"
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
          @click="onCancel" 
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
        >
          Abbrechen
        </button>
        <button 
          type="submit"
          class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          :disabled="!isValid"
          :class="{'opacity-50 cursor-not-allowed': !isValid}"
        >
          Artikel hinzufügen
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => ['Obst & Gemüse', 'Fleisch & Fisch', 'Backwaren', 'Milchprodukte', 'Getränke', 'Sonstiges']
  }
});

const emit = defineEmits(['add', 'cancel']);

const item = reactive({
  name: '',
  quantity: 1,
  category: props.categories.length > 0 ? props.categories[0] : 'Sonstiges'
});

const nameInput = ref(null);

const isValid = computed(() => {
  return item.name && item.name.trim() !== '' && item.quantity > 0;
});

const onSubmit = () => {
  if (!isValid.value) return;
  
  emit('add', { ...item });
  
  // Zurücksetzen nach dem Hinzufügen
  item.name = '';
  item.quantity = 1;
  
  // Fokus setzen
  focusInput();
};

const onCancel = () => {
  item.name = '';
  item.quantity = 1;
  emit('cancel');
};

const focusInput = () => {
  if (nameInput.value) {
    nameInput.value.focus();
  }
};

onMounted(() => {
  focusInput();
});
</script>
