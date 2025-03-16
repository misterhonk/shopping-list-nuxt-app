import { createCategorySyncPlugin } from '~/stores/plugins/categorySyncPlugin';
import { useCategoryStore } from '~/stores/categoryStore';

export default defineNuxtPlugin((nuxtApp) => {
  // Pinia-Plugin für Kategoriesynchronisierung registrieren
  nuxtApp.$pinia.use(createCategorySyncPlugin());
  
  // Event-Listener für Kategorieupdates bereitstellen
  nuxtApp.provide('onCategoryUpdate', (callback) => {
    const categoryStore = useCategoryStore();
    if (!categoryStore || !categoryStore.$categoryEventBus) return () => {};
    
    // Event-Listener hinzufügen
    return categoryStore.$categoryEventBus.on(callback);
  });
});