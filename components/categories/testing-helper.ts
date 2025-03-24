import { createLogger } from '~/utils/logger';

import type { ShoppingList, Category, ShoppingItem } from '~/types/app-types';

/**
 * Diese Hilfsfunktion ermöglicht einen direkten Zugriff auf den Kategorie-Store
 * sowie der Listendaten im LocalStorage zur Diagnose und Behebung von Kategorienamen-Synchronisationsproblemen
 */

// Logger initialisieren
const logger = createLogger('testing-helper');

interface ICategoryData {
  activeTemplateId: string;
  customTemplates: Record<
    string,
    {
      id: string;
      name: string;
      description: string;
      categories: Category[];
    }
  >;
}

interface ICategoryUsage {
  count: number;
  items: string[];
}

/**
 * Diagnose-Funktion für Kategoriedaten
 * Reduziert die kognitive Komplexität durch klare Funktionsaufteilung
 */
/**
 * Lädt und prüft die benötigten Daten aus dem Local Storage
 */
const loadDiagnosticData = (): void => {
  // Kategoriedaten aus localStorage abrufen
  const categoryData = localStorage.getItem('categoryTemplates');
  const listData = localStorage.getItem('shoppingLists');

  if (!categoryData || !listData) {
    logger.error('[Diagnose] Keine Daten gefunden');
    return null;
  }

  const parsedCategories = JSON.parse(categoryData) as CategoryData;
  const parsedLists = JSON.parse(listData) as ShoppingList[];

  logger.info('[Diagnose] Kategorie-Daten:', parsedCategories);
  logger.info('[Diagnose] Listen-Daten:', parsedLists);

  return { parsedCategories, parsedLists };
};

/**
 * Ermittelt das aktive Template
 */
const getActiveTemplate = (parsedCategories: ICategoryData): void => {
  if (
    !parsedCategories.activeTemplateId ||
    !parsedCategories.customTemplates[parsedCategories.activeTemplateId]
  ) {
    return null;
  }

  return parsedCategories.customTemplates[parsedCategories.activeTemplateId];
};

/**
 * Sammelt Informationen über die verwendeten Kategorien
 */
const collectCategoryUsage = (parsedLists: ShoppingList[]): Record<string, CategoryUsage> => {
  const categoriesInUse: Record<string, CategoryUsage> = {};

  parsedLists.forEach(list => {
    if (!Array.isArray(list.items)) {
      return;
    }

    list.items.forEach(item => {
      if (!item.category) {
        return;
      }

      const categoryKey =
        typeof item.category === 'object'
          ? `${item.category.id}|${item.category.name}`
          : `unknown|${item.category}`;

      if (!categoriesInUse[categoryKey]) {
        categoriesInUse[categoryKey] = { count: 0, items: [] };
      }

      categoriesInUse[categoryKey].count++;
      categoriesInUse[categoryKey].items.push(`${item.name} (in Liste: ${list.name})`);
    });
  });

  return categoriesInUse;
};

/**
 * Diagnose-Funktion für Kategoriedaten
 * Reduziert die kognitive Komplexität durch klare Funktionsaufteilung
 */
export function diagnoseCategories():
  | ((categoryId: string, newName: string) => boolean)
  | undefined {
  try {
    // Daten laden und validieren
    const data = loadDiagnosticData();
    if (!data) {
      return undefined;
    }

    const { parsedCategories, parsedLists } = data;

    // Aktuelle Kategorien abrufen
    const activeTemplate = getActiveTemplate(parsedCategories);
    logger.info('[Diagnose] Aktives Template:', activeTemplate);

    // Kategorien-Nutzung analysieren
    const categoriesInUse = collectCategoryUsage(parsedLists);
    logger.info('[Diagnose] Kategorien in Verwendung:', categoriesInUse);

    /**
     * Prüft, ob eine Kategorie in einem Artikel verwendet wird
     */
    const isCategoryMatch = (item: ShoppingItem, categoryId: string): boolean =>
      item.category && typeof item.category === 'object' && item.category.id === categoryId;

    /**
     * Aktualisiert einen Artikel mit dem neuen Kategorienamen
     */
    const updateItemCategory = (
      item: ShoppingItem,
      categoryId: string,
      newName: string
    ): ShoppingItem => {
      if (!isCategoryMatch(item, categoryId)) {
        return item;
      }

      return {
        ...item,
        category: {
          ...item.category,
          name: newName,
        },
      };
    };

    /**
     * Aktualisiert die Listen mit dem neuen Kategorienamen
     */
    const updateListsWithCategory = (
      lists: ShoppingList[],
      categoryId: string,
      newName: string
    ): void => {
      let updatedCount = 0;

      const newLists = lists.map(list => {
        if (!Array.isArray(list.items)) {
          return list;
        }

        const updatedItems = list.items.map(item => {
          if (isCategoryMatch(item, categoryId)) {
            updatedCount++;
            return updateItemCategory(item, categoryId, newName);
          }
          return item;
        });

        return {
          ...list,
          items: updatedItems,
        };
      });

      return { newLists, updatedCount };
    };

    /**
     * Update-Funktion für Kategorien
     * Wird als Rückgabewert der Hauptfunktion verwendet
     */
    return function forceUpdateCategory(categoryId: string, newName: string): boolean {
      const { newLists, updatedCount } = updateListsWithCategory(parsedLists, categoryId, newName);

      if (updatedCount > 0) {
        localStorage.setItem('shoppingLists', JSON.stringify(newLists));
        logger.info(
          `[Diagnose] ${updatedCount} Artikel aktualisiert mit neuer Kategorie "${newName}"`
        );
        return true;
      }

      logger.info(`[Diagnose] Keine Artikel mit Kategorie-ID "${categoryId}" gefunden`);
      return false;
    };
  } catch (error) {
    logger.error('[Diagnose] Fehler:', error);
    return undefined;
  }
}
