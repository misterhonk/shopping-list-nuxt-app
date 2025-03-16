export default defineNuxtPlugin((nuxtApp) => {
  // Listener für Kategorieänderungen registrieren
  nuxtApp.hook('app:mounted', () => {
    const onCategoryUpdate = nuxtApp.$onCategoryUpdate;
    if (onCategoryUpdate) {
      const unsubscribe = onCategoryUpdate((categoryId, newName) => {
        console.log(`[Debug] Kategorie-Update erkannt: ID=${categoryId}, Name=${newName}`);
      });
    }
  });
});