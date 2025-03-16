/**
 * Composable für den Export von Einkaufslisten
 */
export function useListExport() {
  /**
   * Exportiert eine Liste als JSON-Datei
   * @param {object} exportData - Die zu exportierenden Daten 
   * @param {string} exportData.name - Der Name der Liste
   * @param {string} exportData.templateId - Die Template-ID der Liste
   * @param {array} exportData.items - Die Elemente der Liste
   */
  const exportList = (exportData, items) => {
    if (!exportData || !exportData.name) {
      console.error('Ungültige Exportdaten');
      return false;
    }
    
    // Liste mit Einträgen befüllen
    const itemsToExport = items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      price: item.price,
      checked: item.checked
    }));
    
    // Daten zusammenführen
    const dataToExport = {
      ...exportData,
      items: itemsToExport
    };
    
    // JSON erstellen
    const jsonData = JSON.stringify(dataToExport, null, 2);
    
    // Download starten
    const fileName = `${exportData.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Download-Link erstellen und klicken
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Link nach kurzer Zeit entfernen
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return true;
  };

  return {
    exportList
  };
}