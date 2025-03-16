import { PiniaPluginContext } from 'pinia';
import { CategoryEventBus } from '../../composables/types';

/**
 * Interface für den CategoryStore mit Event-Bus
 */
interface CategoryStore {
  $id: string;
  $categoryEventBus?: CategoryEventBus;
  editCategory: (categoryToEdit: any, newName: string) => void;
}

/**
 * Pinia-Plugin zur Synchronisierung von Kategorieänderungen mit Einkaufselementen
 */
export function createCategorySyncPlugin() {
  // Für die Kommunikation zwischen Store und Komponenten
  const categoryUpdateEvents: Array<(categoryId: string, newName: string) => void> = [];

  // Event-Bus für Kategorieänderungen
  const categoryEventBus: CategoryEventBus = {
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
    },
  };

  // Plugin-Funktionalität
  return ({ store }: PiniaPluginContext) => {
    // Nur für den CategoryStore
    if (store.$id !== 'categoryStore') return;

    // Event-Bus als Store-Eigenschaft bereitstellen
    const categoryStore = store as unknown as CategoryStore;
    categoryStore.$categoryEventBus = categoryEventBus;

    // Original-Methode speichern
    const originalEditCategory = categoryStore.editCategory;

    // Patch für editCategory-Methode zum Synchronisieren von Änderungen
    categoryStore.editCategory = function (categoryToEdit: any, newName: string) {
      // Kategorie-ID extrahieren
      const categoryId = typeof categoryToEdit === 'object' ? categoryToEdit.id : categoryToEdit;

      // Originale Methode aufrufen
      originalEditCategory.call(this, categoryToEdit, newName);

      // Event auslösen, damit andere Komponenten reagieren können
      categoryEventBus.emit(categoryId, newName);
    };
  };
}
