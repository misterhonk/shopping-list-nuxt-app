<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
    <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-4">Listeneinstellungen:</h3>
    
    <div class="mb-4">
      <label for="templateSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vorlage für diese Liste</label>
      <div class="flex gap-2">
        <select 
          id="templateSelect"
          v-model="localTemplateId"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          @change="updateTemplate"
        >
          <option v-for="template in templates" :key="template.id" :value="template.id">
            {{ template.name }}
          </option>
        </select>
        <NuxtLink 
          to="/categories" 
          class="btn btn-secondary whitespace-nowrap"
          title="Kategorien verwalten"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  templateId: {
    type: String,
    default: 'supermarket'
  },
  templates: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:templateId']);

const localTemplateId = ref(props.templateId);

// Bei Änderung von außen aktualisieren
watch(() => props.templateId, (newValue) => {
  localTemplateId.value = newValue;
});

const updateTemplate = () => {
  emit('update:templateId', localTemplateId.value);
};
</script>
