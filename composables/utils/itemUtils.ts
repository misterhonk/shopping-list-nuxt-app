import { createLogger } from '~/utils/logger';

import type { ShoppingItem } from '~/types/app-types';

// Logger initialisieren
const logger = createLogger('itemUtils');

/**
 * Prüft, ob ein Item zu einer bestimmten Kategorie-ID gehört
 * @param item - Das zu prüfende Item
 * @param categoryId - Die zu prüfende Kategorie-ID
 * @returns true, wenn das Item zu der Kategorie gehört, sonst false
 */
export const itemBelongsToCategory = (item: ShoppingItem, categoryId: string): boolean => {
  if (!item.category) {
    return false;
  }

  if (typeof item.category === 'object' && item.category.id === categoryId) {
    return true;
  }

  if (typeof item.category === 'string') {
    // Fallback für alte Kategorieformate
    const normalizedCategoryId = item.category.toLowerCase().replace(/[\s&]/g, '_');
    return normalizedCategoryId === categoryId;
  }

  return false;
};

/**
 * Aktualisiert ein Item mit einer neuen Kategorie
 * @param item - Das zu aktualisierende Item
 * @param categoryId - Die Kategorie-ID
 * @param newName - Der neue Kategoriename
 * @returns Das aktualisierte Item
 */
export const updateItemCategory = (
  item: ShoppingItem,
  categoryId: string,
  newName: string
): ShoppingItem => ({
  ...item,
  category: {
    id: categoryId,
    name: newName,
  },
  modifiedAt: Date.now(),
});

/**
 * Erstellt ein neues Item-Objekt basierend auf den übergebenen Daten
 * @param itemData - Die Daten für das neue Item
 * @returns Das neue Item-Objekt
 */
export const createItemObject = (itemData: Partial<ShoppingItem>): ShoppingItem => ({
  id: itemData.id ?? Date.now().toString(), // Vorhandene ID verwenden oder neue erstellen
  name: itemData.name ?? '',
  quantity: itemData.quantity ?? 1,
  category: itemData.category ?? 'Sonstiges',
  checked: itemData.checked ?? false,
  price: itemData.price ?? 0,
  addedAt: Date.now(),
  modifiedAt: Date.now(),
});

/**
 * Gruppiert Artikel nach Kategorien
 * @param items - Die zu gruppierenden Artikel
 * @param categories - Die verfügbaren Kategorien
 * @returns Ein Objekt mit Kategorien als Schlüssel und Arrays von Artikeln als Werte
 */
export const groupItemsByCategory = (
  items: ShoppingItem[],
  categories: string[]
): Record<string, ShoppingItem[]> => {
  const grouped: Record<string, ShoppingItem[]> = {};

  // Für jede Kategorie ein Array erstellen (auch wenn leer)
  categories.forEach(category => {
    grouped[category] = [];
  });

  // Dann Elemente in die entsprechenden Kategorien einsortieren
  items.forEach(item => {
    const category = item.category ?? 'Sonstiges';
    const categoryName = typeof category === 'object' ? category.name : category;

    if (grouped[categoryName]) {
      grouped[categoryName].push(item);
    } else {
      // Wenn die Kategorie nicht mehr existiert, zum Punkt "Sonstiges" hinzufügen
      if (!grouped['Sonstiges']) {
        grouped['Sonstiges'] = [];
      }
      grouped['Sonstiges'].push(item);
    }
  });

  return grouped;
};

/**
 * Berechnet den Gesamtpreis aller Artikel
 * @param items - Die Artikel, für die der Gesamtpreis berechnet werden soll
 * @returns Der Gesamtpreis
 */
export const calculateTotalPrice = (items: ShoppingItem[]): number => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    const itemPrice = item.price ?? 0;
    const itemQuantity = item.quantity ?? 1;
    return total + itemPrice * itemQuantity;
  }, 0);
};

/**
 * Berechnet den Preis für eine bestimmte Kategorie
 * @param items - Die Artikel
 * @param categoryId - Die ID der Kategorie
 * @returns Der Preis für die Kategorie
 */
export const calculateCategoryPrice = (items: ShoppingItem[], categoryId: string): number => {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items
    .filter(item => itemBelongsToCategory(item, categoryId))
    .reduce((total, item) => {
      const itemPrice = item.price ?? 0;
      const itemQuantity = item.quantity ?? 1;
      return total + itemPrice * itemQuantity;
    }, 0);
};
