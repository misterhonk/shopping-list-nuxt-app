/**
 * Sortierungslogik für Kategorien in Einkaufslisten
 *
 * Diese Datei enthält Funktionen zum Sortieren von Kategorien basierend auf
 * Standard-Laufwegen oder benutzerdefinierten Sortierreihenfolgen.
 */

import { createLogger } from '~/utils/logger';

import type { ICategorySortConfig, ICategory, ICategoryTemplate } from '~/types/app-types';

// Logger initialisieren
const _logger = createLogger('sorting');

/**
 * Schlüssel für die Speicherung der Sortierungskonfigurationen im localStorage
 */
export const SORT_CONFIG_STORAGE_KEY = 'categorySortConfigs';

/**
 * Lädt alle Sortierungskonfigurationen aus dem localStorage
 * @returns Record mit Template-IDs als Schlüssel und den entsprechenden Konfigurationen
 */
export const loadSortConfigs = (): Record<string, ICategorySortConfig> => {
  try {
    const storedConfigs = localStorage.getItem(SORT_CONFIG_STORAGE_KEY);
    if (storedConfigs) {
      return JSON.parse(storedConfigs);
    }
  } catch (error) {
    _logger.error('Fehler beim Laden der Sortierungskonfigurationen:', error);
  }
  return {};
};

/**
 * Speichert alle Sortierungskonfigurationen im localStorage
 * @param configs Die zu speichernden Konfigurationen
 */
export const saveSortConfigs = (configs: Record<string, ICategorySortConfig>): void => {
  try {
    localStorage.setItem(SORT_CONFIG_STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    _logger.error('Fehler beim Speichern der Sortierungskonfigurationen:', error);
  }
};

/**
 * Gibt die Sortierungskonfiguration für ein bestimmtes Template zurück oder erstellt eine neue
 * @param templateId ID des Templates
 * @param configs Alle vorhandenen Konfigurationen
 * @returns Die Sortierungskonfiguration für das angegebene Template
 */
export const getSortConfigForTemplate = (
  templateId: string,
  configs: Record<string, ICategorySortConfig>
): ICategorySortConfig => {
  if (configs[templateId]) {
    return configs[templateId];
  }

  // Default-Konfiguration erstellen
  return {
    templateId,
    useCustomSort: false,
    customOrder: [],
  };
};

/**
 * Aktualisiert oder erstellt eine Sortierungskonfiguration
 * @param config Die zu speichernde Konfiguration
 * @param configs Alle vorhandenen Konfigurationen
 * @returns Aktualisierte Konfigurationen
 */
export const updateSortConfig = (
  config: ICategorySortConfig,
  configs: Record<string, ICategorySortConfig>
): Record<string, ICategorySortConfig> => ({
  ...configs,
  [config.templateId]: config,
});

/**
 * Sortiert Kategorien basierend auf der angegebenen Sortierungskonfiguration
 * @param categories Die zu sortierenden Kategorien
 * @param template Das aktuelle Template
 * @param sortConfig Die zu verwendende Sortierungskonfiguration
 * @returns Sortierte Kategorien
 */
export const sortCategories = (
  categories: ICategory[],
  template: ICategoryTemplate,
  sortConfig: ICategorySortConfig
): ICategory[] => {
  // Wenn eine benutzerdefinierte Sortierung verwendet werden soll und vorhanden ist
  if (sortConfig.useCustomSort && sortConfig.customOrder.length > 0) {
    return sortCategoriesByCustomOrder(categories, sortConfig.customOrder);
  }

  // Wenn das Template eine Standard-Reihenfolge definiert
  if (template.defaultCategoryOrder && template.defaultCategoryOrder.length > 0) {
    return sortCategoriesByDefaultOrder(categories, template.defaultCategoryOrder);
  }

  // Fallback: Alphabetisch nach Namen sortieren
  return sortCategoriesAlphabetically(categories);
};

/**
 * Sortiert Kategorien nach einer benutzerdefinierten Reihenfolge
 * @param categories Die zu sortierenden Kategorien
 * @param customOrder Die benutzerdefinierte Reihenfolge der Kategorie-IDs
 * @returns Sortierte Kategorien
 */
export const sortCategoriesByCustomOrder = (
  categories: ICategory[],
  customOrder: string[]
): ICategory[] => {
  // Erstelle eine Map für schnellen Zugriff auf die Positionen
  const orderMap = new Map<string, number>();
  customOrder.forEach((id, index) => {
    orderMap.set(id, index);
  });

  // Kopiere die Kategorien, um das Original nicht zu verändern
  const sortedCategories = [...categories];

  // Sortiere basierend auf der benutzerdefinierten Reihenfolge
  return sortedCategories.sort((a, b) => {
    const posA = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const posB = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;

    // Wenn beide Positionen definiert sind, nach Position sortieren
    if (posA !== Number.MAX_SAFE_INTEGER && posB !== Number.MAX_SAFE_INTEGER) {
      return posA - posB;
    }

    // Wenn nur eine Position definiert ist, diese nach vorne stellen
    if (posA !== Number.MAX_SAFE_INTEGER) {
      return -1;
    }
    if (posB !== Number.MAX_SAFE_INTEGER) {
      return 1;
    }

    // Fallback: Alphabetisch sortieren
    return a.name.localeCompare(b.name);
  });
};

/**
 * Sortiert Kategorien nach der Standardreihenfolge des Templates
 * @param categories Die zu sortierenden Kategorien
 * @param defaultOrder Die Standardreihenfolge der Kategorie-IDs
 * @returns Sortierte Kategorien
 */
export const sortCategoriesByDefaultOrder = (
  categories: ICategory[],
  defaultOrder: string[]
): ICategory[] =>
  // Identische Implementierung wie bei benutzerdefinierter Reihenfolge
  sortCategoriesByCustomOrder(categories, defaultOrder);

/**
 * Sortiert Kategorien alphabetisch nach Namen
 * @param categories Die zu sortierenden Kategorien
 * @returns Alphabetisch sortierte Kategorien
 */
export const sortCategoriesAlphabetically = (categories: ICategory[]): ICategory[] =>
  [...categories].sort((a, b) => a.name.localeCompare(b.name));
