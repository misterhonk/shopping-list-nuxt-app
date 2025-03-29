/**
 * MIGRATION-HINWEIS: Diese Datei ist VERALTET und sollte nicht mehr direkt verwendet werden!
 *
 * Alle Typdefinitionen wurden in folgende Dateien verschoben:
 * - ~/types/app-types.ts - Haupttypen wie IShoppingList, IShoppingItem, ICategory
 * - ~/types/composable-types.ts - Typen für Composables-Rückgabewerte
 * - ~/types/form-types.ts - Formular-spezifische Typen
 *
 * Diese Datei bleibt nur vorübergehend zur Unterstützung bestehenden Codes erhalten und wird in einem
 * zukünftigen Update entfernt werden.
 */

import type { IShoppingList, IShoppingItem, ICategory, ICategoryTemplate } from '~/types/app-types';

// Re-Exports mit korrekten I-Präfixen
export type {
  IShoppingList as ShoppingList,
  IShoppingItem as ShoppingItem,
  ICategory as Category,
  ICategoryTemplate as CategoryTemplate,
};

/**
 * @deprecated Bitte stattdessen ITemplateCollection aus types/app-types.ts verwenden.
 */
export interface ITemplateCollection {
  [key: string]: ICategoryTemplate;
}

/**
 * @deprecated Bitte stattdessen ICategorySortConfig aus types/app-types.ts verwenden.
 */
export interface ICategorySortConfig {
  templateId: string;
  useCustomSort: boolean;
  customOrder: string[];
}

/**
 * @deprecated Bitte stattdessen ICreateListOptions aus types/app-types.ts verwenden.
 */
export interface ICreateListOptions {
  templateId?: string;
  isFavorite?: boolean;
  items?: IShoppingItem[];
}

/**
 * @deprecated Bitte stattdessen IImportOptions aus types/app-types.ts verwenden.
 */
export interface IImportOptions {
  mode: 'create' | 'merge' | 'replace';
  targetListId?: string;
  keepExistingItems?: boolean;
}

/**
 * @deprecated Bitte stattdessen IExportedList aus types/app-types.ts verwenden.
 */
export interface IExportedList {
  name: string;
  items: IShoppingItem[];
  format: string;
  version: string;
  exportedAt: number;
  templateId?: string;
}

/**
 * @deprecated Bitte stattdessen IAvailableListInfo aus types/app-types.ts verwenden.
 */
export interface IAvailableListInfo {
  id: string;
  name: string;
  itemCount: number;
}

/**
 * @deprecated Bitte stattdessen ICategoryEventBus aus types/app-types.ts verwenden.
 */
export interface ICategoryEventBus {
  on: (callback: (categoryId: string, newName: string) => void) => () => void;
  emit: (categoryId: string, newName: string) => void;
}
