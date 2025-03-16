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
}
