<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Einkaufsliste</h3>
    <form @submit.prevent="onSubmit">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Listenname
        </label>
        <input
          v-model="listName"
          type="text"
          placeholder="z.B. Wocheneinkauf"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          autofocus
        />
      </div>
      <div class="mt-4 flex justify-end space-x-3">
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
          Liste erstellen
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['create', 'cancel']);

const listName = ref('');

const isValid = computed(() => {
  return listName.value.trim() !== '';
});

const onSubmit = () => {
  if (!isValid.value) return;
  
  emit('create', listName.value);
  listName.value = '';
};

const onCancel = () => {
  listName.value = '';
  emit('cancel');
};
</script>
