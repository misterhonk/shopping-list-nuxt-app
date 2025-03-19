# TypeScript-Konfiguration

Dieses Dokument beschreibt die TypeScript-Konfiguration für die Shopping List App und erklärt die verwendeten Einstellungen.

## Strenge TypeScript-Einstellungen

Wir verwenden eine strenge TypeScript-Konfiguration, um frühzeitig potenzielle Fehler zu erkennen und die Codequalität zu verbessern.

### Basis-Einstellungen

- `strict: true`: Aktiviert alle strikten Typprüfungsoptionen
- `alwaysStrict: true`: JavaScript-Code wird im "strict mode" analysiert
- `forceConsistentCasingInFileNames: true`: Stellt sicher, dass die Groß-/Kleinschreibung in Dateiimporten konsistent ist

### Typ-Sicherheit

- `noImplicitAny: true`: Fehler bei impliziten `any`-Typen
- `strictNullChecks: true`: `null` und `undefined` werden als eigene Typen behandelt
- `strictFunctionTypes: true`: Strengere Überprüfung von Funktionsparameter-Typen
- `strictBindCallApply: true`: Stellt sicher, dass die Methoden `bind`, `call` und `apply` korrekt typisiert werden
- `strictPropertyInitialization: true`: Klassenproperties müssen im Konstruktor initialisiert werden
- `noImplicitThis: true`: Fehler bei unklarem `this`-Kontext

### Ungenutzte Elemente und Fehlerbehandlung

- `noUnusedLocals: true`: Fehler bei ungenutzten lokalen Variablen
- `noUnusedParameters: true`: Fehler bei ungenutzten Funktionsparametern
- `noImplicitReturns: true`: Alle Codepfade in einer Funktion müssen einen Rückgabewert haben
- `noFallthroughCasesInSwitch: true`: Verhindert versehentliches Durchfallen in switch-Anweisungen
- `useUnknownInCatchVariables: true`: Catch-Klausel-Variablen haben den Typ `unknown` statt `any`
- `exactOptionalPropertyTypes: true`: Optionale Eigenschaften akzeptieren nicht `undefined` als Wert

## Best Practices

### Typen explizit definieren

```typescript
// SCHLECHT
const items = [];
function processItem(item) { /* ... */ }

// GUT
const items: ShoppingItem[] = [];
function processItem(item: ShoppingItem): void { /* ... */ }
```

### `any` vermeiden

```typescript
// SCHLECHT
function parseData(data: any) { /* ... */ }

// GUT
function parseData(data: unknown) {
  if (isShoppingItem(data)) {
    // ...
  }
}
```

### Type Guards verwenden

```typescript
function isShoppingItem(item: unknown): item is ShoppingItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'quantity' in item
  );
}
```

### Nullability explizit machen

```typescript
// SCHLECHT
function findItem(id: string) {
  return items.find(item => item.id === id);
}

// GUT
function findItem(id: string): ShoppingItem | undefined {
  return items.find(item => item.id === id);
}
```

## Umgang mit strengen Einstellungen

### Umgang mit `noUnusedLocals` und `noUnusedParameters`

- Variablen mit Unterstrich-Präfix benennen, um absichtlich ungenutzte Parameter zu kennzeichnen:

```typescript
function processItems(items: ShoppingItem[], _config: Config): void {
  // _config wird nicht verwendet, aber absichtlich als Parameter behalten
  items.forEach(item => {
    // ...
  });
}
```

### Umgang mit `noImplicitReturns`

```typescript
// SCHLECHT
function getStatus(item: ShoppingItem) {
  if (item.checked) {
    return 'Erledigt';
  }
  // Fehler: Nicht alle Codepfade geben einen Wert zurück
}

// GUT
function getStatus(item: ShoppingItem): string {
  if (item.checked) {
    return 'Erledigt';
  }
  return 'Offen';
}
```

### Umgang mit generischen Typen

```typescript
// GUT
function createGenericList<T>(items: T[]): T[] {
  return [...items];
}

const shoppingItems = createGenericList<ShoppingItem>([]);
```

## Integration mit ESLint

Die TypeScript-Konfiguration arbeitet zusammen mit den ESLint-Regeln, um eine konsistente Codequalität zu gewährleisten. Der ESLint-Regel `@typescript-eslint/no-unused-vars` erlaubt beispielsweise Parameter mit Unterstrich-Präfix, während die TypeScript-Konfiguration `noUnusedParameters` solche Parameter trotzdem überwacht.
