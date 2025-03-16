import { ref, computed, ComputedRef, Ref } from 'vue';
import { useLocalStorage } from './core/useLocalStorage';
import { useCategoryStore } from '../stores/category';
import { ShoppingList, CreateListOptions } from './types';

/**
 * Composable für die Verwaltung von Einkaufslisten
 * Bietet Funktionen zum Erstellen, Aktualisieren, Löschen und Auswählen von Listen
 */
export function useShoppingLists() {
  const { saveToStorage, loadFromStorage } = useLocalStorage();

  // Pinia Store für Kategorien
  let categoryStore = null;
  try {
    categoryStore = useCategoryStore();
  } catch (e) {
    console.error('Fehler beim Initialisieren des CategoryStore:', e);
  }

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

  const currentListTemplateId = computed({
    get: () => currentList.value.templateId || 'supermarket',
    set: (value: string) => updateListTemplate(value),
  });

  /**
   * Ermittelt die Anzahl der Artikel in einer Liste
   * @param list - Die zu prüfende Liste
   * @return Die Anzahl der Artikel
   */
  const getItemsCount = (list: ShoppingList): number => {
    return Array.isArray(list?.items) ? list.items.length : 0;
  };

  /**
   * Ermittelt die Anzahl der erledigten Artikel in der aktuellen Liste
   * @return Die Anzahl der erledigten Artikel
   */
  const getCheckedItemsCount = (): number => {
    return Array.isArray(currentList.value?.items)
      ? currentList.value.items.filter(item => item.checked).length
      : 0;
  };

  /**
   * Ermittelt die Gesamtanzahl der Artikel in der aktuellen Liste
   * @return Die Gesamtanzahl der Artikel
   */
  const getTotalItemsCount = (): number => {
    return Array.isArray(currentList.value?.items) ? currentList.value.items.length : 0;
  };

  /**
   * Lädt die Listen aus dem localStorage
   * @return true bei Erfolg, false bei Fehler
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
        }));

        // Sortiere Listen - Favoriten zuerst
        lists.value.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
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
      console.error('Fehler beim Laden der Listen:', error);
      createDefaultList();
      return false;
    }
  };

  /**
   * Erstellt eine neue Liste
   * @param name - Der Name der Liste
   * @param options - Optionen für die neue Liste
   * @return Die erstellte Liste
   */
  const createList = (name: string, options: CreateListOptions = {}): ShoppingList | null => {
    if (!name || name.trim() === '') return null;

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

    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: name.trim(),
      items: options.items || [],
      templateId: templateId,
      isFavorite: options.isFavorite || false,
    };

    lists.value = [...lists.value, newList];
    currentListId.value = newList.id;

    saveToStorage('shoppingLists', lists.value);
    saveToStorage('currentListId', currentListId.value);

    // Aktiviere die passende Template im Store
    if (categoryStore) {
      try {
        categoryStore.activateTemplate(templateId);
      } catch (e) {
        console.error('Fehler beim Aktivieren der Template:', e);
      }
    }

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
    if (!lists.value.some(list => list.id === listId)) return;

    currentListId.value = listId;
    saveToStorage('currentListId', currentListId.value);

    // Aktiviere die passende Kategorie-Vorlage für diese Liste
    const selectedList = lists.value.find(list => list.id === listId);
    if (selectedList && categoryStore && selectedList.templateId) {
      try {
        categoryStore.activateTemplate(selectedList.templateId);
      } catch (e) {
        console.error('Fehler beim Aktivieren der Template:', e);
      }
    }
  };

  /**
   * Löscht eine Liste
   * @param listId - Die ID der zu löschenden Liste
   * @return true bei Erfolg, false wenn die Liste nicht existiert
   */
  const deleteList = (listId: string): boolean => {
    if (lists.value.length <= 1) return false;

    if (!lists.value.some(list => list.id === listId)) return false;

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
    const listIndex = lists.value.findIndex(list => list.id === currentListId.value);
    if (listIndex === -1) return;

    // Tiefe Kopie der Listen erstellen
    const newLists = JSON.parse(JSON.stringify(lists.value));
    newLists[listIndex].templateId = templateId;
    lists.value = newLists;

    // Aktiviere das Template im Store
    if (categoryStore) {
      try {
        categoryStore.activateTemplate(templateId);
      } catch (e) {
        console.error('Fehler beim Aktivieren der Template:', e);
      }
    }

    saveToStorage('shoppingLists', lists.value);
  };

  /**
   * Aktualisiert den Namen einer Liste
   * @param newName - Der neue Name der Liste
   */
  const updateListName = (newName: string): void => {
    if (!newName || newName.trim() === '') return;

    const listIndex = lists.value.findIndex(list => list.id === currentListId.value);
    if (listIndex === -1) return;

    // Tiefe Kopie der Listen erstellen
    const newLists = JSON.parse(JSON.stringify(lists.value));
    newLists[listIndex].name = newName.trim();
    lists.value = newLists;

    saveToStorage('shoppingLists', lists.value);
  };

  /**
   * Aktualisiert den Favoriten-Status einer Liste
   * @param isFavorite - Der neue Favoriten-Status
   */
  const updateListFavorite = (isFavorite: boolean): void => {
    const listIndex = lists.value.findIndex(list => list.id === currentListId.value);
    if (listIndex === -1) return;

    // Tiefe Kopie der Listen erstellen
    const newLists = JSON.parse(JSON.stringify(lists.value));
    newLists[listIndex].isFavorite = isFavorite;

    // Sortiere Listen - Favoriten zuerst
    newLists.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });

    lists.value = newLists;
    saveToStorage('shoppingLists', lists.value);
  };

  /**
   * Aktualisiert eine komplette Liste
   * @param updatedList - Die aktualisierte Liste
   * @return true bei Erfolg, false bei Fehler
   */
  const updateList = (updatedList: ShoppingList): boolean => {
    const listIndex = lists.value.findIndex(list => list.id === updatedList.id);
    if (listIndex === -1) return false;

    // Tiefe Kopie der Listen erstellen
    const newLists = JSON.parse(JSON.stringify(lists.value));
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
      templateId: list.templateId || 'supermarket',
      isFavorite: list.isFavorite || false,
    }));

    saveToStorage('shoppingLists', cleanedLists);
    saveToStorage('currentListId', currentListId.value);
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
    updateListName,
    updateListFavorite,
    updateList,
    saveLists,
    getItemsCount,
    getCheckedItemsCount,
    getTotalItemsCount,
  };
}
