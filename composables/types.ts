/**
 * Typdefinitionen für die Shopping-List-App
 * Re-Exports aus der zentralen Typdatei
 * 
 * WICHTIG: Diese Datei ist veraltet und bleibt nur aus Kompatibilitätsgründen.
 * Bitte verwende direkt die Typen aus '~/types/app-types' und '~/types/form-types'.
 */

import type { 
  Category, 
  CategoryTemplate, 
  ShoppingItem, 
  ShoppingList,
} from '~/types/app-types';

// Re-Exports der Basis-Typen zur Abwärtskompatibilität
export type { 
  Category, 
  CategoryTemplate, 
  ShoppingItem, 
  ShoppingList 
};

/**
 * Interface für die Template-Listen
 * @deprecated Bitte stattdessen TemplateCategories aus app-types.ts verwenden
 */
export interface TemplateCollection {
  [key: string]: CategoryTemplate;
}

/**
 * Interface für die Sortierungskonfiguration von Kategorien
 */
export interface CategorySortConfig {
  templateId: string; // ID der Vorlage, zu der diese Konfiguration gehört
  useCustomSort: boolean; // Ob benutzerdefinierte Sortierung verwendet werden soll
  customOrder: string[]; // Array von Category-IDs in benutzerdefinierter Reihenfolge
}

/**
 * Optionen für das Erstellen einer neuen Liste
 */
export interface CreateListOptions {
  templateId?: string;
  isFavorite?: boolean;
  items?: ShoppingItem[];
}

/**
 * Optionen für den Import einer Liste
 */
export interface ImportOptions {
  mode: 'create' | 'merge' | 'replace';
  targetListId?: string;
  keepExistingItems?: boolean;
}

/**
 * Format für den Export/Import von Listen
 */
export interface ExportedList {
  name: string;
  items: ShoppingItem[];
  format: string;
  version: string;
  exportedAt: number;
  templateId?: string;
}

/**
 * Interface für Verfügbare Listen im Import-Dialog
 */
export interface AvailableListInfo {
  id: string;
  name: string;
  itemCount: number;
}

/**
 * Interface für den Eventbus
 */
export interface CategoryEventBus {
  on: (callback: (categoryId: string, newName: string) => void) => () => void;
  emit: (categoryId: string, newName: string) => void;
}
