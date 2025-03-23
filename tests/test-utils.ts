/**
 * Test-Hilfsfunktionen für die Shopping-List-App
 * Stellt Funktionen zum Erstellen von typisierten Testdaten zur Verfügung
 */

import type { 
  Category,
  ShoppingItem,
  ShoppingList,
  CategoryTemplate
} from '~/types/app-types';
import type { ItemFormState, ListFormState } from '~/types/form-types';

/**
 * Erstellt ein Mock-Category-Objekt mit Standardwerten
 * 
 * @param overrides Überschreibungen für Standardwerte
 * @returns Ein Category-Objekt
 */
export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: `category-${Date.now()}`,
    name: 'Test-Kategorie',
    color: 'bg-blue-500',
    icon: 'shopping-bag',
    position: 0,
    ...overrides,
  };
}

/**
 * Erstellt ein Mock-ShoppingItem-Objekt mit Standardwerten
 * 
 * @param overrides Überschreibungen für Standardwerte
 * @returns Ein ShoppingItem-Objekt
 */
export function createMockShoppingItem(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  const now = Date.now();
  const mockCategory = createMockCategory();
  
  return {
    id: `item-${now}`,
    name: 'Test-Artikel',
    quantity: 1,
    category: mockCategory,
    checked: false,
    price: 0,
    addedAt: now,
    modifiedAt: now,
    note: '',
    listId: `list-${now}`,
    ...overrides,
  };
}

/**
 * Erstellt ein Mock-ShoppingList-Objekt mit Standardwerten
 * 
 * @param itemCount Anzahl der Mock-Items die zur Liste hinzugefügt werden sollen
 * @param overrides Überschreibungen für Standardwerte
 * @returns Ein ShoppingList-Objekt
 */
export function createMockShoppingList(
  itemCount = 0,
  overrides: Partial<ShoppingList> = {}
): ShoppingList {
  const now = Date.now();
  const items: ShoppingItem[] = [];
  
  // Generiere die angegebene Anzahl an Mock-Items
  for (let i = 0; i < itemCount; i++) {
    items.push(createMockShoppingItem({ 
      id: `item-${now}-${i}`,
      name: `Test-Artikel ${i + 1}` 
    }));
  }
  
  return {
    id: `list-${now}`,
    name: 'Test-Einkaufsliste',
    isFavorite: false,
    items: items,
    templateId: 'default',
    createdAt: now,
    modifiedAt: now,
    ...overrides,
  };
}

/**
 * Erstellt ein Mock-CategoryTemplate-Objekt mit Standardwerten
 * 
 * @param categoryCount Anzahl der Mock-Kategorien die zum Template hinzugefügt werden sollen
 * @param overrides Überschreibungen für Standardwerte
 * @returns Ein CategoryTemplate-Objekt
 */
export function createMockCategoryTemplate(
  categoryCount = 0,
  overrides: Partial<CategoryTemplate> = {}
): CategoryTemplate {
  const categories: Category[] = [];
  
  // Generiere die angegebene Anzahl an Mock-Kategorien
  for (let i = 0; i < categoryCount; i++) {
    categories.push(createMockCategory({ 
      id: `category-template-${i}`,
      name: `Test-Kategorie ${i + 1}`,
      position: i
    }));
  }
  
  return {
    id: `template-${Date.now()}`,
    name: 'Test-Template',
    description: 'Ein Test-Template für Unit-Tests',
    categories: categories,
    defaultCategoryOrder: categories.map(cat => cat.id),
    ...overrides,
  };
}

/**
 * Erstellt ein Mock-ItemFormState-Objekt mit Standardwerten
 * 
 * @param overrides Überschreibungen für Standardwerte
 * @returns Ein ItemFormState-Objekt
 */
export function createMockItemFormState(overrides: Partial<ItemFormState> = {}): ItemFormState {
  return {
    status: 'idle',
    isValid: true,
    item: createMockShoppingItem(),
    errors: {},
    touched: {},
    ...overrides,
  };
}

/**
 * Erstellt ein Mock-ListFormState-Objekt mit Standardwerten
 * 
 * @param overrides Überschreibungen für Standardwerte
 * @returns Ein ListFormState-Objekt
 */
export function createMockListFormState(overrides: Partial<ListFormState> = {}): ListFormState {
  return {
    status: 'idle',
    isValid: true,
    list: createMockShoppingList(),
    errors: {},
    touched: {},
    ...overrides,
  };
}

/**
 * Hilfsfunktion zum sicheren Zugriff auf ein Array-Element
 * 
 * @param array Das Array
 * @param index Der Index
 * @returns Das Element am angegebenen Index oder undefined
 */
export function getSafeArrayItem<T>(array: T[] | undefined | null, index: number): T | undefined {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return undefined;
  }
  return array[index];
}

/**
 * Hilfsfunktion zum sicheren Zugriff auf eine Objekteigenschaft
 * 
 * @param obj Das Objekt
 * @param key Der Schlüssel
 * @returns Der Wert der Eigenschaft oder undefined
 */
export function getSafeProperty<T extends object, K extends keyof T>(
  obj: T | undefined | null,
  key: K
): T[K] | undefined {
  if (!obj) {
    return undefined;
  }
  return obj[key];
}

/**
 * Hilfsfunktion um zu prüfen, ob ein Wert definiert ist (nicht null oder undefined)
 * 
 * @param value Der zu prüfende Wert
 * @returns true wenn der Wert weder null noch undefined ist
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
