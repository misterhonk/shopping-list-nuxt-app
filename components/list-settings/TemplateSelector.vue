<template>
  <div v-if="categoryStore" class="mt-3">
    <label
      for="templateSelect"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      Vorlage für diese Liste
    </label>
    <div class="flex gap-2">
      <select
        id="templateSelect"
        v-model="currentTemplateId"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
        @change="updateTemplate"
      >
        <option v-for="template in templatesList" :key="template.id" :value="template.id">
          {{ template.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logger initialisieren
import { ref, computed, watch } from 'vue';
import type { CategoryTemplate } from '~/types/app-types';

import { useCategoryStore } from '~/stores/categoryStore';
import { createLogger } from '~/utils/logger';

const logger = createLogger('TemplateSelector');

const props = withDefaults(defineProps<{
  listTemplateId: string;
}>(), {
  listTemplateId: 'supermarket',
});

// Emits
const emit = defineEmits<{
  (e: 'update:templateId', templateId: string): void;
}>();

// Lokaler Zustand
let categoryStore = null;
const currentTemplateId = ref<string>(props.listTemplateId);
const templatesList = computed<CategoryTemplate[]>(() => categoryStore?.templatesList ?? []);

// Kategorie-Store initialisieren (mit Fehlerbehandlung)
try {
  categoryStore = useCategoryStore();
} catch (e) {
  logger.error('Fehler beim Initialisieren des Kategorie-Stores:', e);
}

// Aktualisiere Kategorie-Template
const updateTemplate = (): void => {
  // Template-Id an übergeordnete Komponente senden
  emit('update:templateId', currentTemplateId.value);

  // Template auch im Store aktivieren
  if (categoryStore) {
    try {
      categoryStore.activateTemplate(currentTemplateId.value);
    } catch (e) {
      logger.error('Fehler beim Aktivieren des Templates:', e);
    }
  }
};

// Reagiere auf Änderungen der Props
watch(
  () => props.listTemplateId,
  newVal => {
    currentTemplateId.value = newVal;
  },
  { immediate: true }
);
</script>
