# ESLint-TypeScript-Konfiguration

Dieses Dokument beschreibt die erweiterten ESLint-Regeln für TypeScript und deren Verwendung im Projekt.

## Übersicht

Die ESLint-Konfiguration wurde aktualisiert, um eine stärkere Typsicherheit durch verbesserte TypeScript-Regeln zu erreichen. Die Änderungen zielen darauf ab, die Codequalität zu verbessern und potenzielle Typfehler frühzeitig zu erkennen.

## Neue TypeScript-Regeln

### 1. Funktionsrückgabetypen

```typescript
// @typescript-eslint/explicit-function-return-type: warn
function getUserName() {
  // Warnung: Funktionsrückgabetyp fehlt
  return 'John';
}

// Korrekt
function getUserName(): string {
  return 'John';
}
```

Diese Regel kann in bestimmten Situationen deaktiviert werden, wenn der Typ selbsterklärend ist:

- Bei Ausdrücken wie Arrow-Functions in Callbacks
- Bei Higher-Order-Functions
- Bei typisierten Funktionsausdrücken
- Bei direkten const-Assertions in Arrow-Functions

### 2. Typsichere Importe

```typescript
// @typescript-eslint/consistent-type-imports: error
// Falsch
import { User } from './types';

// Korrekt
import type { User } from './types';
```

### 3. Optionale Verkettung

```typescript
// @typescript-eslint/prefer-optional-chain: error
// Falsch
const name = user && user.profile && user.profile.name;

// Korrekt
const name = user?.profile?.name;
```

### 4. Nullish Coalescing

```typescript
// @typescript-eslint/prefer-nullish-coalescing: warn
// Nicht optimal (gibt Fallback bei '' und 0 zurück)
const count = value || defaultValue;

// Besser (gibt Fallback nur bei null/undefined zurück)
const count = value ?? defaultValue;
```

### 5. Array Typen

```typescript
// @typescript-eslint/array-type: error
// Falsch
const names: Array<string> = ['John', 'Jane'];

// Korrekt
const names: string[] = ['John', 'Jane'];
```

### 6. Keine unnötigen Typ-Assertions

```typescript
// @typescript-eslint/no-unnecessary-type-assertion: warn
// Unnötig
const length = (name as string).length;

// Besser, wenn name bereits als string typisiert ist
const length = name.length;
```

### 7. Keine unnötigen Bedingungsprüfungen

```typescript
// @typescript-eslint/no-unnecessary-condition: warn
// Unnötig, wenn count bereits als number typisiert ist
if (count !== undefined && count !== null) { ... }

// Besser
if (count > 0) { ... }
```

## Import-Regeln

Es wurde eine neue Import-Regel hinzugefügt, um relative Imports zu übergeordneten Verzeichnissen zu vermeiden:

```typescript
// import/no-relative-parent-imports: warn

// Vermeiden (Warnung)
import { something } from '../parentDir/module';

// Verwenden
import { something } from '@/parentDir/module';
```

## Empfohlene Vorgehensweise

Wenn ESLint Warnungen oder Fehler meldet, sollten diese wie folgt behandelt werden:

1. **Explizite Funktionsrückgabetypen**: Fügen Sie Rückgabetypen zu allen Funktionen hinzu, sofern sie nicht durch die Ausnahmen abgedeckt sind.
2. **Typisierte Importe**: Verwenden Sie `import type` für alle Typimporte.
3. **Optionale Verkettung**: Ersetzen Sie Ausdrücke wie `a && a.b` durch `a?.b`.
4. **Nullish Coalescing**: Verwenden Sie `??` statt `||` für Standardwerte, wenn nur bei `null` oder `undefined` ein Fallback verwendet werden soll.

## Ausnahmen und Spezialisierungen

Die Regeln wurden so konfiguriert, dass sie für die folgenden Fälle ausgenommen oder angepasst sind:

- JavaScript-Dateien haben andere Regeln als TypeScript-Dateien
- Debugging-Dateien (mit Prefix `debug-`) haben Ausnahmen für `console.log`
- Vue-Komponenten und Nuxt-Seiten haben unterschiedliche Namenskonventionsregeln
