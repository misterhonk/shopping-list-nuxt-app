import { ref, computed, Ref } from 'vue';

import { createLogger } from '../../utils/logger';
import { useLocalStorage } from '../core/useLocalStorage';
import { ShoppingList, CreateListOptions } from '../types';

// Logger initialisieren
const logger = createLogger('useListManagement');

// Typendefinition für den CategoryStore-Service
interface CategoryStoreService {
  activateTemplate: (templateId: string) => void;
}

/**
 * Composable für die Verwaltung von Einkaufslisten
 * Bietet Funktionen zum Erstellen, Aktualisieren und Löschen von Listen
 */
export function useListManagement(categoryStore?: CategoryStoreService) {
  const { saveToStorage, loadFromStorage, createImmutableCopy } = useLocalStorage();

  // Reaktive Daten
  const lists: Ref<ShoppingList[]> = ref([]);
  const currentListId: Ref<string | null> = ref(null);
  const initialized = ref(false);

  // Berechnete Werte
  const currentList = computed<ShoppingList>(
    () =>
      lists.value.find(list => list.id === currentListId.value) || {
        id: '',
        name: '',
        items: [],
        templateId: 'supermarket',
        isFavorite: false,
      }
  );

  const currentListTemplateId = computed({
    get: () => currentList.value.templateId || 'supermarket',
    set: (value: string) => updateListTemplate(value),
  });

  /**
   * Lädt die Listen aus dem localStorage
   * @returns true bei Erfolg, false bei Fehler
   */
  const loadLists = (): boolean => {
    try {
      const storedLists = loadFromStorage<ShoppingList[]>('shoppingLists');

      if (storedLists && Array.isArray(storedLists)) {
        // Explizite Aufbereitung der Daten
        lists.value = storedLists.map(list => ({
          id: list.id,
          name: list.name,
          items: Array.isArray(list.items) ? list.items : [],
          templateId: list.templateId || 'supermarket', // Fallback wenn keine Template-ID vorhanden ist
          isFavorite: list.isFavorite || false, // Fallback für ältere Listendaten
          createdAt: list.createdAt || 0,
          modifiedAt: list.modifiedAt || Date.now(),
        }));

        // Sortiere Listen - Favoriten zuerst
        lists.value.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) {
            return -1;
          }
          if (!a.isFavorite && b.isFavorite) {
            return 1;
          }
          return 0;
        });

        const currentId = loadFromStorage<string>('currentListId');
        if (currentId && lists.value.some(list => list.id === currentId)) {
          currentListId.value = currentId;
        } else if (lists.value.length > 0) {
          currentListId.value = lists.value[0].id;
        }

        initialized.value = true;
        return true;
      } else {
        createDefaultList();
        return false;
      }
    } catch (error) {
      logger.error('Fehler beim Laden der Listen:', error);
      createDefaultList();
      return false;
    }
  };

  /**
   * Erstellt eine neue Liste
   * @param name - Der Name der Liste
   * @param options - Optionale Parameter für die Liste
   * @returns Die erstellte Liste oder null bei Fehler
   */
  const createList = (name: string, options: CreateListOptions = {}): ShoppingList | null => {
    if (!name || name.trim() === '') {
      return null;
    }

    try {
      // Finde einen passenden Template-ID basierend auf dem Namen (fallback auf 'supermarket')
      let templateId = options.templateId || 'supermarket';
      const lowerName = name.toLowerCase();

      // Nur automatisch aus dem Namen schließen, wenn keine templateId gesetzt wurde
      if (!options.templateId) {
        // Versuche, aus dem Namen auf den Geschäftstyp zu schließen
        if (
          lowerName.includes('drogerie') ||
          lowerName.includes('apotheke') ||
          lowerName.includes('kosmetik')
        ) {
          templateId = 'drugstore';
        } else if (
          lowerName.includes('baumarkt') ||
          lowerName.includes('werkzeug') ||
          lowerName.includes('bau')
        ) {
          templateId = 'hardware';
        } else if (
          lowerName.includes('elektronik') ||
          lowerName.includes('technik') ||
          lowerName.includes('computer')
        ) {
          templateId = 'electronics';
        }
      }

      const timestamp = Date.now();
      const newList: ShoppingList = {
        id: timestamp.toString(),
        name: name.trim(),
        items: options.items || [],
        templateId,
        isFavorite: options.isFavorite || false,
        createdAt: timestamp,
        modifiedAt: timestamp,
      };

      const updatedLists = [...lists.value, newList];

      // Bei Favoriten Liste neu sortieren
      if (newList.isFavorite) {
        updatedLists.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) {
            return -1;
          }
          if (!a.isFavorite && b.isFavorite) {
            return 1;
          }
          return 0;
        });
      }

      lists.value = updatedLists;
      currentListId.value = newList.id;

      saveToStorage('shoppingLists', lists.value);
      saveToStorage('currentListId', currentListId.value);

      // Aktiviere die passende Template im Store
      if (categoryStore) {
        try {
          categoryStore.activateTemplate(templateId);
        } catch (e) {
          logger.error('Fehler beim Aktivieren der Template:', e);
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
    const timestamp = Date.now();
    const defaultList: ShoppingList = {
      id: timestamp.toString(),
      name: 'Wocheneinkauf',
      items: [],
      templateId: 'supermarket', // Standardvorlage für neue Listen
      isFavorite: false,
      createdAt: timestamp,
      modifiedAt: timestamp,
    };

    lists.value = [defaultList];
    currentListId.value = defaultList.id;
    initialized.value = true;

    saveToStorage('shoppingLists', lists.value);
    saveToStorage('currentListId', currentListId.value);

    return defaultList;
  };

  /**
   * Wählt eine bestimmte Liste aus
   * @param listId - Die ID der auszuwählenden Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  const selectList = (listId: string): boolean => {
    try {
      if (!lists.value.some(list => list.id === listId)) {
        return false;
      }

      currentListId.value = listId;
      saveToStorage('currentListId', currentListId.value);

      // Aktiviere die passende Kategorie-Vorlage für diese Liste
      const selectedList = lists.value.find(list => list.id === listId);
      if (selectedList && categoryStore && selectedList.templateId) {
        try {
          categoryStore.activateTemplate(selectedList.templateId);
        } catch (e) {
          logger.error('Fehler beim Aktivieren der Template:', e);
        }
      }

      return true;
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
      if (lists.value.length <= 1) {
        return false;
      }

      if (!lists.value.some(list => list.id === listId)) {
        return false;
      }

      // Immutable Update
      const updatedLists = lists.value.filter(list => list.id !== listId);
      lists.value = updatedLists;

      if (listId === currentListId.value) {
        currentListId.value = lists.value[0].id;
      }

      saveToStorage('shoppingLists', lists.value);
      saveToStorage('currentListId', currentListId.value);

      return true;
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
      const listIndex = lists.value.findIndex(list => list.id === currentListId.value);
      if (listIndex === -1) {
        return false;
      }

      // Immutable Update
      const updatedLists = createImmutableCopy(lists.value);
      updatedLists[listIndex].templateId = templateId;
      updatedLists[listIndex].modifiedAt = Date.now();

      lists.value = updatedLists;

      // Aktiviere das Template im Store
      if (categoryStore) {
        try {
          categoryStore.activateTemplate(templateId);
        } catch (e) {
          logger.error('Fehler beim Aktivieren der Template:', e);
        }
      }

      saveToStorage('shoppingLists', lists.value);
      return true;
    } catch (error) {
      logger.error('Fehler beim Aktualisieren der Template-ID:', error);
      return false;
    }
  };

  /**
   * Speichert den aktuellen Zustand der Listen im localStorage
   * @returns true bei Erfolg, false bei Fehler
   */
  const saveLists = (): boolean => {
    try {
      saveToStorage('shoppingLists', lists.value);
      saveToStorage('currentListId', currentListId.value);
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
    createList,
    createDefaultList,
    selectList,
    deleteList,
    updateListTemplate,
    saveLists,
  };
}
