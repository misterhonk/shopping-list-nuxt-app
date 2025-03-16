import { useListExport } from './useListExport';
import { useListImport } from './useListImport';

/**
 * Hauptcomposable für Import/Export von Einkaufslisten
 */
export function useListImportExport(createList, addItem, allItems) {
  const listExport = useListExport();
  const listImport = useListImport();
  
  /**
   * Exportiert eine Liste
   * @param {object} exportData - Die Exportdaten
   */
  const handleExportList = (exportData) => {
    return listExport.exportList(exportData, allItems.value);
  };
  
  /**
   * Importiert eine Liste aus Daten
   * @param {object} importData - Die Importdaten
   */
  const handleImportList = (importData) => {
    return listImport.importList(importData, createList, addItem);
  };
  
  /**
   * Öffnet einen Dateidialog zum Importieren einer Liste
   */
  const openImportDialog = () => {
    listImport.loadFileFromUser((importData) => {
      handleImportList(importData);
    });
  };
  
  return {
    handleExportList,
    handleImportList,
    openImportDialog
  };
}