import { useListExport } from './useListExport';
import { useListImport } from './useListImport';
import { ref, Ref } from 'vue';
import { ShoppingList, ShoppingItem, ImportOptions } from '../types';

/**
 * Interface für die Import/Export-Dienste
 */
interface ImportExportServices {
  createList: (name: string, options: any) => ShoppingList | null;
  addItem: (item: Partial<ShoppingItem>) => ShoppingItem | null;
  selectList: (listId: string) => boolean;
  updateList: (listData: Partial<ShoppingList> & { id: string }) => boolean;
}

/**
 * Hauptcomposable für Import/Export von Einkaufslisten
 */
export function useListImportExport(
  createList: (name: string, options: any) => ShoppingList | null,
  addItem: (item: Partial<ShoppingItem>) => ShoppingItem | null,
  allItems: Ref<ShoppingItem[]>,
  lists: Ref<ShoppingList[]>,
  selectList: (listId: string) => boolean,
  updateList: (listData: Partial<ShoppingList> & { id: string }) => boolean
) {
  const listExport = useListExport();
  const listImport = useListImport();
  
  // Status der Import-Dialog-Anzeige
  const showImportOptions: Ref<boolean> = ref(false);
  const importData: Ref<any> = ref(null);
  
  /**
   * Exportiert eine Liste
   * @param exportData - Die Exportdaten
   * @returns true bei Erfolg, false bei Fehler
   */
  const handleExportList = (exportData: { name: string; templateId?: string }): boolean => {
    return listExport.exportList(exportData, allItems.value);
  };
  
  /**
   * Importiert eine Liste aus Daten
   * @param data - Die Importdaten
   * @param options - Die Importoptionen
   * @returns Das Importergebnis
   */
  const handleImportListWithOptions = (data: any, options: ImportOptions) => {
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
   * @param importData - Die Importdaten
   * @returns Das Importergebnis
   */
  const handleImportList = (importData: any) => {
    return listImport.importList(importData, createList, addItem);
  };
  
  /**
   * Öffnet einen Dateidialog zum Importieren einer Liste und zeigt Optionen
   * @param onImportOptionsLoaded - Callback für geladene Import-Optionen
   */
  const openImportDialog = (
    onImportOptionsLoaded: (data: any, availableLists: any[]) => void
  ): void => {
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
