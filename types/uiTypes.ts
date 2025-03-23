/**
 * UI-Typen für die Shopping-List-App
 *
 * Diese Datei enthält spezifische Typdefinitionen für UI-Elemente und -Zustände,
 * die in der Benutzeroberfläche der App verwendet werden.
 */

import type { ShoppingItem, Category, ShoppingList } from '~/types/app-types';

/**
 * Status für Formular-Zustände
 */
export type FormStatus = 'idle' | 'editing' | 'submitting' | 'error' | 'success';

/**
 * Allgemeiner Typ für UI-Fehler
 */
export interface UIError {
  code: string;
  message: string;
  field?: string;
}

/**
 * Interface für den Zustand des Artikel-Formulars
 */
export interface ItemFormState {
  /** Aktueller Status des Formulars */
  status: FormStatus;
  /** Das Artikel-Objekt, das bearbeitet wird */
  item: Partial<ShoppingItem>;
  /** Fehler, die bei der Validierung aufgetreten sind (Feld -> Fehlermeldung) */
  errors: Record<string, string>;
  /** Felder, die bereits bearbeitet wurden (für Validierungszwecke) */
  touched: Record<string, boolean>;
  /** Ob das Formular gültige Daten enthält */
  isValid: boolean;
}

/**
 * Interface für den Zustand des Listen-Formulars
 */
export interface ListFormState {
  /** Aktueller Status des Formulars */
  status: FormStatus;
  /** Die Listen-Daten, die bearbeitet werden */
  list: Partial<ShoppingList>;
  /** Fehler, die bei der Validierung aufgetreten sind (Feld -> Fehlermeldung) */
  errors: Record<string, string>;
  /** Felder, die bereits bearbeitet wurden (für Validierungszwecke) */
  touched: Record<string, boolean>;
  /** Ob das Formular gültige Daten enthält */
  isValid: boolean;
}

/**
 * Interface für Filter-Optionen
 */
export interface ListFilterOptions {
  /** Ob erledigte Artikel angezeigt werden sollen */
  showChecked: boolean;
  /** Nach welcher Kategorie gefiltert werden soll (null = alle) */
  categoryFilter: string | null;
  /** Suchbegriff für die Filterung von Artikeln */
  searchQuery: string;
  /** Sortierreihenfolge für Artikel */
  sortOrder: SortOrder;
}

/**
 * Sortieroptionen für Listen und Artikel
 */
export type SortOrder = 'name' | 'category' | 'price' | 'added' | 'custom';

/**
 * Interface für UI-Einstellungen
 */
export interface UISettings {
  /** Dunkelmodus-Einstellung */
  darkMode: 'light' | 'dark' | 'system';
  /** Schriftgröße für die UI */
  fontSize: 'small' | 'medium' | 'large';
  /** Häufigkeit für Autosave in Millisekunden (0 = deaktiviert) */
  autoSaveInterval: number;
  /** Ob Animationen aktiviert sind */
  animationsEnabled: boolean;
  /** Ob Preisberechnungen angezeigt werden sollen */
  showPrices: boolean;
  /** Ob Kategorien in Listen angezeigt werden sollen */
  showCategories: boolean;
}

/**
 * Interface für die Komponente zur Anzeige des Artikelstatus
 */
export interface ItemStatusDisplay {
  /** Der anzuzeigende Artikel */
  item: ShoppingItem;
  /** Ob der Artikel aktuell bearbeitet wird */
  isEditing: boolean;
  /** Ob der Artikel ausgewählt ist (z.B. für Mehrfachselektion) */
  isSelected: boolean;
  /** Ob Details zum Artikel angezeigt werden sollen */
  showDetails: boolean;
}

/**
 * Interface für die Komponente zur Anzeige des Listenstatus
 */
export interface ListStatusDisplay {
  /** Die anzuzeigende Liste */
  list: ShoppingList;
  /** Ob die Liste aktuell bearbeitet wird */
  isEditing: boolean;
  /** Fortschritt der Liste (0-100%) */
  progress: number;
  /** Ob die Liste aktuell ausgewählt ist */
  isSelected: boolean;
  /** Ob Details zur Liste angezeigt werden sollen */
  showDetails: boolean;
}

/**
 * Interface für Toast-Benachrichtigungen
 */
export interface ToastNotification {
  /** Eindeutige ID der Benachrichtigung */
  id: string;
  /** Typ der Benachrichtigung */
  type: 'info' | 'success' | 'warning' | 'error';
  /** Titel der Benachrichtigung */
  title: string;
  /** Inhalt der Benachrichtigung */
  message: string;
  /** Wie lange die Benachrichtigung angezeigt werden soll (ms) */
  duration: number;
  /** Zeitstempel, wann die Benachrichtigung erstellt wurde */
  timestamp: number;
  /** Ob die Benachrichtigung vom Benutzer geschlossen werden kann */
  dismissible: boolean;
}

/**
 * Interface für Dialog-Optionen
 */
export interface DialogOptions {
  /** Titel des Dialogs */
  title: string;
  /** Nachricht/Inhalt des Dialogs */
  message: string;
  /** Typ des Dialogs */
  type: 'info' | 'confirm' | 'warning' | 'error' | 'input';
  /** Text für den primären Button */
  confirmButtonText: string;
  /** Text für den Abbruch-Button (optional) */
  cancelButtonText?: string;
  /** Ob der Dialog abgebrochen werden kann */
  cancelable: boolean;
  /** Defaultwert für Input-Dialoge */
  defaultValue?: string;
  /** Platzhaltertext für Input-Dialoge */
  placeholder?: string;
}

/**
 * Interface für den Drag-and-Drop-Status
 */
export interface DragDropState {
  /** Ob aktuell ein Drag-Vorgang stattfindet */
  isDragging: boolean;
  /** Typ des gezogenen Elements */
  dragType: 'item' | 'list' | 'category' | null;
  /** ID des gezogenen Elements */
  draggedId: string | null;
  /** Quellliste des gezogenen Elements */
  sourceListId: string | null;
  /** Zielliste des gezogenen Elements */
  targetListId: string | null;
}

/**
 * Interface für den Such-Status
 */
export interface SearchState {
  /** Aktueller Suchbegriff */
  query: string;
  /** Ob eine Suche aktiv ist */
  isSearching: boolean;
  /** Ob die Suche Ergebnisse hat */
  hasResults: boolean;
  /** Anzahl der Suchergebnisse */
  resultCount: number;
  /** Anordnung der Suchergebnisse */
  layout: 'list' | 'grid';
}

/**
 * Interface für die dynamischen Eigenschaften einer Kategorieanzeige
 */
export interface CategoryDisplayProps {
  /** Die anzuzeigende Kategorie */
  category: Category;
  /** Ob die Kategorie aktuell ausgewählt ist */
  isSelected: boolean;
  /** Ob die Kategorie editierbar ist */
  isEditable: boolean;
  /** Anzahl der Artikel in dieser Kategorie */
  itemCount: number;
  /** Icon für die Kategorie (falls vorhanden) */
  icon?: string;
  /** Hintergrundfarbe für die Kategorie */
  backgroundColor?: string;
  /** Textfarbe für die Kategorie */
  textColor?: string;
}
