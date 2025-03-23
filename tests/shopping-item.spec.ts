/**
 * Unit-Tests für ShoppingItem-bezogene Funktionalitäten
 */

import { describe, it, expect } from 'vitest';

import { validateShoppingItem } from '~/utils/validation/formValidation';
import { isShoppingItem } from '~/utils/validation/typeGuards';

import { createMockShoppingItem } from './test-utils';

import type { ShoppingItem } from '~/types/app-types';

describe('ShoppingItem Validierung', () => {
  it('sollte ein gültiges ShoppingItem validieren', () => {
    // Einen gültigen Artikel mit den Test-Utilities erstellen
    const validItem = createMockShoppingItem({
      name: 'Test-Artikel',
      quantity: 2,
    });

    // Testen, ob der TypeGuard das Objekt als gültiges ShoppingItem erkennt
    expect(isShoppingItem(validItem)).toBe(true);

    // Testen, ob die Validierung keine Fehler zurückgibt
    const validation = validateShoppingItem(validItem);
    expect(validation.isValid).toBe(true);
    expect(Object.keys(validation.errors).length).toBe(0);
  });

  it('sollte ein ungültiges ShoppingItem-Objekt erkennen', () => {
    // Ein ungültiges ShoppingItem mit fehlenden Pflichtfeldern erstellen
    const invalidItem: Partial<ShoppingItem> = {
      id: 'test-id',
      name: '', // Leerer Name ist ungültig
      quantity: 0, // Menge 0 ist ungültig
      checked: false,
    };

    // Testen, ob die Validierung die Fehler korrekt erkennt
    const validation = validateShoppingItem(invalidItem);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.name).toBeDefined();
    expect(validation.errors.quantity).toBeDefined();
    expect(validation.errors.category).toBeDefined(); // Kategorie fehlt
  });

  it('sollte optionale Felder korrekt behandeln', () => {
    // Einen gültigen Artikel mit optionalen Feldern erstellen
    const item = createMockShoppingItem({
      price: 2.99,
      note: 'Testnotiz',
    });

    // Testen, ob die optionalen Felder korrekt gesetzt wurden
    expect(item.price).toBe(2.99);
    expect(item.note).toBe('Testnotiz');

    // Testen, ob die Validierung das Objekt als gültig erkennt
    const validation = validateShoppingItem(item);
    expect(validation.isValid).toBe(true);
  });

  it('sollte die Kategorie als String oder Objekt akzeptieren', () => {
    // Einen Artikel mit Kategorie als String erstellen
    const itemWithStringCategory = createMockShoppingItem({
      category: 'category-123',
    });

    // Testen, ob der TypeGuard den Artikel mit String-Kategorie akzeptiert
    expect(isShoppingItem(itemWithStringCategory)).toBe(true);

    // Einen Artikel mit Kategorie als Objekt erstellen
    const itemWithObjectCategory = createMockShoppingItem({
      category: {
        id: 'category-123',
        name: 'Test-Kategorie',
      },
    });

    // Testen, ob der TypeGuard den Artikel mit Objekt-Kategorie akzeptiert
    expect(isShoppingItem(itemWithObjectCategory)).toBe(true);
  });
});
