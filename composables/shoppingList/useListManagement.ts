import { ref, computed } from 'vue';

import { createLogger } from '~/utils/logger';

import { useLocalStorage } from '../core/useLocalStorage';
import {
  sortListsByFavorites,
  determineTemplateId,
  activateTemplateInStore,
} from '../utils/listUtils';

import type { ShoppingList, CreateListOptions } from '../types';
import type { Ref } from 'vue';

// Logger initialisieren
const logger = createLogger('useListManagement');

// Typendefinition für den CategoryStore-Service
interface CategoryStoreService {
  activateTemplate: (templateId: string) => void;
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
   * Wandelt eine gespeicherte Liste in ein standardisiertes Format um
   * @param list - Die gespeicherte Liste
   * @returns Die standardisierte Liste mit allen erforderlichen Feldern
   */
  const normalizeList = (list: Partial<ShoppingList>): ShoppingList => ({
    id: list.id || '',
    name: list.name || '',
    items: Array.isArray(list.items) ? list.items : [],
    templateId: list.templateId || 'supermarket', // Fallback wenn keine Template-ID vorhanden ist
    isFavorite: list.isFavorite || false, // Fallback für ältere Listendaten
    createdAt: list.createdAt || 0,
    modifiedAt: list.modifiedAt || Date.now(),
  });

  /**
   * Lädt die Liste und die aktuelle Listen-ID aus dem Speicher
   * @returns Die Liste aus dem Speicher oder null bei Fehler
   */
  const loadListsFromStorage = (): ShoppingList[] | null => {
    try {
      const storedLists = loadFromStorage<ShoppingList[]>('shoppingLists');
      return storedLists && Array.isArray(storedLists) ? storedLists : null;
    } catch (error) {
      logger.error('Fehler beim Laden der Listen aus dem Speicher:', error);
      return null;
    }
  };

  /**
   * Setzt die aktuelle Listen-ID basierend auf dem gespeicherten Wert oder der ersten Liste
   */
  const setCurrentListId = () => {
    try {
      const currentId = loadFromStorage<string>('currentListId');
      if (currentId && lists.value.some(list => list.id === currentId)) {
        currentListId.value = currentId;
      } else if (lists.value.length > 0) {
        currentListId.value = lists.value[0].id;
      }
    } catch (error) {
      logger.error('Fehler beim Setzen der aktuellen Listen-ID:', error);
      if (lists.value.length > 0) {
        currentListId.value = lists.value[0].id;
      }
    }
  };

  /**
   * Lädt die Listen aus dem localStorage
   * @returns true bei Erfolg, false bei Fehler
   */
  const loadLists = (): boolean => {
    try {
      const storedLists = loadListsFromStorage();

      if (storedLists) {
        // Explizite Aufbereitung der Daten
        lists.value = storedLists.map(normalizeList);

        // Sortiere Listen
        lists.value = sortListsByFavorites(lists.value);

        // Setze aktuelle Liste
        setCurrentListId();

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
   * Erstellt ein neues Listenobjekt basierend auf den übergebenen Parametern
   * @param name - Der Name der Liste
   * @param options - Optionale Parameter für die Liste
   * @returns Das neue Listenobjekt
   */
  const createListObject = (name: string, options: CreateListOptions = {}): ShoppingList => {
    // Finde einen passenden Template-ID basierend auf dem Namen (fallback auf 'supermarket')
    let templateId = options.templateId || 'supermarket';

    // Nur automatisch aus dem Namen schließen, wenn keine templateId gesetzt wurde
    if (!options.templateId) {
      templateId = determineTemplateId(name, 'supermarket');
    }

    const timestamp = Date.now();
    return {
      id: timestamp.toString(),
      name: name.trim(),
      items: options.items || [],
      templateId,
      isFavorite: options.isFavorite || false,
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
      return null;
    }

    try {
      const newList = createListObject(name, options);

      // Füge Liste hinzu und sortiere bei Bedarf
      lists.value = [...lists.value, newList];
      if (newList.isFavorite) {
        lists.value = sortListsByFavorites(lists.value);
      }

      // Setze als aktuelle Liste
      currentListId.value = newList.id;

      // Speichern und Template aktivieren
      saveToStorage('shoppingLists', lists.value);
      saveToStorage('currentListId', currentListId.value);
      activateTemplateInStore(categoryStore, newList.templateId);

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
      if (selectedList && selectedList.templateId) {
        activateTemplateInStore(categoryStore, selectedList.templateId);
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

      // Immutable Update mit Filter
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
      activateTemplateInStore(categoryStore, templateId);

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
