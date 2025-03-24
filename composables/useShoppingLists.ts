import { ref, computed } from 'vue';

import { useCategoryStore } from '~/stores/category';
import { createLogger } from '~/utils/logger';

import { useLocalStorage } from './core/useLocalStorage';

import type { ShoppingList, CreateListOptions } from './types';
import type { ComputedRef } from 'vue';

// Logger initialisieren
const _logger = createLogger('useShoppingLists');

/**
 * Composable für die Verwaltung von Einkaufslisten
 * Bietet Funktionen zum Erstellen, Aktualisieren, Löschen und Auswählen von Listen
 */
/**
 * Aktiviert das Kategorien-Template im Store (wenn möglich)
 * Lagert die Error-Handlung in eine separate Funktion aus
 */
/**
 * Interface für den Kategorie-Store
 */
interface ICategoryStore {
  activateTemplate: (templateId: string) => void;
}

/**
 * Aktiviert das Kategorien-Template im Store (wenn möglich)
 * Lagert die Error-Handlung in eine separate Funktion aus
 */
const activateTemplateInStore = (store: ICategoryStore | null, templateId: string): void => {
  if (!store) {
    return;
  }

  try {
    store.activateTemplate(templateId);
  } catch (e) {
    _logger.error('Fehler beim Aktivieren der Template:', e);
  }
};

/**
 * Sortiert Listen mit Favoriten zuerst
 */
const sortListsByFavorite = (lists: ShoppingList[]): ShoppingList[] =>
  [...lists].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) {
      return -1;
    }
    if (!a.isFavorite && b.isFavorite) {
      return 1;
    }
    return 0;
  });

/**
 * Erstellt eine tiefe Kopie der Listen
 */
const createDeepCopy = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * Composable für die Verwaltung von Einkaufslisten
 * Bietet Funktionen zum Erstellen, Aktualisieren, Löschen und Auswählen von Listen
 */
/**
 * Factory für einen sicheren Kategorie-Store Zugriff
 */
const createCategoryStore = (): ICategoryStore | null => {
  try {
    return useCategoryStore();
  } catch (e) {
    _logger.error('Fehler beim Initialisieren des ICategoryStore:', e);
    return null;
  }
};

/**
 * Hilfsfunktionen zur Liste-Verwaltung
 */
const listManagementHelpers = (): void => {
  const { saveToStorage, loadFromStorage } = useLocalStorage();

  /**
   * Speichert Listen im localStorage
   */
  const saveLists = (lists: ShoppingList[], currentId: string | null): void => {
    saveToStorage('shoppingLists', lists);
    saveToStorage('currentListId', currentId);
  };

  /**
   * Lädt Listen aus dem localStorage
   */
  const loadData = (): void => ({
    lists: loadFromStorage<ShoppingList[]>('shoppingLists'),
    currentId: loadFromStorage<string>('currentListId'),
  });

  return { saveLists, loadData };
};

export function useShoppingLists(): void {
  const { saveToStorage } = useLocalStorage();
  const { saveLists: saveListsToStorage, loadData } = listManagementHelpers();

  // Pinia Store für Kategorien
  const categoryStore = createCategoryStore();

  // Reaktive Daten
  const lists = ref<ShoppingList[]>([]);
  const currentListId = ref<string | null>(null);
  const initialized = ref<boolean>(false);

  // Berechnete Werte
  const currentList: ComputedRef<ShoppingList> = computed(
    () =>
      lists.value.find(list => list.id === currentListId.value) || {
        id: '',
        name: '',
        items: [],
        templateId: 'supermarket',
        isFavorite: false,
      }
  );

  const _currentListTemplateId = computed({
    get: () => currentList.value.templateId ?? 'supermarket',
    set: (value: string) => updateListTemplate(value),
  });

  /**
   * Ermittelt die Anzahl der Artikel in einer Liste
   * @param list - Die zu prüfende Liste
   * @return Die Anzahl der Artikel
   */
  const getItemsCount = (list: ShoppingList): number =>
    Array.isArray(list.items) ? list.items.length : 0;

  /**
   * Ermittelt die Anzahl der erledigten Artikel in der aktuellen Liste
   * @return Die Anzahl der erledigten Artikel
   */
  const _getCheckedItemsCount = (): number =>
    Array.isArray(currentList.value.items)
      ? currentList.value.items.filter(item => item.checked).length
      : 0;

  /**
   * Ermittelt die Gesamtanzahl der Artikel in der aktuellen Liste
   * @return Die Gesamtanzahl der Artikel
   */
  const getTotalItemsCount = (): number =>
    Array.isArray(currentList.value.items) ? currentList.value.items.length : 0;

  /**
   * Bereitet die geladenen Listen für die Anwendung auf
   */
  const prepareListsData = (storedLists: ShoppingList[]): ShoppingList[] => {
    // Explizite Aufbereitung der Daten
    const prepared = storedLists.map(list => ({
      id: list.id,
      name: list.name,
      items: Array.isArray(list.items) ? list.items : [],
      templateId: list.templateId ?? 'supermarket', // Fallback wenn keine Template-ID vorhanden ist
      isFavorite: list.isFavorite ?? false, // Fallback für ältere Listendaten
    }));

    // Sortiere Listen - Favoriten zuerst
    return prepared.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) {
        return -1;
      }
      if (!a.isFavorite && b.isFavorite) {
        return 1;
      }
      return 0;
    });
  };

  /**
   * Prüft ob eine Liste existiert
   */
  const listExists = (listId: string): boolean => lists.value.some(list => list.id === listId);

  // Speicherfunktion wird beim Ändern der Daten verwendet

  /**
   * Lädt die Listen aus dem localStorage
   * @return true bei Erfolg, false bei Fehler
   */
  const loadLists = (): boolean => {
    try {
      const { lists: storedLists, currentId } = loadData();

      // Prüfe ob gültige Listen vorhanden sind
      if (!storedLists || !Array.isArray(storedLists)) {
        createDefaultList();
        return false;
      }

      // Daten aufbereiten und in reaktive Variablen übernehmen
      lists.value = prepareListsData(storedLists);

      // Aktuelle Liste setzen
      if (currentId && listExists(currentId)) {
        currentListId.value = currentId;
      } else if (lists.value.length > 0) {
        currentListId.value = lists.value[0].id;
      }

      initialized.value = true;
      return true;
    } catch (error) {
      _logger.error('Fehler beim Laden der Listen:', error);
      createDefaultList();
      return false;
    }
  };

  /**
   * Bestimmt eine Template-ID basierend auf dem Listennamen
   */
  const determineTemplateId = (name: string, defaultId = 'supermarket'): string => {
    const lowerName = name.toLowerCase();

    // Drogerie/Apotheke
    if (
      lowerName.includes('drogerie') ||
      lowerName.includes('apotheke') ||
      lowerName.includes('kosmetik')
    ) {
      return 'drugstore';
    }

    // Baumarkt
    if (
      lowerName.includes('baumarkt') ||
      lowerName.includes('werkzeug') ||
      lowerName.includes('bau')
    ) {
      return 'hardware';
    }

    // Elektronik
    if (
      lowerName.includes('elektronik') ||
      lowerName.includes('technik') ||
      lowerName.includes('computer')
    ) {
      return 'electronics';
    }

    return defaultId;
  };

  /**
   * Erstellt eine neue Liste
   * @param name - Der Name der Liste
   * @param options - Optionen für die neue Liste
   * @return Die erstellte Liste
   */
  const createList = (name: string, options: CreateListOptions = {}): ShoppingList | null => {
    if (!name || name.trim() === '') {
      return null;
    }

    // Finde einen passenden Template-ID basierend auf dem Namen
    const templateId = options.templateId ?? determineTemplateId(name);

    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: name.trim(),
      items: options.items ?? [],
      templateId,
      isFavorite: options.isFavorite ?? false,
    };

    lists.value = [...lists.value, newList];
    currentListId.value = newList.id;

    saveToStorage('shoppingLists', lists.value);
    saveToStorage('currentListId', currentListId.value);

    // Aktiviere die passende Template im Store
    activateTemplateInStore(categoryStore, templateId);

    return newList;
  };

  /**
   * Erstellt eine Standardliste
   * @return Die erstellte Standardliste
   */
  const createDefaultList = (): ShoppingList => {
    const defaultList: ShoppingList = {
      id: Date.now().toString(),
      name: 'Wocheneinkauf',
      items: [],
      templateId: 'supermarket', // Standardvorlage für neue Listen
      isFavorite: false,
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
   */
  const selectList = (listId: string): void => {
    if (!lists.value.some(list => list.id === listId)) {
      return;
    }

    currentListId.value = listId;
    saveToStorage('currentListId', currentListId.value);

    // Aktiviere die passende Kategorie-Vorlage für diese Liste
    const selectedList = lists.value.find(list => list.id === listId);
    if (selectedList?.templateId) {
      activateTemplateInStore(categoryStore, selectedList.templateId);
    }
  };

  /**
   * Löscht eine Liste
   * @param listId - Die ID der zu löschenden Liste
   * @return true bei Erfolg, false wenn die Liste nicht existiert
   */
  const deleteList = (listId: string): boolean => {
    if (lists.value.length <= 1) {
      return false;
    }

    if (!lists.value.some(list => list.id === listId)) {
      return false;
    }

    lists.value = lists.value.filter(list => list.id !== listId);

    if (listId === currentListId.value) {
      currentListId.value = lists.value[0].id;
    }

    saveToStorage('shoppingLists', lists.value);
    saveToStorage('currentListId', currentListId.value);

    return true;
  };

  /**
   * Aktualisiert die Template-ID einer Liste
   * @param templateId - Die neue Template-ID
   */
  const updateListTemplate = (templateId: string): void => {
    const listIndex = findListIndex(currentListId.value ?? '');
    if (listIndex === -1) {
      return;
    }

    // Tiefe Kopie der Listen erstellen
    const newLists = createDeepCopy(lists.value);
    newLists[listIndex].templateId = templateId;
    lists.value = newLists;

    // Aktiviere das Template im Store
    activateTemplateInStore(categoryStore, templateId);

    saveToStorage('shoppingLists', lists.value);
  };

  /**
   * Sucht eine Liste nach ID und gibt den Index zurück
   * @param listId - Die ID der zu suchenden Liste
   * @returns Der Index oder -1 wenn nicht gefunden
   */
  const findListIndex = (listId: string): number =>
    lists.value.findIndex(list => list.id === listId);

  /**
   * Aktualisiert den Namen einer Liste
   * @param newName - Der neue Name der Liste
   */
  const updateListName = (newName: string): void => {
    if (!newName || newName.trim() === '') {
      return;
    }

    const listIndex = findListIndex(currentListId.value ?? '');
    if (listIndex === -1) {
      return;
    }

    // Tiefe Kopie der Listen erstellen
    const newLists = createDeepCopy(lists.value);
    newLists[listIndex].name = newName.trim();
    lists.value = newLists;

    saveToStorage('shoppingLists', lists.value);
  };

  /**
   * Aktualisiert den Favoriten-Status einer Liste
   * @param isFavorite - Der neue Favoriten-Status
   */
  const updateListFavorite = (isFavorite: boolean): void => {
    const listIndex = findListIndex(currentListId.value ?? '');
    if (listIndex === -1) {
      return;
    }

    // Tiefe Kopie der Listen erstellen
    const newLists = createDeepCopy(lists.value);
    newLists[listIndex].isFavorite = isFavorite;

    // Sortiere Listen - Favoriten zuerst
    lists.value = sortListsByFavorite(newLists);
    saveToStorage('shoppingLists', lists.value);
  };

  /**
   * Aktualisiert eine komplette Liste
   * @param updatedList - Die aktualisierte Liste
   * @return true bei Erfolg, false bei Fehler
   */
  const updateList = (updatedList: ShoppingList): boolean => {
    const listIndex = findListIndex(updatedList.id);
    if (listIndex === -1) {
      return false;
    }

    // Tiefe Kopie der Listen erstellen
    const newLists = createDeepCopy(lists.value);
    newLists[listIndex] = updatedList;

    lists.value = newLists;
    saveToStorage('shoppingLists', lists.value);

    return true;
  };

  /**
   * Speichert den aktuellen Zustand der Listen im localStorage
   */
  const saveLists = (): void => {
    const cleanedLists = lists.value.map(list => ({
      id: list.id,
      name: list.name,
      items: Array.isArray(list.items) ? list.items : [],
      templateId: list.templateId ?? 'supermarket',
      isFavorite: list.isFavorite ?? false,
    }));

    saveListsToStorage(cleanedLists, currentListId.value);
  };

  return {
    // Reaktive Daten
    lists,
    currentListId,
    currentList,
    initialized,
    _currentListTemplateId,

    // Funktionen
    loadLists,
    createList,
    createDefaultList,
    selectList,
    deleteList,
    updateListTemplate,
    updateListName,
    updateListFavorite,
    updateList,
    saveLists,
    getItemsCount,
    _getCheckedItemsCount,
    getTotalItemsCount,
  };
}
