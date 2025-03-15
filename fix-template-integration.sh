#!/bin/bash
# Skript zur Integration der Vorlageauswahl in die Hauptseite

# 1. Löschen der alten template-selector.vue
rm -f components/template-selector.vue

# 2. Sicherstellen, dass die aktuelle Version von TemplateSelector.vue korrekt ist
cat > components/list-settings/TemplateSelector.vue << 'EOL'
<template>
  <div class="mt-3" v-if="categoryStore">
    <label for="templateSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

<script setup>
import { ref, computed, watch } from 'vue';
import { useCategoryStore } from '../../stores/categoryStore';

// Props
const props = defineProps({
  listTemplateId: {
    type: String,
    default: 'supermarket'
  }
});

// Emits
const emit = defineEmits(['update:templateId']);

// Lokaler Zustand
let categoryStore = null;
const currentTemplateId = ref(props.listTemplateId);
const templatesList = computed(() => categoryStore?.templatesList || []);

// Kategorie-Store initialisieren (mit Fehlerbehandlung)
try {
  categoryStore = useCategoryStore();
} catch (e) {
  console.error('Fehler beim Initialisieren des Kategorie-Stores:', e);
}

// Aktualisiere Kategorie-Template
const updateTemplate = () => {
  // Template-Id an übergeordnete Komponente senden
  emit('update:templateId', currentTemplateId.value);
  
  // Template auch im Store aktivieren
  if (categoryStore) {
    try {
      categoryStore.activateTemplate(currentTemplateId.value);
    } catch (e) {
      console.error('Fehler beim Aktivieren des Templates:', e);
    }
  }
};

// Reagiere auf Änderungen der Props
watch(() => props.listTemplateId, (newVal) => {
  currentTemplateId.value = newVal;
}, { immediate: true });
</script>
EOL

# 3. Funktion zum Hinzufügen der TemplateSelector-Komponente zur index.vue
cat > add-template-selector.js << 'EOL'
const fs = require('fs');
const path = require('path');

// Pfad zur index.vue
const indexPath = path.join(__dirname, 'pages', 'index.vue');

// Datei einlesen
let content = fs.readFileSync(indexPath, 'utf8');

// Import hinzufügen, falls nicht vorhanden
if (!content.includes("import TemplateSelector from '../components/list-settings/TemplateSelector.vue'")) {
  content = content.replace(
    "import { useCategoryStore } from '../stores/categoryStore'",
    "import { useCategoryStore } from '../stores/categoryStore'\nimport TemplateSelector from '../components/list-settings/TemplateSelector.vue'"
  );
}

// Funktion zum Aktualisieren der Templates hinzufügen, falls nicht vorhanden
if (!content.includes('updateListTemplate')) {
  content = content.replace(
    "const templatesList = computed(() => categoryStore?.templatesList || [])",
    `const templatesList = computed(() => categoryStore?.templatesList || [])

// Funktion zum Aktualisieren des Templates einer Liste durch den Benutzer
const updateListTemplate = (templateId) => {
  const listIndex = shoppingLists.value.findIndex(list => list.id === currentListId.value)
  if (listIndex === -1) return
  
  // Aktualisiere die templateId in der Liste
  const newLists = JSON.parse(JSON.stringify(shoppingLists.value))
  newLists[listIndex].templateId = templateId
  shoppingLists.value = newLists
  
  // Aktiviere das Template im Store, falls verfügbar
  if (categoryStore) {
    try {
      categoryStore.activateTemplate(templateId)
    } catch (e) {
      console.error('Fehler beim Aktivieren der Template:', e)
    }
  }
  
  saveToLocalStorage()
}`
  );
}

// Suche nach der Stelle, an der wir die TemplateSelector einfügen können
const headerEnd = `{{ getCheckedItemsCount() }}/{{ getTotalItemsCount() }} Artikel eingekauft
              </span>
            </p>`;

const templateSelector = `{{ getCheckedItemsCount() }}/{{ getTotalItemsCount() }} Artikel eingekauft
              </span>
            </p>
            <!-- Template-Selektor einbinden -->
            <TemplateSelector 
              v-if="categoryStore"
              :list-template-id="getCurrentList().templateId || 'supermarket'"
              @update:template-id="updateListTemplate"
            />`;

// Tausche die Stelle aus
if (content.includes(headerEnd) && !content.includes('<!-- Template-Selektor einbinden -->')) {
  content = content.replace(headerEnd, templateSelector);
}

// Schreibe die Datei zurück
fs.writeFileSync(indexPath, content, 'utf8');
console.log('Die TemplateSelector-Komponente wurde erfolgreich zur index.vue hinzugefügt.');
EOL

# 4. Das Skript ausführbar machen
chmod +x add-template-selector.js

# 5. Node.js Skript ausführen
echo "🔹 Integration der Vorlageauswahl..."
node add-template-selector.js

echo "✅ Die Integration wurde abgeschlossen!"
echo "ℹ️  Führen Sie 'npm run dev' aus, um die Änderungen zu testen."
