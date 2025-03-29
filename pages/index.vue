<template>
  <div>
    <PageHeader title="Einkaufslisten">
      <template #actions>
        <div class="flex space-x-2">
          <div
            class="hidden md:block mr-4 text-sm text-orange-500 font-medium self-center p-1 rounded-md"
          >
            Neu: Preisverfolgung & Statistiken 🏐
          </div>
          <NuxtLink to="/categories" class="btn btn-secondary">
            <span class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 sm:mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span class="hidden sm:inline">Kategorien</span>
            </span>
          </NuxtLink>
          <button v-if="!isCreatingList" class="btn btn-primary" @click="isCreatingList = true">
            <span class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 sm:mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span class="hidden sm:inline">Neue Liste</span>
            </span>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Form zum Erstellen einer neuen Liste -->
    <ListCreationForm
      v-if="isCreatingList"
      :templates="templatesList"
      @create="createNewList"
      @cancel="isCreatingList = false"
    />

    <!-- Listenauswahl -->
    <ListSelector
      v-if="lists.length > 0"
      :lists="lists"
      :current-list-id="currentListId"
      @select="selectList"
      @delete="deleteList"
    />

    <div v-if="currentListId && initialized">
      <!-- Schnelle Artikeleingabe -->
      <QuickItemAdd :categories="categories" @add-item="addNewItem" />

      <!-- Alte Artikel-Hinzufügen-Formular (auskommentiert) -->
      <!--
      <ItemCreationForm
        v-if="isAddingItem"
        :categories="categories"
        :all-lists="lists"
        @add="addNewItem"
        @cancel="isAddingItem = false"
      />
      -->

      <!-- Artikelliste -->
      <ItemList :items="currentListItems" @toggle="toggleItemChecked" @remove="removeItem" />
    </div>

    <!-- Import-Optionen-Dialog -->
    <ImportOptionsModal
      v-if="showImportOptions && importData"
      :is-open="showImportOptions"
      :import-data="importData"
      :available-lists="lists"
      @confirm="handleImportConfirm"
      @cancel="showImportOptions = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

// Layout-Komponenten
import ItemList from '~/components/items/ItemList.vue';
import QuickItemAdd from '~/components/items/QuickItemAdd.vue';
import PageHeader from '~/components/layout/PageHeader.vue';
// Listen-Komponenten
import ImportOptionsModal from '~/components/lists/ImportOptionsModal.vue';
import ListCreationForm from '~/components/lists/ListCreationForm.vue';
// import ListHeader from '~/components/lists/ListHeader.vue'; // Aktuell nicht verwendet
import ListSelector from '~/components/lists/ListSelector.vue';
// Artikel-Komponenten
import { useListImportExport } from '~/composables/importExport';
import { useShoppingItems } from '~/composables/useShoppingItems';
import { useShoppingLists } from '~/composables/useShoppingLists';
import { useCategoryStore } from '~/stores/category';
import { createLogger } from '~/utils/logger';

// Importe für Typdefinitionen
import type { IImportOptions, IShoppingItem, ICategory } from '~/types/app-types';

// Definiere den korrekten Typ für die Listenoptionen
interface IListOptions {
  templateId?: string;
  isFavorite?: boolean;
}

// Interface für neue Artikel (dient als Kompatibilitätsschicht)
interface INewItem {
  name: string;
  quantity: number;
  category: string | ICategory;
  price?: number;
  note?: string;
}

// Typdefinition für die Unsubscribe-Funktion
type UnsubscribeFunction = (() => void) | null;

// Typdefinition für OnCategoryUpdate
type OnCategoryUpdateFn = (categoryId: string, newName: string) => void;
type OnCategoryUpdateHandler = ((callback: OnCategoryUpdateFn) => UnsubscribeFunction) | undefined;

// Logger initialisieren
const logger = createLogger('IndexPage');

// UI-Zustand
const isCreatingList = ref(false);

// Kategorie-Store verwenden (mit Fallback)
const categoryStore = useCategoryStore();
let categories = ref([
  'Obst & Gemüse',
  'Fleisch & Fisch',
  'Backwaren',
  'Milchprodukte',
  'Getränke',
  'Sonstiges',
]);

try {
  // Kategorien aus dem Store beziehen
  categories = computed(() => {
    try {
      return (
        categoryStore.currentCategories ?? [
          'Obst & Gemüse',
          'Fleisch & Fisch',
          'Backwaren',
          'Milchprodukte',
          'Getränke',
          'Sonstiges',
        ]
      );
    } catch (e) {
      logger.error('Fehler beim Abrufen der Kategorien:', e);
      return [
        'Obst & Gemüse',
        'Fleisch & Fisch',
        'Backwaren',
        'Milchprodukte',
        'Getränke',
        'Sonstiges',
      ];
    }
  });
} catch (e) {
  logger.error('Pinia konnte nicht initialisiert werden:', e);
}

// Templates aus dem CategoryStore
const templatesList = computed(() => categoryStore.templatesList ?? []);

// Einkaufslisten verwalten
const {
  lists,
  currentListId,
  currentList,
  initialized,
  loadLists,
  createList,
  selectList: originalSelectList,
  deleteList,
  updateList,
} = useShoppingLists();

// Wrapper-Funktion für selectList, um den Rückgabetyp zu korrigieren
const selectList = (listId: string): boolean => {
  originalSelectList(listId);
  return true; // Wir nehmen an, dass die Funktion erfolgreich ist
};

// Artikel verwalten - Die currentListId wird hier übergeben
const {
  allItems,
  addNewItem: originalAddNewItem,
  removeItem,
  toggleItemChecked,
  updateCategoryInItems,
} = useShoppingItems(currentListId);

// Wrapper-Funktion für addNewItem, um den Typen anzupassen
const addNewItem = (item: INewItem): void => {
  originalAddNewItem(item as Partial<IShoppingItem>);
};

// Berechne eine gefilterte Liste mit nur den Artikeln der aktuell ausgewählten Liste
const currentListItems = computed(() => {
  if (!currentListId.value) {
    return [];
  }

  return allItems.value.filter(item => {
    const listId = item.listId ?? currentList.value.id ?? null;
    return listId === currentListId.value;
  });
});

// Export/Import-Funktionen - nicht aktiv verwendet in der UI
const { handleImportListWithOptions, showImportOptions, importData } = useListImportExport(
  createList,
  originalAddNewItem,
  allItems,
  lists,
  selectList,
  updateList
);

// Neue Liste erstellen
const createNewList = (name: string, options: IListOptions): void => {
  createList(name, options as Record<string, unknown>);
  isCreatingList.value = false;
};

/**
 * Export- und Import-Funktionen - aktuell nicht aktiv in der UI
 */
// Exportiert die aktuelle Liste
// const exportCurrentList = (): void => {
//   logger.info('Exportiere aktuelle Liste:', currentList.value.name);
//   handleExportList(currentList.value);
// };

// Starter-Funktion für den Importprozess
// const startImport = (): void => {
//   openImportDialog(onImportOptionsLoaded);
// };

/**
 * Handler für die Bestätigung des Imports durch den Benutzer
 */
const handleImportConfirm = (options: IImportOptions): void => {
  logger.info('Import-Optionen bestätigt:', options);

  // Import mit den gewählten Optionen durchführen
  handleImportListWithOptions(importData.value, options as unknown as Record<string, unknown>);

  // Dialog schließen
  showImportOptions.value = false;
};

// Lediglich zu Demo-Zwecken aufbewahrt, wird nicht aktiv verwendet

// const _onImportOptionsLoaded = (
//   data: Record<string, unknown>,
//   availableLists: Record<string, unknown>[]
// ): void => {
//   logger.info('Import-Daten geladen, zeige Optionen:', {
//     listName: data["name"],
//     itemCount: (data["items"] as unknown[]).length,
//     availableListsCount: availableLists.length,
//   });

//   // Daten aus dem Import übernehmen
//   importData.value = data;

//   // Dialog anzeigen
//   showImportOptions.value = true;
// };

// Kategoriesynchronisierungs-Funktion aus dem Nuxt-Plugin holen
const onCategoryUpdate = useNuxtApp().$onCategoryUpdate as OnCategoryUpdateHandler;
let unsubscribeCategoryUpdate: UnsubscribeFunction = null;

// App-Initialisierung
onMounted(() => {
  // Debug: Aktuellen Listenstand protokollieren
  logger.debug('App gestartet, Listenstand beim Start:');
  const listenImStorage = localStorage.getItem('shoppingLists');
  if (listenImStorage) {
    try {
      const parsedLists = JSON.parse(listenImStorage) as Record<string, unknown>[];
      logger.debug(
        'Listen im Storage:',
        parsedLists.map((l: Record<string, unknown>) => ({
          id: l.id,
          name: l.name,
          itemCount: l.items ? (l.items as unknown[]).length : 0,
        }))
      );
    } catch (e) {
      logger.error('Fehler beim Parsen der Listen aus dem Storage:', e);
    }
  }

  loadLists();

  // Kategorie-Store initialisieren, falls verfügbar
  if (categoryStore) {
    try {
      categoryStore.loadFromLocalStorage();

      // Aktiviere die passende Kategorie-Vorlage für die aktuelle Liste
      if (currentList.value.templateId) {
        categoryStore.activateTemplate(currentList.value.templateId);
      }

      // Event-Listener für Kategorieänderungen registrieren
      if (onCategoryUpdate) {
        unsubscribeCategoryUpdate = onCategoryUpdate((categoryId: string, newName: string) => {
          logger.debug(`Kategorie ${categoryId} zu ${newName} geändert, aktualisiere Elemente...`);
          updateCategoryInItems(categoryId, newName);
        });
      }
    } catch (e) {
      logger.error('Fehler beim Laden der Kategorien:', e);
    }
  }
});

// Ressourcen freigeben beim Unmounten
onUnmounted(() => {
  if (unsubscribeCategoryUpdate) {
    unsubscribeCategoryUpdate();
  }
});
</script>
