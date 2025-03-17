// Dieses Plugin protokolliert Kategorieänderungen im Store
import { useCategoryStore } from '~/stores/categoryStore';

// Einfacher lokaler Logger
const log = {
  info: (...args) => console.info('[CategoryDebugger]', ...args),
  warn: (...args) => console.warn('[CategoryDebugger]', ...args),
  error: (...args) => console.error('[CategoryDebugger]', ...args),
};

export default defineNuxtPlugin(nuxtApp => {
  // Hook in die Store-Aktionen
  nuxtApp.hook('app:mounted', () => {
    try {
      const categoryStore = useCategoryStore();
      if (!categoryStore) {
        return;
      }

      // Aktuellen Zustand protokollieren
      log.info('Aktuelle Kategorien im Store:', categoryStore.currentCategories);

      // Listen auf Änderungen
      categoryStore.$onAction(({ name, args, after }) => {
        if (name === 'editCategory') {
          const [categoryToEdit, newName] = args;

          log.info('editCategory aufgerufen:', {
            categoryToEdit,
            newName,
            type: typeof categoryToEdit,
            id: typeof categoryToEdit === 'object' ? categoryToEdit.id : categoryToEdit,
          });

          after(() => {
            log.info('Nach editCategory:', categoryStore.currentCategories);
          });
        }
      });
    } catch (error) {
      log.error('Fehler im Debug-Plugin:', error);
    }
  });
});
