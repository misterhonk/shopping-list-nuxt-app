/**
 * Composable für den Import von Einkaufslisten
 */
export function useListImport() {
  /**
   * Importiert eine Liste aus JSON-Daten
   * 
   * @param {object} importData - Die zu importierenden Daten
   * @param {function} createListCallback - Funktion zum Erstellen einer neuen Liste
   * @param {function} addItemCallback - Funktion zum Hinzufügen eines Artikels
   * @returns {boolean} - Erfolg des Imports
   */
  const importList = (importData, createListCallback, addItemCallback) => {
    // Sicherstellen, dass wir eine gültige Liste haben
    if (!importData || !importData.name) {
      console.error('Ungültiges Import-Format');
      return false;
    }
    
    // Neue Liste erstellen
    const newList = createListCallback(importData.name, {
      templateId: importData.templateId || 'supermarket',
      isFavorite: false
    });
    
    if (!newList) {
      console.error('Fehler beim Erstellen der Liste');
      return false;
    }
    
    // Items hinzufügen, falls vorhanden
    if (Array.isArray(importData.items) && importData.items.length > 0) {
      console.log(`Füge ${importData.items.length} Artikel hinzu`);
      
      // Zeitstempel für eindeutige IDs
      const timestamp = Date.now();
      
      for (let i = 0; i < importData.items.length; i++) {
        const item = importData.items[i];
        
        // Sicherstellen, dass alle erforderlichen Felder vorhanden sind
        const itemData = {
          id: `${timestamp}_${i}_${Math.random().toString(36).substr(2, 5)}`, // Wirklich eindeutige ID generieren
          name: item.name,
          quantity: item.quantity || 1,
          category: item.category || { id: 'sonstiges', name: 'Sonstiges' },
          price: item.price || 0,
          checked: item.checked || false
        };
        
        try {
          addItemCallback(itemData);
        } catch (itemError) {
          console.error('Fehler beim Hinzufügen eines Elements:', itemError);
        }
      }
    }
    
    console.log('Import abgeschlossen');
    return true;
  };

  /**
   * Lädt eine Datei vom Nutzer und liest sie als JSON
   * 
   * @param {Function} onFileLoaded - Callback, der mit den geparsten Daten aufgerufen wird
   */
  const loadFileFromUser = (onFileLoaded) => {
    // Erstelle einen unsichtbaren Datei-Input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Event-Handler für Dateiauswahl
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) {
        document.body.removeChild(fileInput);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          onFileLoaded(importData);
        } catch (error) {
          console.error('Fehler beim Parsen der Datei:', error);
          alert('Die Datei konnte nicht gelesen werden. Bitte stellen Sie sicher, dass es sich um eine gültige JSON-Datei handelt.');
        }
        document.body.removeChild(fileInput);
      };
      
      reader.onerror = () => {
        console.error('Fehler beim Lesen der Datei');
        alert('Die Datei konnte nicht gelesen werden.');
        document.body.removeChild(fileInput);
      };
      
      reader.readAsText(file);
    });
    
    // Datei-Dialog öffnen
    fileInput.click();
  };

  return {
    importList,
    loadFileFromUser
  };
}