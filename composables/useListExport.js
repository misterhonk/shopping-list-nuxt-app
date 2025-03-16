import { useShoppingLists } from './useShoppingLists';
import { useShoppingItems } from './useShoppingItems';

/**
 * Composable für das Exportieren und Importieren von Einkaufslisten
 * Bietet Funktionen zum Speichern und Laden von Listen als Datei
 */
export function useListExport() {
  const { lists, currentListId, currentList, createList } = useShoppingLists();
  const { addItem } = useShoppingItems(lists, currentListId);
  
  /**
   * Exportiert die aktuelle Liste als JSON-Datei
   * @return {boolean} true bei Erfolg, false bei Fehler
   */
  const exportCurrentList = () => {
    if (!currentList.value || !currentList.value.id) {
      console.error('Keine aktuelle Liste zum Exportieren gefunden');
      return false;
    }
    
    try {
      console.log('Starte Export für Liste:', currentList.value.name);
      
      // Bereite die Daten für den Export vor
      const exportData = {
        name: currentList.value.name,
        items: currentList.value.items || [],
        templateId: currentList.value.templateId,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0.0'
      };
      
      console.log('Export-Daten vorbereitet:', exportData);
      
      // Konvertiere zu JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Direkter Download mit Browser-API
      const fileName = `${currentList.value.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      
      // Erstelle einen Blob und einen Download-Link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      console.log('Blob erstellt, URL:', url);
      
      // Erstelle einen unsichtbaren Link zum Herunterladen
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Füge den Link zum DOM hinzu, klicke ihn und entferne ihn wieder
      document.body.appendChild(link);
      
      console.log('Link erstellt, starte Download:', fileName);
      link.click();
      
      // Kurze Verzögerung vor dem Entfernen des Links
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Download-Link entfernt, URL freigegeben');
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Fehler beim Exportieren der Liste:', error);
      return false;
    }
  };
  
  /**
   * Importiert eine Liste aus einer JSON-Datei
   * @param {File} file - Die zu importierende Datei
   * @return {Promise} Ein Promise mit dem Ergebnis des Imports
   */
  const importList = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Keine Datei ausgewählt'));
        return;
      }
      
      if (file.type !== 'application/json') {
        reject(new Error('Die Datei muss im JSON-Format sein'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          console.log('Datei geladen, parse JSON');
          const importData = JSON.parse(event.target.result);
          
          // Validiere die Daten
          if (!importData.name || !Array.isArray(importData.items)) {
            reject(new Error('Ungültiges Dateiformat. Die Datei enthält keine gültige Einkaufsliste.'));
            return;
          }
          
          console.log('Importiere Liste:', importData.name, 'mit', importData.items.length, 'Artikeln');
          
          // Erstelle eine neue Liste
          const newList = createList(importData.name, {
            templateId: importData.templateId || 'supermarket',
            isFavorite: false
          });
          
          // Füge alle Elemente hinzu
          if (newList && Array.isArray(importData.items) && importData.items.length > 0) {
            // Jedes Item einzeln hinzufügen
            console.log('Füge Items zur Liste hinzu');
            
            for (const item of importData.items) {
              const itemData = {
                name: item.name,
                quantity: item.quantity || 1,
                category: item.category || { id: 'sonstiges', name: 'Sonstiges' },
                price: item.price || 0
              };
              
              try {
                addItem(itemData);
              } catch (itemError) {
                console.error('Fehler beim Hinzufügen eines Elements:', itemError);
              }
            }
            
            resolve({
              success: true,
              message: 'Liste importiert: ' + importData.name,
              listId: newList.id,
              itemCount: importData.items.length
            });
          } else {
            reject(new Error('Fehler beim Erstellen der Liste'));
          }
        } catch (error) {
          console.error('Fehler beim Parsen der Datei:', error);
          reject(new Error('Die Datei konnte nicht gelesen werden: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei'));
      };
      
      reader.readAsText(file);
    });
  };
  
  return {
    exportCurrentList,
    importList
  };
}
