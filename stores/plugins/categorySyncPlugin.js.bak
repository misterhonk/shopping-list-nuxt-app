/**
 * Pinia-Plugin zur Synchronisierung von Kategorieänderungen mit Einkaufselementen
 */
export function createCategorySyncPlugin() {
  // Für die Kommunikation zwischen Store und Komponenten
  const categoryUpdateEvents = [];
  
  // Event-Bus für Kategorieänderungen
  const categoryEventBus = {
    // Event-Listener registrieren
    on(callback) {
      categoryUpdateEvents.push(callback);
      return () => {
        const index = categoryUpdateEvents.indexOf(callback);
        if (index !== -1) categoryUpdateEvents.splice(index, 1);
      };
    },
    // Event auslösen
    emit(categoryId, newName) {
      categoryUpdateEvents.forEach(callback => callback(categoryId, newName));
    }
  };
  
  // Plugin-Funktionalität
  return ({ store }) => {
    // Nur für den CategoryStore
    if (store.$id !== 'categoryStore') return;
    
    // Event-Bus als Store-Eigenschaft bereitstellen
    store.$categoryEventBus = categoryEventBus;

    // Patch für editCategory-Methode zum Synchronisieren von Änderungen
    const originalEditCategory = store.editCategory;
    store.editCategory = function(categoryToEdit, newName) {
      // Kategorie-ID extrahieren
      const categoryId = (typeof categoryToEdit === 'object') ? categoryToEdit.id : categoryToEdit;
      
      // Originale Methode aufrufen
      originalEditCategory.call(this, categoryToEdit, newName);
      
      // Event auslösen, damit andere Komponenten reagieren können
      categoryEventBus.emit(categoryId, newName);
    };
  };
}