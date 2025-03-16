<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Einkaufsliste</h3>
    <form @submit.prevent="onSubmit">
      <div class="space-y-4">
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

        <!-- Template auswählen -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kategorien-Vorlage
          </label>
          <select
            v-model="selectedTemplateId"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option v-for="template in templates" :key="template.id" :value="template.id">
              {{ template.name }}
            </option>
          </select>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bestimmt, welche Kategorien für Artikel verfügbar sind
          </p>
        </div>

        <!-- Als Favorit markieren -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="favorite-checkbox-new"
            v-model="isFavorite"
            class="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label
            for="favorite-checkbox-new"
            class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Als Favorit markieren
          </label>
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
          :class="{ 'opacity-50 cursor-not-allowed': !isValid }"
        >
          Liste erstellen
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  templates: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['create', 'cancel']);

const listName = ref('');
const selectedTemplateId = ref('supermarket'); // Default template
const isFavorite = ref(false);

const isValid = computed(() => {
  return listName.value.trim() !== '';
});

const onSubmit = () => {
  if (!isValid.value) return;

  emit('create', listName.value, {
    templateId: selectedTemplateId.value,
    isFavorite: isFavorite.value,
  });

  // Reset form
  listName.value = '';
  selectedTemplateId.value = 'supermarket';
  isFavorite.value = false;
};

const onCancel = () => {
  // Reset form
  listName.value = '';
  selectedTemplateId.value = 'supermarket';
  isFavorite.value = false;

  emit('cancel');
};
</script>
