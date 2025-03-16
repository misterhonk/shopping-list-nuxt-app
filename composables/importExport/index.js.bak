import { useListExport } from './useListExport';
import { useListImport } from './useListImport';
import { ref } from 'vue';

/**
 * Hauptcomposable für Import/Export von Einkaufslisten
 */
export function useListImportExport(createList, addItem, allItems, lists, selectList, updateList) {
  const listExport = useListExport();
  const listImport = useListImport();
  
  // Status der Import-Dialog-Anzeige
  const showImportOptions = ref(false);
  const importData = ref(null);
  
  /**
   * Exportiert eine Liste
   * @param {object} exportData - Die Exportdaten
   */
  const handleExportList = (exportData) => {
    return listExport.exportList(exportData, allItems.value);
  };
  
  /**
   * Importiert eine Liste aus Daten
   * @param {object} data - Die Importdaten
   * @param {object} options - Importoptionen
   */
  const handleImportListWithOptions = (data, options) => {
    return listImport.importListWithOptions(
      data, 
      options, 
      {
        createList,
        addItem,
        selectList,
        updateList
      }
    );
  };
  
  /**
   * Importiert eine Liste (alte Methode)
   * @param {object} importData - Die Importdaten
   */
  const handleImportList = (importData) => {
    return listImport.importList(importData, createList, addItem);
  };
  
  /**
   * Öffnet einen Dateidialog zum Importieren einer Liste und zeigt Optionen
   * @param {Function} onImportOptionsLoaded - Callback für geladene Import-Optionen
   */
  const openImportDialog = (onImportOptionsLoaded) => {
    // Die verfügbaren Listen für Optionen vorbereiten
    const availableLists = lists.value.map(list => ({
      id: list.id,
      name: list.name,
      itemCount: list.items?.length || 0
    }));
    
    // Datei laden und dann Optionen anzeigen
    listImport.loadFileAndShowOptions((data) => {
      importData.value = data;
      
      // Liste formatiert bereitstellen und Dialog anzeigen
      if (typeof onImportOptionsLoaded === 'function') {
        onImportOptionsLoaded(data, availableLists);
      }
    });
  };
  
  // Globale Funktion zurückgeben
  return {
    handleExportList,
    handleImportList,
    handleImportListWithOptions,
    openImportDialog,
    showImportOptions,
    importData
  };
}