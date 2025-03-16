import { ref, computed } from 'vue';
import { useLocalStorage } from '../core/useLocalStorage';
import { useCategoryStore } from '../../stores/categoryStore';

/**
 * Composable für die grundlegende Verwaltung von Einkaufslisten
 * Bietet Funktionen zum Erstellen, Aktualisieren und Löschen von Listen
 */
export function useListManagement() {
  const { saveToStorage, loadFromStorage } = useLocalStorage();
  
  // Pinia Store für Kategorien
  let categoryStore = null;
  try {
    categoryStore = useCategoryStore();
  } catch (e) {
    console.error('Fehler beim Initialisieren des CategoryStore:', e);
  }

  // Reaktive Daten
  const lists = ref([]);
  const currentListId = ref(null);
  const initialized = ref(false);
  
  // Berechnete Werte
  const currentList = computed(() => 
    lists.value.find(list => list.id === currentListId.value) || 
    { id: null, name: '', items: [], templateId: 'supermarket' }
  );

  const currentListTemplateId = computed({
    get: () => currentList.value.templateId || 'supermarket',
    set: (value) => updateListTemplate(value)
  });

  /**
   * Lädt die Listen aus dem localStorage
   * @return {boolean} - true bei Erfolg, false bei Fehler
   */
  const loadLists = () => {
    try {
      const storedLists = loadFromStorage('shoppingLists');
      
      if (storedLists && Array.isArray(storedLists)) {
        // Explizite Aufbereitung der Daten
        lists.value = storedLists.map(list => ({
          id: list.id,
          name: list.name,
          items: Array.isArray(list.items) ? list.items : [],
          templateId: list.templateId || 'supermarket', // Fallback wenn keine Template-ID vorhanden ist
          isFavorite: list.isFavorite || false // Fallback für ältere Listendaten
        }));
        
        // Sortiere Listen - Favoriten zuerst
        lists.value.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return 0;
        });
        
        const currentId = loadFromStorage('currentListId');
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
   * @param {string} name - Der Name der Liste
   * @param {object} options - Zusätzliche Optionen (templateId, isFavorite)
   * @return {object} - Die erstellte Liste
   */
  const createList = (name, options = {}) => {
    if (!name || name.trim() === '') return null;
    
    console.log('createList aufgerufen:', { name, options });
    
    // Finde einen passenden Template-ID basierend auf dem Namen (fallback auf 'supermarket')
    let templateId = options.templateId || 'supermarket';
    const lowerName = name.toLowerCase();
    
    // Nur automatisch aus dem Namen schließen, wenn keine templateId gesetzt wurde
    if (!options.templateId) {
      // Versuche, aus dem Namen auf den Geschäftstyp zu schließen
      if (lowerName.includes('drogerie') || lowerName.includes('apotheke') || lowerName.includes('kosmetik')) {
        templateId = 'drugstore';
      } else if (lowerName.includes('baumarkt') || lowerName.includes('werkzeug') || lowerName.includes('bau')) {
        templateId = 'hardware';
      } else if (lowerName.includes('elektronik') || lowerName.includes('technik') || lowerName.includes('computer')) {
        templateId = 'electronics';
      }
    }
    
    // Eindeutige ID erstellen mit aktuellem Zeitstempel
    const uniqueId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const newList = {
      id: uniqueId,
      name: name.trim(),
      items: [],
      templateId: templateId,
      isFavorite: options.isFavorite || false
    };
    
    console.log('Neue Liste erstellt:', {
      id: newList.id,
      name: newList.name,
      templateId: newList.templateId
    });
    
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
   * @return {object} - Die erstellte Standardliste
   */
  const createDefaultList = () => {
    const defaultList = {
      id: Date.now().toString(),
      name: 'Wocheneinkauf',
      items: [],
      templateId: 'supermarket', // Standardvorlage für neue Listen
      isFavorite: false
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
   * @param {string} listId - Die ID der auszuwählenden Liste
   */
  const selectList = (listId) => {
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
   * @param {string} listId - Die ID der zu löschenden Liste
   * @return {boolean} - true bei Erfolg, false wenn die Liste nicht existiert
   */
  const deleteList = (listId) => {
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
   * @param {string} templateId - Die neue Template-ID
   */
  const updateListTemplate = (templateId) => {
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
   * Speichert den aktuellen Zustand der Listen im localStorage
   */
  const saveLists = () => {
    const cleanedLists = lists.value.map(list => ({
      id: list.id,
      name: list.name,
      items: Array.isArray(list.items) ? list.items : [],
      templateId: list.templateId || 'supermarket',
      isFavorite: list.isFavorite || false
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
    saveLists
  };
}