# Validierungs-Utilities

Dieses Dokument beschreibt die Validierungs-Utilities, die für die Shopping-List-App implementiert wurden.

## Übersicht

Die Validierungs-Utilities bieten zwei Hauptfunktionalitäten:

1. **Type Guards**: Funktionen zur Laufzeit-Typüberprüfung der wichtigsten Datenstrukturen.
2. **Formularvalidierung**: Funktionen zur Validierung von Benutzereingaben in Formularen.

## Type Guards

Type Guards sind in `utils/validation/typeGuards.ts` definiert und ermöglichen die Laufzeitüberprüfung von Typen, was besonders nützlich für externe Daten wie localStorage-Einträge oder API-Responses ist.

### Verfügbare Type Guards

- `isShoppingItem(value: unknown): value is ShoppingItem`
- `isCategory(value: unknown): value is Category`
- `isShoppingList(value: unknown): value is ShoppingList`
- `isItemFormState(value: unknown): value is ItemFormState`
- `isListFormState(value: unknown): value is ListFormState`
- `isShoppingListArray(value: unknown): value is ShoppingList[]`
- `isShoppingItemArray(value: unknown): value is ShoppingItem[]`
- `isCategoryArray(value: unknown): value is Category[]`

### Verwendung von Type Guards

Type Guards können verwendet werden, um die Typsicherheit bei der Verarbeitung von Daten aus unsicheren Quellen zu verbessern.

```typescript
// Beispiel: Laden von Daten aus dem localStorage
function loadLists(): ShoppingList[] {
  try {
    const storedData = localStorage.getItem('shoppingLists');
    if (!storedData) {
      return [];
    }

    const parsedData = JSON.parse(storedData);
    
    // Type Guard anwenden
    if (isShoppingListArray(parsedData)) {
      return parsedData;
    } else {
      console.error('Ungültiges Format der gespeicherten Listen');
      return [];
    }
  } catch (error) {
    console.error('Fehler beim Laden der Listen:', error);
    return [];
  }
}
```

## Formularvalidierung

Die Formularvalidierungsfunktionen sind in `utils/validation/formValidation.ts` definiert und bieten flexible Validierungsregeln für verschiedene Datentypen.

### Validierungsregeln

```typescript
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: unknown) => boolean;
  errorMessage?: string;
}
```

### Hauptvalidierungsfunktionen

- `validateValue(value: unknown, rules: ValidationRules): string | null`
- `validateShoppingItem(item: Partial<ShoppingItem>): ValidationResult`
- `validateShoppingList(list: Partial<ShoppingList>): ValidationResult`
- `validateTextLength(text: string, minLength = 0, maxLength = Number.POSITIVE_INFINITY): ValidationResult`
- `validateNumericValue(value: number, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY): ValidationResult`
- `isValidEmail(email: string): boolean`
- `isValidPassword(password: string): boolean`

### Validierungsergebnis

```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
```

### Verwendung der Formularvalidierung

Die Validierungsfunktionen können verwendet werden, um Benutzereingaben zu validieren und Fehler anzuzeigen.

```typescript
// Beispiel: Validierung eines Artikel-Formulars
function validateForm(formData: Partial<ShoppingItem>): boolean {
  const validationResult = validateShoppingItem(formData);
  
  if (!validationResult.isValid) {
    // Fehler im Formular anzeigen
    Object.entries(validationResult.errors).forEach(([field, error]) => {
      showError(field, error);
    });
    return false;
  }
  
  return true;
}
```

### Verwendung mit Composables

```typescript
// Beispiel: Composable für ein Artikelformular mit Validierung
import { reactive, computed } from 'vue';
import { validateShoppingItem } from '~/utils/validation';
import type { ItemFormState } from '~/types';
import type { ShoppingItem } from '~/composables/types';

export function useItemForm() {
  const state = reactive<ItemFormState>({
    status: 'idle',
    item: {
      name: '',
      quantity: 1,
      category: 'Sonstiges',
      checked: false,
      price: 0
    },
    errors: {},
    touched: {},
    isValid: false
  });
  
  function validateForm(): boolean {
    const result = validateShoppingItem(state.item);
    state.errors = result.errors;
    state.isValid = result.isValid;
    return result.isValid;
  }
  
  function touchField(field: string): void {
    state.touched[field] = true;
    // Validieren, wenn das Feld berührt wurde
    validateForm();
  }
  
  function submitForm(): boolean {
    // Alle Felder als berührt markieren
    Object.keys(state.item).forEach(key => {
      state.touched[key] = true;
    });
    
    // Formular validieren
    const isValid = validateForm();
    
    if (isValid) {
      state.status = 'submitting';
      // Hier Logik zum Speichern des Artikels
      return true;
    }
    
    return false;
  }
  
  // Berechneter Wert für die Anzeige von Feldfehlern
  const shouldShowError = computed(() => {
    return (field: string) => {
      return state.touched[field] && state.errors[field];
    };
  });
  
  return {
    state,
    validateForm,
    touchField,
    submitForm,
    shouldShowError
  };
}
```

## Integration in bestehende Komponenten

### Verwendung der Type Guards in Storage-Funktionen

Die Type Guards sollten insbesondere in Funktionen integriert werden, die Daten aus externen Quellen laden:

```typescript
// Beispiel: Integration in useLocalStorage.ts
function loadFromStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return null;
    }
    
    const parsed = JSON.parse(value);
    
    // Typspezifische Validierung
    if (key === 'shoppingLists' && !isShoppingListArray(parsed)) {
      console.error('Ungültiges Format der gespeicherten Listen');
      return null;
    }
    
    return parsed as T;
  } catch (error) {
    console.error(`Fehler beim Laden aus dem localStorage (Schlüssel: ${key}):`, error);
    return null;
  }
}
```

### Verwendung der Formularvalidierung in Komponenten

```vue
<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label for="name">Name</label>
      <input
        id="name"
        v-model="form.item.name"
        type="text"
        :class="{ 'has-error': form.shouldShowError('name') }"
        @blur="form.touchField('name')"
      />
      <div v-if="form.shouldShowError('name')" class="error-message">
        {{ form.state.errors.name }}
      </div>
    </div>
    
    <div class="form-group">
      <label for="quantity">Menge</label>
      <input
        id="quantity"
        v-model.number="form.item.quantity"
        type="number"
        min="1"
        :class="{ 'has-error': form.shouldShowError('quantity') }"
        @blur="form.touchField('quantity')"
      />
      <div v-if="form.shouldShowError('quantity')" class="error-message">
        {{ form.state.errors.quantity }}
      </div>
    </div>
    
    <button type="submit" :disabled="!form.state.isValid">
      Speichern
    </button>
  </form>
</template>

<script setup lang="ts">
import { useItemForm } from '~/composables/useItemForm';

const form = useItemForm();

function submitForm() {
  if (form.submitForm()) {
    // Erfolgreiche Übermittlung, weitere Aktionen
  }
}
</script>
```

## Vorteile der Validierungs-Utilities

- **Verbesserte Typsicherheit**: Laufzeitüberprüfung von Datenstrukturen
- **Zentralisierte Validierungslogik**: Einheitliche Validierungsregeln in der gesamten App
- **Bessere Benutzererfahrung**: Konsistente Fehlerbehandlung und -anzeige
- **Wartbarkeit**: Änderungen an Validierungsregeln an einem zentralen Ort
- **Wiederverwendbarkeit**: Validierungsfunktionen können in verschiedenen Teilen der App wiederverwendet werden
