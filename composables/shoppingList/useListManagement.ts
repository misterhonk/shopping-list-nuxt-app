import { ref, computed, onMounted } from 'vue';

import { initializeServices } from '~/services';
import { createLogger } from '~/utils/logger';

import type { ShoppingList } from '~/types/app-types';
import type { CreateListOptions } from '~/composables/types';
import type { Ref } from 'vue';

import { sortListsByFavorites, determineTemplateId } from '~/composables/utils/listUtils';

// Services initialisieren
const { shoppingListService, categoryService } = initializeServices();

// Logger initialisieren
const logger = createLogger('useListManagement');

// Typendefinition für den CategoryStore-Service
interface CategoryStoreService {
  activateTemplate: (templateId: string) => void;
}

// Typendefinition für den Rückgabewert des Composables
interface ListManagementComposable {
  // Reaktive Daten
  lists: Ref<ShoppingList[]>;
  currentListId: Ref<string | null>;
  currentList: Ref<ShoppingList>;
  initialized: Ref<boolean>;
  currentListTemplateId: Ref<string>;

  // Funktionen
  loadLists: () => boolean;
  refreshLists: () => void;
  createList: (name: string, options?: CreateListOptions) => ShoppingList | null;
  createDefaultList: () => ShoppingList;
  selectList: (listId: string) => boolean;
  deleteList: (listId: string) => boolean;
  updateListTemplate: (templateId: string) => boolean;
  saveLists: () => boolean;
}

/**
 * Hook zur Verwaltung von Einkaufslisten
 * Bietet Funktionen zum Erstellen, Bearbeiten, Löschen und Auswählen von Listen
 *
 * @param categoryStore - Optional: Store für die Verwaltung von Kategorien und Templates
 * @returns Objekt mit reaktiven Daten und Funktionen für die Listenverwaltung
 *
 * @example
 * const {
 *   lists,
 *   currentList,
 *   createList,
 *   deleteList
 * } = useListManagement(categoryStore);
 */
export function useListManagement(categoryStore?: CategoryStoreService): ListManagementComposable {
  // Reaktive Daten
  const lists: Ref<ShoppingList[]> = ref([]);
  const currentListId: Ref<string | null> = ref(null);
  const initialized = ref(false);

  // Berechnete Werte
  const currentList = computed<ShoppingList>(() => {
    const id = currentListId.value ?? '';
    const list = shoppingListService.getListById(id);

    if (list) {
      return list;
    }

    return {
      id: '',
      name: '',
      items: [],
      templateId: 'supermarket',
      isFavorite: false,
    };
  });

  const currentListTemplateId = computed({
    get: () => currentList.value.templateId ?? 'supermarket',
    set: (value: string) => updateListTemplate(value),
  });

  /**
   * Aktualisiert die lokalen Listen aus dem Service
   */
  const refreshLists = (): void => {
    lists.value = shoppingListService.getAllLists();

    // Sortieren
    lists.value = sortListsByFavorites(lists.value);
  };

  /**
   * Setzt die aktuelle Listen-ID aus dem Service
   */
  const refreshCurrentListId = (): void => {
    currentListId.value = shoppingListService.getCurrentListId();
  };

  // Beim Mounting Daten laden
  onMounted(() => {
    loadLists();
  });

  /**
   * Lädt die Listen und die aktuelle Listen-ID
   * @returns true bei Erfolg, false bei Fehler
   */
  const loadLists = (): boolean => {
    try {
      refreshLists();
      refreshCurrentListId();

      // Wenn keine Listen vorhanden sind, eine Standardliste erstellen
      if (lists.value.length === 0) {
        createDefaultList();
        return false;
      }

      initialized.value = true;
      return true;
    } catch (error) {
      logger.error('Fehler beim Laden der Listen:', error);
      createDefaultList();
      return false;
    }
  };

  /**
   * Erstellt ein neues Listenobjekt basierend auf den übergebenen Parametern
   * @param name - Der Name der Liste
   * @param options - Optionale Parameter für die Liste
   * @returns Das neue Listenobjekt
   */
  const createListObject = (name: string, options: CreateListOptions = {}): ShoppingList => {
    // Finde einen passenden Template-ID basierend auf dem Namen (fallback auf 'supermarket')
    let templateId = options.templateId ?? 'supermarket';

    // Nur automatisch aus dem Namen schließen, wenn keine templateId gesetzt wurde
    if (!options.templateId) {
      templateId = determineTemplateId(name, 'supermarket');
    }

    const timestamp = Date.now();
    return {
      id: timestamp.toString(),
      name: name.trim(),
      items: options.items ?? [],
      templateId,
      isFavorite: options.isFavorite ?? false,
      createdAt: timestamp,
      modifiedAt: timestamp,
    };
  };

  /**
   * Erstellt eine neue Liste
   * @param name - Der Name der Liste
   * @param options - Optionale Parameter für die Liste
   * @returns Die erstellte Liste oder null bei Fehler
   */
  const createList = (name: string, options: CreateListOptions = {}): ShoppingList | null => {
    if (!name || name.trim() === '') {
      logger.error('Fehler beim Erstellen einer Liste: Kein Name angegeben');
      return null;
    }

    try {
      // Neue Liste mit dem Service erstellen
      const newList = shoppingListService.createList(name, options);

      if (newList) {
        // Listen aktualisieren
        refreshLists();

        // Als aktuelle Liste setzen
        currentListId.value = newList.id;

        // Template aktivieren
        if (categoryStore && newList.templateId) {
          categoryStore.activateTemplate(newList.templateId);
        } else {
          // Fallback auf den CategoryService
          categoryService.setActiveTemplate(newList.templateId ?? 'supermarket');
        }
      }

      return newList;
    } catch (error) {
      logger.error('Fehler beim Erstellen einer neuen Liste:', error);
      return null;
    }
  };

  /**
   * Erstellt eine Standardliste
   * @returns Die erstellte Standardliste
   */
  const createDefaultList = (): ShoppingList => {
    const defaultList = shoppingListService.createList('Wocheneinkauf', {
      templateId: 'supermarket',
      isFavorite: false,
    });

    if (defaultList) {
      // Listen aktualisieren
      refreshLists();

      // Als aktuelle Liste setzen
      currentListId.value = defaultList.id;
    } else {
      // Fallback, falls der Service fehlschlägt
      const timestamp = Date.now();
      const newDefaultList: ShoppingList = {
        id: timestamp.toString(),
        name: 'Wocheneinkauf',
        items: [],
        templateId: 'supermarket',
        isFavorite: false,
        createdAt: timestamp,
        modifiedAt: timestamp,
      };

      lists.value = [newDefaultList];
      currentListId.value = newDefaultList.id;
    }

    initialized.value = true;
    return defaultList ?? lists.value[0];
  };

  /**
   * Wählt eine bestimmte Liste aus
   * @param listId - Die ID der auszuwählenden Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  const selectList = (listId: string): boolean => {
    try {
      if (!listId) {
        logger.error('Keine Listen-ID zum Auswählen angegeben');
        return false;
      }

      // Liste mit dem Service auswählen
      const success = shoppingListService.setCurrentListId(listId);

      if (success) {
        // Lokalen Zustand aktualisieren
        currentListId.value = listId;

        // Template aktivieren
        const list = shoppingListService.getListById(listId);

        if (list?.templateId) {
          if (categoryStore) {
            categoryStore.activateTemplate(list.templateId);
          } else {
            // Fallback auf den CategoryService
            categoryService.setActiveTemplate(list.templateId);
          }
        }
      }

      return success;
    } catch (error) {
      logger.error('Fehler beim Auswählen einer Liste:', error);
      return false;
    }
  };

  /**
   * Löscht eine Liste
   * @param listId - Die ID der zu löschenden Liste
   * @returns true bei Erfolg, false wenn die Liste nicht existiert
   */
  const deleteList = (listId: string): boolean => {
    try {
      if (!listId) {
        logger.error('Keine Listen-ID zum Löschen angegeben');
        return false;
      }

      // Liste mit dem Service löschen
      const success = shoppingListService.deleteList(listId);

      if (success) {
        // Listen aktualisieren
        refreshLists();

        // Aktuelle Listen-ID aktualisieren
        refreshCurrentListId();
      }

      return success;
    } catch (error) {
      logger.error('Fehler beim Löschen einer Liste:', error);
      return false;
    }
  };

  /**
   * Aktualisiert die Template-ID einer Liste
   * @param templateId - Die neue Template-ID
   * @returns true bei Erfolg, false bei Fehler
   */
  const updateListTemplate = (templateId: string): boolean => {
    try {
      if (!currentListId.value) {
        logger.error('Keine aktuelle Liste ausgewählt');
        return false;
      }

      if (!templateId) {
        logger.error('Keine Template-ID angegeben');
        return false;
      }

      // Aktuelle Liste laden
      const currentList = shoppingListService.getListById(currentListId.value);

      if (!currentList) {
        logger.error(`Liste mit ID ${currentListId.value} nicht gefunden`);
        return false;
      }

      // Liste aktualisieren
      const updatedList = {
        ...currentList,
        templateId,
        modifiedAt: Date.now(),
      };

      // Mit dem Service aktualisieren
      const success = shoppingListService.updateList(updatedList) !== null;

      if (success) {
        // Listen aktualisieren
        refreshLists();

        // Template aktivieren
        if (categoryStore) {
          categoryStore.activateTemplate(templateId);
        } else {
          // Fallback auf den CategoryService
          categoryService.setActiveTemplate(templateId);
        }
      }

      return success;
    } catch (error) {
      logger.error('Fehler beim Aktualisieren der Template-ID:', error);
      return false;
    }
  };

  /**
   * Speichert den aktuellen Zustand der Listen
   * @returns true bei Erfolg, false bei Fehler
   */
  const saveLists = (): boolean => {
    try {
      // Daten sind bereits im Service gespeichert, daher nur aktualisieren
      refreshLists();
      return true;
    } catch (error) {
      logger.error('Fehler beim Speichern der Listen:', error);
      return false;
    }
  };

  return {
    // Reaktive Daten
    lists,
    currentListId,
    currentList,
    initialized,
    currentListTemplateId,

    // Funktionen
    loadLists,
    refreshLists,
    createList,
    createDefaultList,
    selectList,
    deleteList,
    updateListTemplate,
    saveLists,
  };
}
