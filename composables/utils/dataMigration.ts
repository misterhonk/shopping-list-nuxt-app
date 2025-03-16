import { ShoppingList, ShoppingItem, Category } from '../types';

/**
 * Hilfsmodul für die Migration alter Datenstrukturen
 * Bietet Funktionen zur Konvertierung von Daten zwischen verschiedenen Versionen der App
 */

/**
 * Migrationsoption für die Liste
 */
interface MigrationOptions {
  addTimestamps?: boolean;
  normalizeCategories?: boolean;
  sanitizeItems?: boolean;
  itemDefaults?: Partial<ShoppingItem>;
}

/**
 * Migriert eine alte Listenstruktur in das aktuelle Format
 * @param oldList - Die zu migrierende Liste
 * @param options - Migrationsoptionen
 * @returns Die migrierte Liste
 */
export function migrateList(oldList: any, options: MigrationOptions = {}): ShoppingList {
  // Basislistenstruktur erstellen
  const now = Date.now();
  const migratedList: ShoppingList = {
    id: oldList.id || now.toString(),
    name: typeof oldList.name === 'string' ? oldList.name : 'Migrierte Liste',
    items: [],
    templateId: oldList.templateId || 'supermarket',
    isFavorite: !!oldList.isFavorite,
    createdAt: oldList.createdAt || now,
    modifiedAt: oldList.modifiedAt || now
  };

  // Artikel migrieren, wenn vorhanden
  if (Array.isArray(oldList.items)) {
    migratedList.items = oldList.items.map((item: any) => migrateItem(item, options));
  }

  return migratedList;
}

/**
 * Migriert einen alten Artikel in das aktuelle Format
 * @param oldItem - Der zu migrierende Artikel
 * @param options - Migrationsoptionen
 * @returns Der migrierte Artikel
 */
export function migrateItem(oldItem: any, options: MigrationOptions = {}): ShoppingItem {
  // Standardwerte für Items
  const defaultItem = {
    id: '',
    name: '',
    quantity: 1,
    category: 'Sonstiges',
    checked: false,
    price: 0,
    ...options.itemDefaults
  };
  
  // Basisstruktur erstellen
  const now = Date.now();
  const migratedItem: ShoppingItem = {
    id: oldItem.id || now.toString(),
    name: typeof oldItem.name === 'string' ? oldItem.name : 'Unbenannter Artikel',
    quantity: typeof oldItem.quantity === 'number' && oldItem.quantity > 0 ? oldItem.quantity : 1,
    category: migrateCategory(oldItem.category, options),
    checked: !!oldItem.checked,
    price: typeof oldItem.price === 'number' && oldItem.price >= 0 ? oldItem.price : 0,
    addedAt: oldItem.addedAt || now,
    modifiedAt: oldItem.modifiedAt || now
  };
  
  // Notiz hinzufügen, wenn vorhanden
  if (typeof oldItem.note === 'string' && oldItem.note.trim() !== '') {
    migratedItem.note = oldItem.note;
  }
  
  return migratedItem;
}

/**
 * Migriert eine alte Kategorie in das aktuelle Format
 * @param oldCategory - Die zu migrierende Kategorie
 * @param options - Migrationsoptionen
 * @returns Die migrierte Kategorie
 */
export function migrateCategory(oldCategory: any, options: MigrationOptions = {}): Category | string {
  // Fallback für leere Kategorie
  if (!oldCategory) {
    return 'Sonstiges';
  }
  
  // Wenn bereits im richtigen Format, zurückgeben
  if (typeof oldCategory === 'object' && oldCategory !== null && oldCategory.id && oldCategory.name) {
    return oldCategory as Category;
  }
  
  // String-Kategorien in Objekte umwandeln, wenn gewünscht
  if (options.normalizeCategories && typeof oldCategory === 'string') {
    const categoryName = oldCategory.trim() || 'Sonstiges';
    return {
      id: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: categoryName
    };
  }
  
  // Bei String-Eingabe und ohne Normalisierung direkt zurückgeben
  if (typeof oldCategory === 'string') {
    return oldCategory || 'Sonstiges';
  }
  
  // Fallback für unbekannte Formate
  return 'Sonstiges';
}

/**
 * Validiert eine Liste und korrigiert Fehler
 * @param list - Die zu validierende Liste
 * @returns Die validierte Liste
 */
export function validateList(list: ShoppingList): ShoppingList {
  const now = Date.now();
  const validatedList = { ...list };
  
  // Basis-Eigenschaften prüfen und ggf. korrigieren
  if (!validatedList.id) {
    validatedList.id = now.toString();
  }
  
  if (!validatedList.name || typeof validatedList.name !== 'string') {
    validatedList.name = 'Unbenannte Liste';
  }
  
  // Prüfen, ob items ein Array ist
  if (!Array.isArray(validatedList.items)) {
    validatedList.items = [];
  } else {
    // Alle Items validieren
    validatedList.items = validatedList.items.map(item => validateItem(item));
  }
  
  // Zeitstempel hinzufügen, falls fehlend
  if (!validatedList.createdAt) {
    validatedList.createdAt = now;
  }
  
  if (!validatedList.modifiedAt) {
    validatedList.modifiedAt = now;
  }
  
  return validatedList;
}

/**
 * Validiert einen Artikel und korrigiert Fehler
 * @param item - Der zu validierende Artikel
 * @returns Der validierte Artikel
 */
export function validateItem(item: ShoppingItem): ShoppingItem {
  const now = Date.now();
  const validatedItem = { ...item };
  
  // Basis-Eigenschaften prüfen und ggf. korrigieren
  if (!validatedItem.id) {
    validatedItem.id = now.toString();
  }
  
  if (!validatedItem.name || typeof validatedItem.name !== 'string') {
    validatedItem.name = 'Unbenannter Artikel';
  }
  
  // Numerische Eigenschaften prüfen
  if (typeof validatedItem.quantity !== 'number' || validatedItem.quantity <= 0) {
    validatedItem.quantity = 1;
  }
  
  if (typeof validatedItem.price !== 'number' || validatedItem.price < 0) {
    validatedItem.price = 0;
  }
  
  // Kategorie prüfen
  if (!validatedItem.category) {
    validatedItem.category = 'Sonstiges';
  } else if (typeof validatedItem.category === 'object' && (!validatedItem.category.id || !validatedItem.category.name)) {
    // Korrigieren ungültiger Kategorie-Objekte
    validatedItem.category = 'Sonstiges';
  }
  
  // Zeitstempel hinzufügen, falls fehlend
  if (!validatedItem.addedAt) {
    validatedItem.addedAt = now;
  }
  
  if (!validatedItem.modifiedAt) {
    validatedItem.modifiedAt = now;
  }
  
  return validatedItem;
}

/**
 * Hilfsfunktion zum Migrieren aller Listen
 * @param lists - Die zu migrierenden Listen
 * @returns Die migrierten Listen
 */
export function migrateLists(lists: any[]): ShoppingList[] {
  if (!Array.isArray(lists)) {
    return [];
  }
  
  return lists.map(list => migrateList(list, { normalizeCategories: true }));
}
