# TypeScript-Nutzungsleitfaden

Dieser Leitfaden enthält bewährte Methoden und Konventionen für die Verwendung von TypeScript in der Shopping-List-App.

## Inhaltsverzeichnis

1. [TypeScript-Konfiguration](#typescript-konfiguration)
2. [Typdefinitionen](#typdefinitionen)
3. [Vue und TypeScript](#vue-und-typescript)
4. [Best Practices](#best-practices)
5. [Testen mit TypeScript](#testen-mit-typescript)

## TypeScript-Konfiguration

Unsere TypeScript-Konfiguration ist in `tsconfig.json` definiert und verwendet strikte Einstellungen:

- `strict: true`: Aktiviert alle strengen Typprüfungen
- `strictNullChecks`: Null und undefined sind separate Typen
- `noImplicitAny`: Verhindert die implizite Verwendung von 'any'
- `exactOptionalPropertyTypes`: Strikte Prüfung für optionale Eigenschaften
- `noUncheckedIndexedAccess`: Array-Elemente könnten undefined sein
- `noPropertyAccessFromIndexSignature`: Erfordert Indexzugriff für Indexsignaturen
- `noImplicitOverride`: Erfordert explizites 'override' für überschriebene Methoden

## Typdefinitionen

Zentrale Typdefinitionen befinden sich in `types/app-types.ts`. Diese sollten für die gesamte Anwendung verwendet werden.

### Wichtige Typen und Schnittstellen:

```typescript
// Beispiel für Interface-Definition mit I-Präfix (gemäß Konvention)
interface ICategory {
  id: string;
  name: string;
  colorClass: string;
  icon: string;
  order: number;
}

// Für Typalias bitte PascalCase ohne Präfix verwenden
type ShoppingListTemplate = {
  name: string;
  categories: ICategory[];
  items: ShoppingItem[];
};
```

### Import und Export von Typen:

Typen sollten immer mit dem `type`-Schlüsselwort importiert werden:

```typescript
import type { ICategory, ShoppingItem } from '~/types/app-types';
```

## Vue und TypeScript

### Komponenten mit TypeScript:

Alle Komponenten sollten das folgende Format verwenden:

```vue
<script setup lang="ts">
import type { ICategory, ShoppingItem } from '~/types/app-types';

// Props mit TypeScript-Interface definieren
const props = withDefaults(defineProps<{
  item: ShoppingItem;
  category?: ICategory;
  disabled?: boolean;
}>(), {
  disabled: false
});

// Emits mit TypeScript-Interface definieren
const emit = defineEmits<{
  'update:item': [item: ShoppingItem];
  'delete': [id: string];
}>();

// Typisierte Refs verwenden
const isOpen = ref<boolean>(false);

// Typisierte reaktive Objekte
const state = reactive<{
  count: number;
  loading: boolean;
}>({
  count: 0,
  loading: false
});

// Rückgabetypen für Funktionen angeben
function calculateTotal(items: ShoppingItem[]): number {
  return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
}
</script>
```

## Best Practices

### 1. Vermeidung von `any`:

Verwende spezifische Typen statt `any`. Für unbekannte Daten, verwende `unknown`.

```typescript
// Nicht empfohlen
function processData(data: any): any {
  return data.value;
}

// Empfohlen
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String(data.value);
  }
  return '';
}
```

### 2. Nullish-Coalescing und Optional Chaining:

```typescript
// Empfohlen
const displayName = user?.name ?? 'Unbekannt';
```

### 3. Typsichere Ereignishandler:

```typescript
// Empfohlen
function handleInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  // ...
}
```

### 4. ReadOnly für unveränderliche Daten:

```typescript
// Empfohlen für Parameter, die nicht verändert werden sollten
function processArray(items: readonly string[]): number {
  return items.length;
}
```

### 5. Erschließung von Typen statt Wiederholung:

```typescript
// Nicht empfohlen - manuelles Definieren
interface IUserResponse {
  id: number;
  name: string;
  email: string;
}

// Empfohlen - Verwendung von Hilfsmitteln wie Pick, Omit, Partial
interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

type IUserCreatePayload = Omit<IUser, 'id'>;
type IUserUpdatePayload = Partial<IUser>;
```

## Testen mit TypeScript

Vitest ist für typisierte Tests eingerichtet. Bitte verwende die folgenden Muster:

```typescript
import { describe, it, expect } from 'vitest';
import type { ShoppingItem } from '~/types/app-types';

// Typisierte Test-Fixtures
function createTestItem(overrides?: Partial<ShoppingItem>): ShoppingItem {
  return {
    id: 'test-id',
    name: 'Test Item',
    quantity: 1,
    // ... andere erforderliche Eigenschaften
    ...overrides
  };
}

describe('ShoppingList component', () => {
  it('renders correctly with typed props', () => {
    const item = createTestItem({ name: 'Custom name' });
    // ... Test mit typisierten Daten
  });
});
```

Weitere Details zur Testeinrichtung findest du in der [Vitest-Dokumentation](https://vitest.dev/guide/).
