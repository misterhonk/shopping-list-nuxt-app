import { ref, Ref, computed, ComputedRef } from 'vue';
import { ShoppingList, ShoppingItem, ImportOptions, ExportedList } from './types';

/**
 * Composable für den Import und Export von Einkaufslisten
 * Bietet Funktionen zum Speichern und Laden von Listen in verschiedenen Formaten
 */
export function useListImportExport(
  createList: (name: string, options: any) => ShoppingList | null,
  addItem: (itemData: Partial<ShoppingItem>) => ShoppingItem | null,
  allItems: ComputedRef<ShoppingItem[]>,
  lists: Ref<ShoppingList[]>,
  selectList: (listId: string) => void,
  updateList: (list: ShoppingList) => boolean
) {
  const showImportOptions = ref<boolean>(false);
  const importData = ref<ExportedList | null>(null);

  /**
   * Exportiert die aktuelle Liste in eine Datei
   * @param list - Die zu exportierende Liste
   * @param format - Das Format der Export-Datei (default: 'json')
   */
  const handleExportList = (list: ShoppingList, format: 'json' | 'csv' = 'json'): void => {
    try {
      // Erstelle das Export-Objekt
      const exportObj: ExportedList = {
        name: list.name,
        items: list.items,
        format: 'shopping-list-app',
        version: '1.0',
        exportedAt: Date.now()
      };
      
      let exportString: string;
      let filename: string;
      let mimeType: string;
      
      // Exportiere in das gewünschte Format
      if (format === 'csv') {
        exportString = convertToCSV(list.items);
        filename = `${list.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
        mimeType = 'text/csv';
      } else {
        exportString = JSON.stringify(exportObj, null, 2);
        filename = `${list.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
        mimeType = 'application/json';
      }
      
      // Erstelle einen Download-Link
      const blob = new Blob([exportString], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Bereinigen
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Fehler beim Exportieren der Liste:', error);
      alert('Beim Exportieren der Liste ist ein Fehler aufgetreten.');
    }
  };

  /**
   * Konvertiert Artikel in einen CSV-String
   * @param items - Die zu konvertierenden Artikel
   * @return Der CSV-String
   */
  const convertToCSV = (items: ShoppingItem[]): string => {
    // CSV-Header
    const headers = ['Name', 'Menge', 'Kategorie', 'Preis', 'Erledigt', 'Notiz'];
    
    // Zeilen generieren
    const rows = items.map(item => {
      const categoryName = typeof item.category === 'object' ? item.category.name : item.category;
      
      return [
        `"${item.name.replace(/"/g, '""')}"`,
        item.quantity,
        `"${categoryName.replace(/"/g, '""')}"`,
        item.price || 0,
        item.checked ? 'Ja' : 'Nein',
        item.note ? `"${item.note.replace(/"/g, '""')}"` : ''
      ].join(',');
    });
    
    // CSV zusammenfügen
    return [headers.join(','), ...rows].join('\n');
  };

  /**
   * Öffnet den Dateiauswahl-Dialog für den Import
   * @param callback - Callback-Funktion, die aufgerufen wird, wenn Daten geladen wurden
   */
  const openImportDialog = (callback: (data: ExportedList, availableLists: ShoppingList[]) => void): void => {
    try {
      // Erstelle einen Datei-Input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csv';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          // Lese die Datei
          const fileData = await readFile(file);
          
          if (file.name.endsWith('.json')) {
            // Verarbeite JSON-Datei
            const parsedData = JSON.parse(fileData) as ExportedList;
            
            // Prüfe, ob es ein gültiges Format ist
            if (parsedData && parsedData.items && parsedData.name) {
              callback(parsedData, lists.value);
            } else {
              alert('Die Datei enthält keine gültige Einkaufsliste.');
            }
          } else if (file.name.endsWith('.csv')) {
            // Verarbeite CSV-Datei
            const items = parseCSV(fileData);
            
            if (items.length > 0) {
              const exportObj: ExportedList = {
                name: file.name.replace(/\.csv$/, '').replace(/_/g, ' '),
                items,
                format: 'shopping-list-app',
                version: '1.0',
                exportedAt: Date.now()
              };
              
              callback(exportObj, lists.value);
            } else {
              alert('Die CSV-Datei enthält keine gültigen Artikel.');
            }
          }
        } catch (error) {
          console.error('Fehler beim Lesen der Datei:', error);
          alert('Beim Lesen der Datei ist ein Fehler aufgetreten.');
        }
      };
      
      // Klicke auf den Input
      input.click();
    } catch (error) {
      console.error('Fehler beim Öffnen des Import-Dialogs:', error);
      alert('Beim Öffnen des Import-Dialogs ist ein Fehler aufgetreten.');
    }
  };

  /**
   * Liest eine Datei als Text
   * @param file - Die zu lesende Datei
   * @return Der Inhalt der Datei als Text
   */
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  };

  /**
   * Parst einen CSV-String in Artikel
   * @param csv - Der zu parsende CSV-String
   * @return Die geparsten Artikel
   */
  const parseCSV = (csv: string): ShoppingItem[] => {
    const items: ShoppingItem[] = [];
    
    // Zeilen aufteilen
    const lines = csv.split('\n');
    
    // Header verarbeiten
    const header = lines[0].split(',');
    const nameIndex = header.findIndex(col => col.toLowerCase().includes('name'));
    const quantityIndex = header.findIndex(col => col.toLowerCase().includes('menge') || col.toLowerCase().includes('anzahl') || col.toLowerCase().includes('quantity'));
    const categoryIndex = header.findIndex(col => col.toLowerCase().includes('kategorie') || col.toLowerCase().includes('category'));
    const priceIndex = header.findIndex(col => col.toLowerCase().includes('preis') || col.toLowerCase().includes('price'));
    const checkedIndex = header.findIndex(col => col.toLowerCase().includes('erledigt') || col.toLowerCase().includes('checked'));
    const noteIndex = header.findIndex(col => col.toLowerCase().includes('notiz') || col.toLowerCase().includes('note'));
    
    // Zeilen parsen
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // CSV-Zeile korrekt parsen (berücksichtigt Anführungszeichen)
      const values = parseCSVLine(lines[i]);
      
      // Artikel erstellen
      const item: ShoppingItem = {
        id: Date.now() + i.toString(),
        name: nameIndex >= 0 ? values[nameIndex].replace(/^"(.*)"$/, '$1') : `Artikel ${i}`,
        quantity: quantityIndex >= 0 ? parseFloat(values[quantityIndex]) || 1 : 1,
        category: categoryIndex >= 0 ? values[categoryIndex].replace(/^"(.*)"$/, '$1') : 'Sonstiges',
        checked: checkedIndex >= 0 ? isCheckedValue(values[checkedIndex]) : false,
        price: priceIndex >= 0 ? parseFloat(values[priceIndex]) || 0 : 0
      };
      
      // Optional: Notiz hinzufügen
      if (noteIndex >= 0 && values[noteIndex]) {
        item.note = values[noteIndex].replace(/^"(.*)"$/, '$1');
      }
      
      items.push(item);
    }
    
    return items;
  };

  /**
   * Parst eine CSV-Zeile korrekt (berücksichtigt Anführungszeichen)
   * @param line - Die zu parsende Zeile
   * @return Die geparsten Werte
   */
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle doppelte Anführungszeichen
        if (i < line.length - 1 && line[i + 1] === '"') {
          currentValue += '"';
          i++; // Überspringe das nächste Anführungszeichen
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Ende des Wertes
        values.push(currentValue);
        currentValue = '';
      } else {
        // Normales Zeichen
        currentValue += char;
      }
    }
    
    // Letzten Wert hinzufügen
    values.push(currentValue);
    
    return values;
  };

  /**
   * Prüft, ob ein Wert als "erledigt" interpretiert werden kann
   * @param value - Der zu prüfende Wert
   * @return true, wenn der Wert als "erledigt" interpretiert werden kann
   */
  const isCheckedValue = (value: string): boolean => {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'ja' || lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1' || lowerValue === 'x';
  };

  /**
   * Importiert eine Liste mit den gewählten Optionen
   * @param data - Die zu importierenden Daten
   * @param options - Die Import-Optionen
   */
  const handleImportListWithOptions = (data: ExportedList, options: ImportOptions): void => {
    try {
      if (options.mode === 'create') {
        // Neue Liste erstellen
        const newList = createList(data.name, {
          items: data.items,
          isFavorite: false
        });
        
        if (newList) {
          selectList(newList.id);
        }
      } else if (options.mode === 'merge' && options.targetListId) {
        // Zu bestehender Liste hinzufügen
        const targetList = lists.value.find(list => list.id === options.targetListId);
        
        if (targetList) {
          // Artikel hinzufügen
          data.items.forEach(item => {
            addItem({
              ...item,
              id: Date.now() + Math.random().toString(36).substring(2, 9) // Neue ID generieren
            });
          });
          
          selectList(targetList.id);
        }
      } else if (options.mode === 'replace' && options.targetListId) {
        // Bestehende Liste ersetzen
        const targetList = lists.value.find(list => list.id === options.targetListId);
        
        if (targetList) {
          const updatedList: ShoppingList = {
            ...targetList,
            items: data.items,
            modifiedAt: Date.now()
          };
          
          updateList(updatedList);
          selectList(targetList.id);
        }
      }
    } catch (error) {
      console.error('Fehler beim Importieren der Liste:', error);
      alert('Beim Importieren der Liste ist ein Fehler aufgetreten.');
    }
  };

  /**
   * Importiert eine Liste
   * @param file - Die zu importierende Datei
   */
  const handleImportList = async (file: File): Promise<void> => {
    try {
      // Lese die Datei
      const fileData = await readFile(file);
      
      if (file.name.endsWith('.json')) {
        // Verarbeite JSON-Datei
        const parsedData = JSON.parse(fileData) as ExportedList;
        
        // Prüfe, ob es ein gültiges Format ist
        if (parsedData && parsedData.items && parsedData.name) {
          importData.value = parsedData;
          showImportOptions.value = true;
        } else {
          alert('Die Datei enthält keine gültige Einkaufsliste.');
        }
      } else if (file.name.endsWith('.csv')) {
        // Verarbeite CSV-Datei
        const items = parseCSV(fileData);
        
        if (items.length > 0) {
          const exportObj: ExportedList = {
            name: file.name.replace(/\.csv$/, '').replace(/_/g, ' '),
            items,
            format: 'shopping-list-app',
            version: '1.0',
            exportedAt: Date.now()
          };
          
          importData.value = exportObj;
          showImportOptions.value = true;
        } else {
          alert('Die CSV-Datei enthält keine gültigen Artikel.');
        }
      }
    } catch (error) {
      console.error('Fehler beim Importieren der Liste:', error);
      alert('Beim Importieren der Liste ist ein Fehler aufgetreten.');
    }
  };

  return {
    showImportOptions,
    importData,
    handleExportList,
    handleImportList,
    handleImportListWithOptions,
    openImportDialog
  };
}
