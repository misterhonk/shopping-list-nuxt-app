import { computed } from 'vue';

/**
 * Composable für die Analyse von Artikel-Daten
 * Bietet Funktionen für Preisberechnungen und Statistiken
 */
export function useItemAnalytics(shoppingListsRef, currentListIdRef) {
  /**
   * Berechnet den Gesamtpreis aller Artikel in der aktuellen Liste
   * @return {number} Der Gesamtpreis
   */
  const getTotalPrice = () => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    
    if (!currentList || !Array.isArray(currentList.items)) {
      return 0;
    }
    
    return currentList.items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + (itemPrice * itemQuantity);
    }, 0);
  };

  /**
   * Berechnet den Preis pro Kategorie
   * @param {string} categoryId - Die ID der Kategorie
   * @return {number} Der Preis für diese Kategorie
   */
  const getCategoryPrice = (categoryId) => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    
    if (!currentList || !Array.isArray(currentList.items)) {
      return 0;
    }
    
    return currentList.items
      .filter(item => {
        const itemCategoryId = typeof item.category === 'object' ? item.category.id : 'sonstiges';
        return itemCategoryId === categoryId;
      })
      .reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        return total + (itemPrice * itemQuantity);
      }, 0);
  };

  /**
   * Gibt die Anzahl der Artikel pro Kategorie zurück
   * @return {object} Ein Objekt mit Kategorie-IDs als Schlüssel und der Anzahl der Artikel als Wert
   */
  const getItemCountByCategory = () => {
    const currentList = shoppingListsRef.value.find(list => list.id === currentListIdRef.value);
    
    if (!currentList || !Array.isArray(currentList.items)) {
      return {};
    }
    
    return currentList.items.reduce((counts, item) => {
      const categoryId = typeof item.category === 'object' ? item.category.id : 'sonstiges';
      counts[categoryId] = (counts[categoryId] || 0) + 1;
      return counts;
    }, {});
  };

  return {
    getTotalPrice,
    getCategoryPrice,
    getItemCountByCategory
  };
}