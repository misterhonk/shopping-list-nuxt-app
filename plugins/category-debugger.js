import { createLogger } from '../utils/logger';

// Dieses Plugin protokolliert Kategorieänderungen im Store
import { useCategoryStore } from '~/stores/categoryStore';

// Logger initialisieren
const logger = createLogger('category-debugger');

export default defineNuxtPlugin(nuxtApp => {
  // Hook in die Store-Aktionen
  nuxtApp.hook('app:mounted', () => {
    try {
      const categoryStore = useCategoryStore();
      if (!categoryStore) {
        return;
      }

      // Aktuellen Zustand protokollieren
      logger.info('[DEBUG] Aktuelle Kategorien im Store:', categoryStore.currentCategories);

      // Listen auf Änderungen
      categoryStore.$onAction(({ name, args, after }) => {
        if (name === 'editCategory') {
          const [categoryToEdit, newName] = args;

          logger.info('[DEBUG] editCategory aufgerufen:', {
            categoryToEdit,
            newName,
            type: typeof categoryToEdit,
            id: typeof categoryToEdit === 'object' ? categoryToEdit.id : categoryToEdit,
          });

          after(() => {
            logger.info('[DEBUG] Nach editCategory:', categoryStore.currentCategories);
          });
        }
      });
    } catch (error) {
      logger.error('[DEBUG] Fehler im Debug-Plugin:', error);
    }
  });
});
