/**
 * Composable für den Import von Einkaufslisten
 */
export function useListImport() {
  /**
   * Importiert eine Liste aus JSON-Daten mit erweiterten Optionen
   * 
   * @param {object} importData - Die zu importierenden Daten
   * @param {object} options - Importoptionen
   * @param {string} options.option - 'new' für neue Liste oder 'update' für Update
   * @param {string} options.listId - ID der zu aktualisierenden Liste (wenn option === 'update')
   * @param {string} options.updateMode - 'append' oder 'replace' (wenn option === 'update')
   * @param {object} callbacks - Callback-Funktionen
   * @param {function} callbacks.createList - Funktion zum Erstellen einer neuen Liste
   * @param {function} callbacks.updateList - Funktion zum Aktualisieren einer bestehenden Liste
   * @param {function} callbacks.addItem - Funktion zum Hinzufügen eines Artikels
   * @param {function} callbacks.selectList - Funktion zum Auswählen einer Liste
   * @returns {boolean} - Erfolg des Imports
   */
  const importListWithOptions = (importData, options, callbacks) => {
    // Sicherstellen, dass wir gültige Daten haben
    if (!importData || !importData.name) {
      console.error('Ungültiges Import-Format');
      return false;
    }

    console.log('Import-Daten erhalten:', {
      listName: importData.name,
      templateId: importData.templateId,
      itemCount: importData.items?.length || 0
    });
    
    // Einheitliches Format für die Items sicherstellen
    const normalizedItems = (importData.items || []).map((item, index) => ({
      id: `imp_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
      name: item.name,
      quantity: item.quantity || 1,
      category: item.category || { id: 'sonstiges', name: 'Sonstiges' },
      price: item.price || 0,
      checked: item.checked || false
    }));

    // Neue Liste erstellen oder bestehende aktualisieren
    if (options.option === 'new') {
      // Neue Liste erstellen
      const newList = callbacks.createList(importData.name, {
        templateId: importData.templateId || 'supermarket',
        isFavorite: false
      });
      
      if (!newList) {
        console.error('Fehler beim Erstellen der Liste');
        return false;
      }
      
      console.log('Neue Liste erstellt:', {
        id: newList.id,
        name: newList.name,
        templateId: newList.templateId
      });
      
      // Items hinzufügen
      if (normalizedItems.length > 0) {
        console.log(`Füge ${normalizedItems.length} Artikel zur neuen Liste hinzu`);
        
        for (const itemData of normalizedItems) {
          try {
            const result = callbacks.addItem(itemData);
            if (!result) {
              console.warn(`  Artikel konnte nicht hinzugefügt werden!`);
            }
          } catch (itemError) {
            console.error('Fehler beim Hinzufügen eines Elements:', itemError);
          }
        }
      }
    } else if (options.option === 'update' && options.listId) {
      // Bestehende Liste aktualisieren
      console.log(`Aktualisiere bestehende Liste mit ID ${options.listId} (Modus: ${options.updateMode})`);
      
      // Liste auswählen
      callbacks.selectList(options.listId);
      
      if (options.updateMode === 'replace') {
        // Bei 'replace' wird die Liste zuerst geleert (durch updateList)
        callbacks.updateList(options.listId, [], importData.templateId);
      }
      
      // Items hinzufügen
      if (normalizedItems.length > 0) {
        console.log(`Füge ${normalizedItems.length} Artikel zur bestehenden Liste hinzu`);
        
        for (const itemData of normalizedItems) {
          try {
            const result = callbacks.addItem(itemData);
            if (!result) {
              console.warn(`  Artikel konnte nicht hinzugefügt werden!`);
            }
          } catch (itemError) {
            console.error('Fehler beim Hinzufügen eines Elements:', itemError);
          }
        }
      }
    } else {
      console.error('Ungültige Import-Optionen');
      return false;
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

  /**
   * Lädt eine Datei vom Nutzer für den Import mit Optionen
   * 
   * @param {Function} onFileLoaded - Callback, der mit den geparsten Daten aufgerufen wird
   */
  const loadFileAndShowOptions = (onFileLoaded) => {
    // Nutzt die gleiche Lade-Funktion, aber mit anderem Callback
    loadFileFromUser(onFileLoaded);
  };

  // Alte Funktion für Abwärtskompatibilität
  const importList = (importData, createListCallback, addItemCallback) => {
    return importListWithOptions(
      importData, 
      { option: 'new' }, 
      { 
        createList: createListCallback, 
        addItem: addItemCallback,
        selectList: () => {},
        updateList: () => {}
      }
    );
  };

  return {
    importList,
    importListWithOptions,
    loadFileFromUser,
    loadFileAndShowOptions
  };
}