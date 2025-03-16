import { defineNuxtPlugin } from '#app';
import { createCategorySyncPlugin } from '~/stores/plugins/categorySyncPlugin';
import { useCategoryStore } from '~/stores/categoryStore';

/**
 * Plugin für die Synchronisierung von Kategorien über die App hinweg
 * Stellt sicher, dass Kategorieänderungen an alle Komponenten weitergegeben werden
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Pinia-Plugin für Kategoriesynchronisierung registrieren
  nuxtApp.$pinia.use(createCategorySyncPlugin());
  
  /**
   * Event-Listener für Kategorieupdates
   * @param callback - Callback-Funktion, die beim Kategorie-Update aufgerufen wird
   * @returns Funktion zum Entfernen des Listeners
   */
  const onCategoryUpdate = (callback: (categoryId: string, newName: string) => void): (() => void) => {
    const categoryStore = useCategoryStore();
    if (!categoryStore || !categoryStore.$categoryEventBus) return () => {};
    
    // Event-Listener hinzufügen
    return categoryStore.$categoryEventBus.on(callback);
  };
  
  return {
    provide: {
      onCategoryUpdate
    }
  };
});
