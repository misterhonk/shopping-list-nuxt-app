import { defineNuxtPlugin } from 'nuxt/app';

import { useCategoryStore } from '~/stores/category';
import { createLogger } from '~/utils/logger';

// Logger initialisieren
const _logger = createLogger('category-sync');

/**
 * Plugin für die Synchronisierung von Kategorien über die App hinweg
 * Stellt sicher, dass Kategorieänderungen an alle Komponenten weitergegeben werden
 */
export default defineNuxtPlugin(_nuxtApp => {
  // Einfacher Event-Bus für Kategorieänderungen
  const callbacks: ((categoryId: string, newName: string) => void)[] = [];

  const categoryEventBus = {
    on(callback: (categoryId: string, newName: string) => void) {
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      };
    },
    emit(categoryId: string, newName: string): void {
      callbacks.forEach(callback => callback(categoryId, newName));
    },
  };

  // Event-Listener Hook für Komponenten
  const onCategoryUpdate = (callback: (categoryId: string, newName: string) => void) =>
    categoryEventBus.on(callback);

  // Kategorie-Store patchen, um Events zu emittieren, wenn Kategorien bearbeitet werden
  try {
    const categoryStore = useCategoryStore();

    if (categoryStore) {
      // Original-Methode sichern
      const originalEditCategory = categoryStore.editCategory;

      // Methode überschreiben um Events auszulösen
      categoryStore.editCategory = function (
        categoryToEdit: { id: string } | string,
        newName: string
      ) {
        // Originale Methode aufrufen
        originalEditCategory.call(this, categoryToEdit, newName);

        // Kategorie-ID extrahieren
        const categoryId = typeof categoryToEdit === 'object' ? categoryToEdit.id : categoryToEdit;

        // Event auslösen
        categoryEventBus.emit(categoryId, newName);
      };
    }
  } catch (error) {
    _logger.error('Fehler beim Einrichten der Kategoriesynchronisierung:', error);
  }

  return {
    provide: {
      onCategoryUpdate,
      emitCategoryUpdate: categoryEventBus.emit,
    },
  };
});
