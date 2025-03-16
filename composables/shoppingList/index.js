import { useListManagement } from './useListManagement';
import { useListProperties } from './useListProperties';

/**
 * Hauptcomposable für die Verwaltung von Einkaufslisten
 * Kombiniert die verschiedenen Aspekte der Listenverwaltung
 */
export function useShoppingLists() {
  // Basisverwaltung der Listen
  const listManagement = useListManagement();
  
  // Eigenschaften und Statistiken zu Listen
  const listProperties = useListProperties(
    listManagement.lists,
    listManagement.currentListId
  );
  
  return {
    // Reaktive Daten aus der Listenverwaltung
    lists: listManagement.lists,
    currentListId: listManagement.currentListId,
    currentList: listManagement.currentList,
    initialized: listManagement.initialized,
    currentListTemplateId: listManagement.currentListTemplateId,
    
    // Funktionen zur Listenverwaltung
    loadLists: listManagement.loadLists,
    createList: listManagement.createList,
    createDefaultList: listManagement.createDefaultList,
    selectList: listManagement.selectList,
    deleteList: listManagement.deleteList,
    updateListTemplate: listManagement.updateListTemplate,
    saveLists: listManagement.saveLists,
    
    // Funktionen zu Listeneigenschaften
    getItemsCount: listProperties.getItemsCount,
    getCheckedItemsCount: listProperties.getCheckedItemsCount, 
    getTotalItemsCount: listProperties.getTotalItemsCount,
    updateListName: listProperties.updateListName,
    updateListFavorite: listProperties.updateListFavorite
  };
}