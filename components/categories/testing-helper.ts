import { ShoppingList, Category } from '../../composables/types';
import { createLogger } from '../../utils/logger';

/**
 * Diese Hilfsfunktion ermöglicht einen direkten Zugriff auf den Kategorie-Store
 * sowie der Listendaten im LocalStorage zur Diagnose und Behebung von Kategorienamen-Synchronisationsproblemen
 */

// Logger initialisieren
const logger = createLogger('testing-helper');

interface CategoryData {
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

interface CategoryUsage {
  count: number;
  items: string[];
}

export function diagnoseCategories():
  | ((categoryId: string, newName: string) => boolean)
  | undefined {
  try {
    // Kategoriedaten aus localStorage abrufen
    const categoryData = localStorage.getItem('categoryTemplates');
    const listData = localStorage.getItem('shoppingLists');

    if (!categoryData || !listData) {
      logger.error('[Diagnose] Keine Daten gefunden');
      return undefined;
    }

    const parsedCategories = JSON.parse(categoryData) as CategoryData;
    const parsedLists = JSON.parse(listData) as ShoppingList[];

    logger.info('[Diagnose] Kategorie-Daten:', parsedCategories);
    logger.info('[Diagnose] Listen-Daten:', parsedLists);

    // Aktuelle Kategorien abrufen
    let activeTemplate = null;
    if (parsedCategories.activeTemplateId) {
      if (
        parsedCategories.customTemplates &&
        parsedCategories.customTemplates[parsedCategories.activeTemplateId]
      ) {
        activeTemplate = parsedCategories.customTemplates[parsedCategories.activeTemplateId];
      }
    }

    logger.info('[Diagnose] Aktives Template:', activeTemplate);

    // Artikel und deren Kategorien auflisten
    const categoriesInUse: Record<string, CategoryUsage> = {};

    parsedLists.forEach(list => {
      if (Array.isArray(list.items)) {
        list.items.forEach(item => {
          if (item.category) {
            const categoryKey =
              typeof item.category === 'object'
                ? `${item.category.id}|${item.category.name}`
                : `unknown|${item.category}`;

            if (!categoriesInUse[categoryKey]) {
              categoriesInUse[categoryKey] = { count: 0, items: [] };
            }

            categoriesInUse[categoryKey].count++;
            categoriesInUse[categoryKey].items.push(`${item.name} (in Liste: ${list.name})`);
          }
        });
      }
    });

    logger.info('[Diagnose] Kategorien in Verwendung:', categoriesInUse);

    // Direktes Update der Kategorien in allen Artikeln durch manuelles Setzen
    return function forceUpdateCategory(categoryId: string, newName: string): boolean {
      let updatedCount = 0;
      const newLists = parsedLists.map(list => {
        if (Array.isArray(list.items)) {
          list.items = list.items.map(item => {
            if (
              item.category &&
              typeof item.category === 'object' &&
              item.category.id === categoryId
            ) {
              updatedCount++;
              return {
                ...item,
                category: {
                  ...item.category,
                  name: newName,
                },
              };
            }
            return item;
          });
        }
        return list;
      });

      if (updatedCount > 0) {
        localStorage.setItem('shoppingLists', JSON.stringify(newLists));
        logger.info(
          `[Diagnose] ${updatedCount} Artikel aktualisiert mit neuer Kategorie "${newName}"`
        );
        return true;
      } else {
        logger.info(`[Diagnose] Keine Artikel mit Kategorie-ID "${categoryId}" gefunden`);
        return false;
      }
    };
  } catch (error) {
    logger.error('[Diagnose] Fehler:', error);
    return undefined;
  }
}
