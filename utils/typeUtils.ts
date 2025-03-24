/**
 * Typ-Hilfsfunktionen für TypeScript-Typsicherheit
 */

import type { Category, ShoppingItem, ShoppingList } from '~/types/app-types';

/**
 * Typ-Hilfsprädikat um festzustellen, ob ein Wert nicht undefined oder null ist
 *
 * @param value Der zu prüfende Wert
 * @returns true wenn der Wert weder null noch undefined ist
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Typ-Hilfsprädikat zur Prüfung, ob ein Objekt eine Kategorie ist
 *
 * @param value Der zu prüfende Wert
 * @returns true wenn das Objekt eine gültige Kategorie ist
 */
export function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return typeof obj.id === 'string' && typeof obj.name === 'string';
}

/**
 * Typ-Hilfsprädikat zur Prüfung, ob ein Objekt ein Einkaufsartikel ist
 *
 * @param value Der zu prüfende Wert
 * @returns true wenn das Objekt ein gültiger Einkaufsartikel ist
 */
export function isShoppingItem(value: unknown): value is ShoppingItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.quantity === 'number' &&
    (typeof obj.category === 'string' || isCategory(obj.category)) &&
    typeof obj.checked === 'boolean'
  );
}

/**
 * Typ-Hilfsprädikat zur Prüfung, ob ein Objekt eine Einkaufsliste ist
 *
 * @param value Der zu prüfende Wert
 * @returns true wenn das Objekt eine gültige Einkaufsliste ist
 */
export function isShoppingList(value: unknown): value is ShoppingList {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.isFavorite === 'boolean' &&
    Array.isArray(obj.items)
  );
}

/**
 * Hilfsfunktion für sicheren Array-Zugriff
 *
 * @param array Das Array
 * @param index Der Index
 * @returns Der Wert am Index oder undefined
 */
export function safeArrayAccess<T>(array: T[] | undefined | null, index: number): T | undefined {
  if (!array || (!Array.isArray(array) || index < 0) || index >= array.length) {
    return undefined;
  }
  return array[index];
}

/**
 * Hilfsfunktion für sicheren Objekteigenschafts-Zugriff
 *
 * @param obj Das Objekt
 * @param key Der Schlüssel
 * @returns Der Wert der Eigenschaft oder undefined
 */
export function safeObjectAccess<T extends object, K extends keyof T>(
  obj: T | undefined | null,
  key: K
): T[K] | undefined {
  if (!obj) {
    return undefined;
  }
  return obj[key];
}
