// Dieses Plugin protokolliert Kategorieänderungen im Store
import { useCategoryStore } from '~/stores/categoryStore';

export default defineNuxtPlugin(nuxtApp => {
  // Hook in die Store-Aktionen
  nuxtApp.hook('app:mounted', () => {
    try {
      const categoryStore = useCategoryStore();
      if (!categoryStore) {
        return;
      }

      // Aktuellen Zustand protokollieren
      console.log('[DEBUG] Aktuelle Kategorien im Store:', categoryStore.currentCategories);

      // Listen auf Änderungen
      categoryStore.$onAction(({ name, args, after }) => {
        if (name === 'editCategory') {
          const [categoryToEdit, newName] = args;

          console.log('[DEBUG] editCategory aufgerufen:', {
            categoryToEdit,
            newName,
            type: typeof categoryToEdit,
            id: typeof categoryToEdit === 'object' ? categoryToEdit.id : categoryToEdit,
          });

          after(() => {
            console.log('[DEBUG] Nach editCategory:', categoryStore.currentCategories);
          });
        }
      });
    } catch (error) {
      console.error('[DEBUG] Fehler im Debug-Plugin:', error);
    }
  });
});
