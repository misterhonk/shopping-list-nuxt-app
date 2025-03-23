/**
 * Zentrale Typdefinitionen für die Shopping-List-App
 *
 * Diese Datei enthält alle wichtigen gemeinsamen Typendefinitionen,
 * die im gesamten Projekt verwendet werden.
 */

/**
 * Kategorie-Typ
 */
export interface Category {
  /** Eindeutige Kategorie-ID (kann vom Namen abgeleitet sein) */
  id: string;
  /** Anzeigename der Kategorie */
  name: string;
  /** Farbklasse für die Kategorie */
  color?: string;
  /** Icon für die Kategorie */
  icon?: string;
  /** Position/Reihenfolge der Kategorie */
  position?: number;
  /** Zusätzliche Eigenschaften für zukünftige Erweiterungen */
  [key: string]: unknown;
}

/**
 * Vorlage (Template) für Kategorien und Shop-Typen
 */
export interface CategoryTemplate {
  /** Eindeutige Template-ID */
  id: string;
  /** Anzeigename des Templates */
  name: string;
  /** Optionale Beschreibung des Templates */
  description?: string;
  /** Kategorien, die in diesem Template enthalten sind */
  categories: Category[];
  /** Standardreihenfolge der Kategorien (ids) */
  defaultCategoryOrder?: string[];
}

/**
 * Einkaufsartikel
 */
export interface ShoppingItem {
  /** Eindeutige Artikel-ID */
  id: string;
  /** Name des Artikels */
  name: string;
  /** Menge des Artikels */
  quantity: number;
  /** Kategorie des Artikels - kann eine ID (string) oder ein Category-Objekt sein */
  category: string | Category;
  /** Ob der Artikel bereits abgehakt ist */
  checked: boolean;
  /** Optionaler Preis des Artikels */
  price?: number;
  /** Optionale Notiz zum Artikel */
  note?: string;
  /** Zeitstempel der Hinzufügung */
  addedAt?: number;
  /** Zeitstempel der letzten Änderung */
  modifiedAt?: number;
  /** Optionale Listen-ID für Referenzen */
  listId?: string;
  /** Zusätzliche Eigenschaften für zukünftige Erweiterungen */
  [key: string]: unknown;
}

/**
 * Einkaufsliste
 */
export interface ShoppingList {
  /** Eindeutige Listen-ID */
  id: string;
  /** Name der Liste */
  name: string;
  /** Ob die Liste als Favorit markiert ist */
  isFavorite: boolean;
  /** ID des verwendeten Templates */
  templateId?: string;
  /** Artikel in der Liste */
  items: ShoppingItem[];
  /** Zeitstempel der Erstellung */
  createdAt?: number;
  /** Zeitstempel der letzten Änderung */
  modifiedAt?: number;
  /** Zusätzliche Eigenschaften für zukünftige Erweiterungen */
  [key: string]: unknown;
}

/**
 * Verlaufseintrag für Artikel
 */
export interface ItemHistoryEntry {
  /** Anzahl der Verwendungen */
  count: number;
  /** Zeitstempel der letzten Verwendung */
  lastUsed: string;
  /** In welchen Kategorien der Artikel verwendet wurde (mit Häufigkeit) */
  categories: Record<string, number>;
  /** Bisherige Preise mit Datum */
  prices: {
    price: number;
    date: string;
  }[];
}

/**
 * Artikelvorschlag für Autocomplete
 */
export interface ItemSuggestion {
  /** Anzeigename */
  text: string;
  /** Optionaler Zusatztext (z.B. Kategorie) */
  subtext?: string;
  /** Kategorie-Information */
  category?: Category;
  /** Zuletzt verwendeter Preis */
  price?: number;
}

/**
 * Update-Informationen
 */
export interface UpdateInfo {
  /** Ob ein Update verfügbar ist */
  hasUpdate: boolean;
  /** Die neue Version (falls ein Update verfügbar) */
  newVersion?: string;
}

/**
 * Typ für Template-Kategorien-Zuordnung
 */
export type TemplateCategories = Record<string, Category[]>;

/**
 * Typ für benutzerdefinierte Templates
 */
export type CustomTemplates = Record<string, CategoryTemplate>;
