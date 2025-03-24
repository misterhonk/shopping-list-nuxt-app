/**
 * Formular-Validierungsfunktionen für die Shopping-List-App
 *
 * Diese Datei enthält Funktionen zur Validierung von Benutzereingaben
 * in Formularen und anderen Eingabefeldern.
 */

import { createLogger } from '~/utils/logger';

import type { ShoppingItem, ShoppingList } from '~/types/app-types';

// Logger initialisieren
const _logger = createLogger('formValidation');

/**
 * Interface für Validierungsergebnisse
 */
export interface IValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Interface für Validierungsregeln
 */
export interface IValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: unknown) => boolean;
  errorMessage?: string;
}

/**
 * Validiert einen einzelnen Wert anhand der angegebenen Regeln
 * @param value - Der zu validierende Wert
 * @param rules - Die anzuwendenden Validierungsregeln
 * @returns Ein Fehlerstring oder null, wenn keine Fehler aufgetreten sind
 */
export function validateValue(value: unknown, rules: IValidationRules): string | null {
  // Erforderlich-Prüfung
  if (rules.required && (value === undefined || value === null || value === '')) {
    return rules.errorMessage ?? 'Dieses Feld ist erforderlich';
  }

  // Wenn der Wert nicht erforderlich ist und leer ist, überspringen wir die weiteren Prüfungen
  if ((value === undefined || value === null || value === '') && !rules.required) {
    return null;
  }

  // String-basierte Validierungen
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return rules.errorMessage ?? `Mindestens ${rules.minLength} Zeichen erforderlich`;
    }

    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return rules.errorMessage ?? `Maximal ${rules.maxLength} Zeichen erlaubt`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.errorMessage ?? 'Ungültiges Format';
    }
  }

  // Zahlen-basierte Validierungen
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return rules.errorMessage ?? `Muss mindestens ${rules.min} sein`;
    }

    if (rules.max !== undefined && value > rules.max) {
      return rules.errorMessage ?? `Darf höchstens ${rules.max} sein`;
    }
  }

  // Benutzerdefinierte Validierung
  if (rules.customValidator && !rules.customValidator(value)) {
    return rules.errorMessage ?? 'Ungültiger Wert';
  }

  return null;
}

/**
 * Validiert ein Artikel-Objekt
 * @param item - Das zu validierende Artikel-Objekt
 * @returns Das Validierungsergebnis
 */
export function validateShoppingItem(item: Partial<ShoppingItem>): IValidationResult {
  const errors: Record<string, string> = {};

  // Name validieren
  const nameError = validateValue(item.name, {
    required: true,
    minLength: 2,
    maxLength: 100,
    errorMessage: 'Der Name muss zwischen 2 und 100 Zeichen lang sein',
  });

  if (nameError) {
    errors.name = nameError;
  }

  // Menge validieren
  const quantityError = validateValue(item.quantity, {
    required: true,
    min: 1,
    max: 9999,
    errorMessage: 'Die Menge muss zwischen 1 und 9999 liegen',
  });

  if (quantityError) {
    errors.quantity = quantityError;
  }

  // Kategorie validieren
  if (!item.category) {
    errors.category = 'Eine Kategorie muss ausgewählt werden';
  }

  // Preis validieren (optional)
  if (item.price !== undefined) {
    const priceError = validateValue(item.price, {
      min: 0,
      errorMessage: 'Der Preis darf nicht negativ sein',
    });

    if (priceError) {
      errors.price = priceError;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validiert ein Listen-Objekt
 * @param list - Das zu validierende Listen-Objekt
 * @returns Das Validierungsergebnis
 */
export function validateShoppingList(list: Partial<ShoppingList>): IValidationResult {
  const errors: Record<string, string> = {};

  // Name validieren
  const nameError = validateValue(list.name, {
    required: true,
    minLength: 2,
    maxLength: 100,
    errorMessage: 'Der Listenname muss zwischen 2 und 100 Zeichen lang sein',
  });

  if (nameError) {
    errors.name = nameError;
  }

  // Artikel validieren (wenn vorhanden)
  if (list.items && Array.isArray(list.items)) {
    for(let i = 0; i < list.items.length; i++) {
      const itemValidation = validateShoppingItem(list.items[i] || {});

      if (!itemValidation.isValid) {
        errors[`items[${i}]`] = 'Ungültiger Artikel';
        _logger.warn(`Invalid item at index ${i}:`, itemValidation.errors);
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validiert eine Textlänge
 * @param text - Der zu validierende Text
 * @param minLength - Die Mindestlänge
 * @param maxLength - Die Maximallänge
 * @returns Das Validierungsergebnis
 */
export function validateTextLength(
  text: string,
  minLength = 0,
  maxLength = Number.POSITIVE_INFINITY
): IValidationResult {
  const errors: Record<string, string> = {};

  if (text.length < minLength) {
    errors.text = `Text muss mindestens ${minLength} Zeichen enthalten`;
  } else if (text.length > maxLength) {
    errors.text = `Text darf höchstens ${maxLength} Zeichen enthalten`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validiert einen numerischen Wert
 * @param value - Der zu validierende Wert
 * @param min - Der Mindestwert
 * @param max - Der Maximalwert
 * @returns Das Validierungsergebnis
 */
export function validateNumericValue(
  value: number,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY
): IValidationResult {
  const errors: Record<string, string> = {};

  if (isNaN(value)) {
    errors.value = 'Wert muss eine Zahl sein';
  } else if (value < min) {
    errors.value = `Wert muss mindestens ${min} sein`;
  } else if (value > max) {
    errors.value = `Wert darf höchstens ${max} sein`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Prüft, ob eine E-Mail-Adresse gültig ist
 * @param email - Die zu validierende E-Mail-Adresse
 * @returns True, wenn die E-Mail-Adresse gültig ist, sonst false
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Prüft, ob ein Passwort den Anforderungen entspricht
 * Anforderungen: Mindestens 8 Zeichen, mindestens ein Buchstabe und eine Zahl
 * @param password - Das zu validierende Passwort
 * @returns True, wenn das Passwort gültig ist, sonst false
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}
