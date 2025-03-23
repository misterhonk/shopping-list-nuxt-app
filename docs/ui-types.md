# UI-Typen Dokumentation

Diese Dokumentation beschreibt die UI-Typen und Interfaces, die für die Shopping-List-App definiert wurden.

## Übersicht

Die UI-Typen werden in der Datei `types/uiTypes.ts` definiert und bieten typensichere Strukturen für verschiedene UI-Komponenten und -Zustände. Diese Typen verbessern die Entwicklungserfahrung durch:

- Klare Definition von Formular-Zuständen
- Typensicherheit bei der Übergabe von Props zwischen Komponenten
- Bessere IntelliSense-Unterstützung in der IDE
- Selbstdokumentierende Codestrukturen für UI-Zustände

## Formular-Zustände

### FormStatus

```typescript
export type FormStatus = 'idle' | 'editing' | 'submitting' | 'error' | 'success';
```

Repräsentiert den aktuellen Zustand eines Formulars und ermöglicht die Anzeige entsprechender UI-Elemente (z.B. Ladespinner, Erfolgsmeldungen).

### ItemFormState

```typescript
export interface ItemFormState {
  status: FormStatus;
  item: Partial<ShoppingItem>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
}
```

Enthält den vollständigen Zustand eines Artikelformulars, einschließlich Validierungsinformationen und bearbeitetem Item.

### ListFormState

```typescript
export interface ListFormState {
  status: FormStatus;
  list: Partial<ShoppingList>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
}
```

Ähnlich wie `ItemFormState`, aber für Listendaten.

## Filter-Optionen

### ListFilterOptions

```typescript
export interface ListFilterOptions {
  showChecked: boolean;
  categoryFilter: string | null;
  searchQuery: string;
  sortOrder: SortOrder;
}
```

Definiert alle Filteroptionen für die Anzeige von Artikeln in einer Liste.

### SortOrder

```typescript
export type SortOrder = 'name' | 'category' | 'price' | 'added' | 'custom';
```

Die verschiedenen Sortieroptionen für Listen und Artikel.

## UI-Komponenten-Props

### ItemStatusDisplay

```typescript
export interface ItemStatusDisplay {
  item: ShoppingItem;
  isEditing: boolean;
  isSelected: boolean;
  showDetails: boolean;
}
```

Properties für die Anzeige eines einzelnen Artikels in verschiedenen Zuständen.

### ListStatusDisplay

```typescript
export interface ListStatusDisplay {
  list: ShoppingList;
  isEditing: boolean;
  progress: number;
  isSelected: boolean;
  showDetails: boolean;
}
```

Properties für die Anzeige einer Liste mit zusätzlichen UI-relevanten Informationen.

### CategoryDisplayProps

```typescript
export interface CategoryDisplayProps {
  category: Category;
  isSelected: boolean;
  isEditable: boolean;
  itemCount: number;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
}
```

Properties für die visuelle Darstellung von Kategorien.

## Benachrichtigungen und Dialoge

### ToastNotification

```typescript
export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration: number;
  timestamp: number;
  dismissible: boolean;
}
```

Struktur für Toast-Benachrichtigungen, die dem Benutzer angezeigt werden.

### DialogOptions

```typescript
export interface DialogOptions {
  title: string;
  message: string;
  type: 'info' | 'confirm' | 'warning' | 'error' | 'input';
  confirmButtonText: string;
  cancelButtonText?: string;
  cancelable: boolean;
  defaultValue?: string;
  placeholder?: string;
}
```

Konfiguration für modalen Dialoge mit verschiedenen Typen und Optionen.

## Weitere UI-Zustände

### UISettings

```typescript
export interface UISettings {
  darkMode: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  autoSaveInterval: number;
  animationsEnabled: boolean;
  showPrices: boolean;
  showCategories: boolean;
}
```

Benutzereinstellungen für die UI-Darstellung.

### DragDropState

```typescript
export interface DragDropState {
  isDragging: boolean;
  dragType: 'item' | 'list' | 'category' | null;
  draggedId: string | null;
  sourceListId: string | null;
  targetListId: string | null;
}
```

Zustand für Drag-and-Drop-Operationen in der App.

### SearchState

```typescript
export interface SearchState {
  query: string;
  isSearching: boolean;
  hasResults: boolean;
  resultCount: number;
  layout: 'list' | 'grid';
}
```

Zustand für die Suche und die Anzeige von Suchergebnissen.

## Verwendung

### Import der Typen

Alle UI-Typen können entweder direkt aus der `uiTypes.ts`-Datei oder über die zentrale `index.ts` importiert werden:

```typescript
// Option 1: Direkter Import
import type { ItemFormState, ListFilterOptions } from '~/types/uiTypes';

// Option 2: Import über die zentrale Typen-Datei (empfohlen)
import type { ItemFormState, ListFilterOptions } from '~/types';
```

### Beispiel: Verwendung in einer Komponente

```typescript
<script setup lang="ts">
import { ref } from 'vue';
import type { ItemFormState } from '~/types';

// Initialisierung eines formularzustands
const formState = ref<ItemFormState>({
  status: 'idle',
  item: {
    name: '',
    quantity: 1,
    category: 'Sonstiges',
  },
  errors: {},
  touched: {},
  isValid: false,
});

// Funktion für die Formularvalidierung
function validateForm(): boolean {
  formState.value.errors = {};
  let isValid = true;

  if (!formState.value.item.name) {
    formState.value.errors.name = 'Name ist erforderlich';
    isValid = false;
  }

  if (!formState.value.item.quantity || formState.value.item.quantity < 1) {
    formState.value.errors.quantity = 'Menge muss mindestens 1 sein';
    isValid = false;
  }

  formState.value.isValid = isValid;
  return isValid;
}
</script>
```

### Beispiel: Verwendung mit Composables

```typescript
// composables/useItemForm.ts
import { reactive, computed } from 'vue';
import type { ItemFormState } from '~/types';

export function useItemForm() {
  const state = reactive<ItemFormState>({
    status: 'idle',
    item: {
      name: '',
      quantity: 1,
      category: 'Sonstiges',
    },
    errors: {},
    touched: {},
    isValid: false,
  });

  // Rest des Composables...

  return {
    state,
    // Weitere Rückgabewerte...
  };
}
```
