/**
 * Typdefinitionen für die Formularstatusverwaltung
 *
 * Diese Datei enthält Interfaces für die Formularverwaltung
 * in der Shopping-List-App.
 */

import type { ShoppingItem, ShoppingList } from './app-types';

/**
 * Allgemeiner Formularstatus
 */
export interface IFormState {
  /** Status des Formulars: 'idle' | 'editing' | 'submitting' | 'success' | 'error' */
  status: string;
  /** Gibt an, ob das Formular gültig ist */
  isValid: boolean;
  /** Fehlermeldungen nach Feldnamen */
  errors: Record<string, string>;
  /** Geänderte Felder nach Feldnamen */
  touched: Record<string, boolean>;
}

/**
 * Formularstatus für Artikel-Formulare
 */
export interface IItemFormState extends IFormState {
  /** Der Artikel, der bearbeitet wird */
  item: Partial<ShoppingItem>;
}

/**
 * Formularstatus für Listen-Formulare
 */
export interface IListFormState extends IFormState {
  /** Die Liste, die bearbeitet wird */
  list: Partial<ShoppingList>;
}
