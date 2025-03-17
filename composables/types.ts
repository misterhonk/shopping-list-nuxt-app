/**
 * Typdefinitionen für die Shopping-List-App
 * Zentrale Sammlung aller verwendeten Typen für die App
 */

/**
 * Repräsentiert eine Kategorie in der Anwendung
 */
export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

/**
 * Interface für eine Kategorie-Vorlage
 */
export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  isCustom?: boolean;
}

/**
 * Interface für die Template-Listen
 */
export interface TemplateCollection {
  [key: string]: CategoryTemplate;
}

/**
 * Repräsentiert einen einzelnen Einkaufsartikel
 */
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: Category | string;
  checked: boolean;
  price: number;
  note?: string;
  addedAt?: number;
  modifiedAt?: number;
}

/**
 * Repräsentiert eine Einkaufsliste
 */
export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  templateId?: string;
  isFavorite: boolean;
  createdAt?: number;
  modifiedAt?: number;
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
