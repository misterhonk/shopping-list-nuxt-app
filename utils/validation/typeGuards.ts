/**
 * Type Guards für die Shopping-List-App
 *
 * Diese Datei enthält Funktionen zur Laufzeit-Typüberprüfung
 * der wichtigsten Datenstrukturen. Type Guards sind besonders
 * nützlich für externe Daten wie localStorage-Einträge oder API-Responses.
 */

import { createLogger } from '~/utils/logger';

import type { ShoppingItem, ShoppingList, Category } from '~/types/app-types';
import type { ItemFormState, ListFormState } from '~/types/form-types';

// Logger initialisieren
const _logger = createLogger('typeGuards');

/**
 * Prüft, ob ein Wert ein gültiges ShoppingItem ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert ein gültiges ShoppingItem ist, sonst false
 */
export function isShoppingItem(value: unknown): value is ShoppingItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  const hasRequiredProps =
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.quantity === 'number' &&
    (typeof item.category === 'string' || (item.category && typeof item.category === 'object')) &&
    typeof item.checked === 'boolean';

  if (!hasRequiredProps) {
    return false;
  }

  // Weitere Validierungen für spezifische Werte
  if (typeof item.quantity === 'number' && item.quantity <= 0) {
    _logger.warn('Invalid shopping item: quantity must be greater than 0');
    return false;
  }

  if (typeof item.name === 'string' && item.name.trim() === '') {
    _logger.warn('Invalid shopping item: name cannot be empty');
    return false;
  }

  return true;
}

/**
 * Prüft, ob ein Wert ein gültiges Category-Objekt ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert eine gültige Category ist, sonst false
 */
export function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const category = value as Record<string, unknown>;

  const hasRequiredProps = typeof category.id === 'string' && typeof category.name === 'string';

  if (!hasRequiredProps) {
    return false;
  }

  // Optionale Eigenschaften prüfen
  if (category.color !== undefined && typeof category.color !== 'string') {
    return false;
  }

  if (category.icon !== undefined && typeof category.icon !== 'string') {
    return false;
  }

  return true;
}

/**
 * Prüft, ob ein Wert eine gültige ShoppingList ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert eine gültige ShoppingList ist, sonst false
 */
export function isShoppingList(value: unknown): value is ShoppingList {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const list = value as Record<string, unknown>;

  const hasRequiredProps =
    typeof list.id === 'string' &&
    typeof list.name === 'string' &&
    Array.isArray(list.items) &&
    typeof list.isFavorite === 'boolean';

  if (!hasRequiredProps) {
    return false;
  }

  // Prüfe, ob alle Items in der Liste gültige ShoppingItems sind
  const items = list.items as unknown[];
  if (!items.every(item => isShoppingItem(item))) {
    _logger.warn('Invalid shopping list: contains invalid items');
    return false;
  }

  // Optionale Eigenschaften prüfen
  if (list.templateId !== undefined && typeof list.templateId !== 'string') {
    return false;
  }

  if (list.createdAt !== undefined && typeof list.createdAt !== 'number') {
    return false;
  }

  if (list.modifiedAt !== undefined && typeof list.modifiedAt !== 'number') {
    return false;
  }

  return true;
}

/**
 * Prüft, ob ein Wert ein gültiges ItemFormState ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert ein gültiges ItemFormState ist, sonst false
 */
export function isItemFormState(value: unknown): value is ItemFormState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const formState = value as Record<string, unknown>;

  // Erforderliche Eigenschaften prüfen
  return (
    typeof formState.status === 'string' &&
    formState.item !== undefined &&
    typeof formState.item === 'object' &&
    formState.errors !== undefined &&
    typeof formState.errors === 'object' &&
    formState.touched !== undefined &&
    typeof formState.touched === 'object' &&
    typeof formState.isValid === 'boolean'
  );
}

/**
 * Prüft, ob ein Wert ein gültiges ListFormState ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert ein gültiges ListFormState ist, sonst false
 */
export function isListFormState(value: unknown): value is ListFormState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const formState = value as Record<string, unknown>;

  // Erforderliche Eigenschaften prüfen
  return (
    typeof formState.status === 'string' &&
    formState.list !== undefined &&
    typeof formState.list === 'object' &&
    formState.errors !== undefined &&
    typeof formState.errors === 'object' &&
    formState.touched !== undefined &&
    typeof formState.touched === 'object' &&
    typeof formState.isValid === 'boolean'
  );
}

/**
 * Prüft, ob ein Wert ein gültiges Array von ShoppingLists ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert ein gültiges Array von ShoppingLists ist, sonst false
 */
export function isShoppingListArray(value: unknown): value is ShoppingList[] {
  return Array.isArray(value) && value.every(item => isShoppingList(item));
}

/**
 * Prüft, ob ein Wert ein gültiges Array von ShoppingItems ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert ein gültiges Array von ShoppingItems ist, sonst false
 */
export function isShoppingItemArray(value: unknown): value is ShoppingItem[] {
  return Array.isArray(value) && value.every(item => isShoppingItem(item));
}

/**
 * Prüft, ob ein Wert ein gültiges Array von Categories ist
 * @param value - Der zu prüfende Wert
 * @returns True, wenn der Wert ein gültiges Array von Categories ist, sonst false
 */
export function isCategoryArray(value: unknown): value is Category[] {
  return Array.isArray(value) && value.every(item => isCategory(item));
}
