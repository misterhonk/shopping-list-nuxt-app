# Leitfaden zur Behebung von Null/Undefined-Checks in TypeScript

Dieses Dokument beschreibt die systematische Herangehensweise zum Beheben von Null/Undefined-Check-Fehlern in unserem TypeScript-Code.

## Grundlegende Probleme

1. **Falsche Verwendung des Nullish Coalescing Operators (`??`)**

   - Der `??` Operator sollte verwendet werden, um einen Standardwert anzugeben, wenn der linke Operand `null` oder `undefined` ist
   - Er sollte NICHT in Bedingungen mit `!` verwendet werden

2. **Fehlende Null-Checks vor Eigenschaftszugriff**
   - TypeScript warnt mit "Object is possibly 'undefined'" oder "Object is possibly 'null'", wenn Eigenschaften ohne Prüfung zugegriffen werden
   - Diese Warnungen sind wichtig, um Laufzeitfehler zu vermeiden

## Korrekturen und Lösungsansätze

### 1. Korrekte Verwendung von `??` vs. `||`

**Falsch:**

```typescript
if (!value ?? otherValue === 'test') {
  // Code
}
```

**Richtig:**

```typescript
// Für Bedingungen mit logischen ODER
if (!value || otherValue === 'test') {
  // Code
}

// Für Standardwerte bei null/undefined
const safeValue = value ?? defaultValue;
```

### 2. Sicherer Eigenschaftszugriff

**Falsch:**

```typescript
function doSomething(obj: SomeType | undefined) {
  return obj.property; // Fehler: Object is possibly 'undefined'
}
```

**Richtige Ansätze:**

a) **Early Return**:

```typescript
function doSomething(obj: SomeType | undefined) {
  if (!obj) {
    return null; // oder throw new Error, oder return defaultValue
  }
  return obj.property;
}
```

b) **Optional Chaining**:

```typescript
function doSomething(obj: SomeType | undefined) {
  return obj?.property; // Liefert undefined, wenn obj undefined ist
}
```

c) **Non-null Assertion (nur wenn sicher!)**:

```typescript
function doSomething(obj: SomeType | undefined) {
  // Nur verwenden, wenn wir 100% sicher sind, dass obj definiert ist!
  return obj!.property;
}
```

### 3. Array-Zugriffe absichern

**Falsch:**

```typescript
const item = array[index]; // Warnung mit noUncheckedIndexedAccess
item.property; // Fehler: Object is possibly 'undefined'
```

**Richtig:**

```typescript
const item = array[index];
if (item) {
  item.property; // Sicher
}

// Alternativ:
array[index]?.property; // Liefert undefined, wenn item undefined ist
```

### 4. Index-Zugriffe in Listen und Maps

**Falsch:**

```typescript
const element = lists[listIndex].items[0]; // Mehrere mögliche undefined Zugriffe
```

**Richtig:**

```typescript
// Prüfen, ob das Objekt existiert
if (
  listIndex !== undefined &&
  lists[listIndex] !== undefined &&
  Array.isArray(lists[listIndex].items) &&
  lists[listIndex].items.length > 0
) {
  const element = lists[listIndex].items[0];
}

// Oder mit Optional Chaining
const element = lists[listIndex]?.items?.[0];
```

## Systematischer Ansatz zur Codeverbesserung

1. **Identifizieren Sie Stellen mit Null/Undefined-Checks**

   - Suchen nach TypeScript-Fehlern wie "Object is possibly 'undefined'"
   - Suchen nach fehlerhafter Verwendung von `??` in Bedingungen

2. **Analysieren Sie den Kontext**

   - Bestimmen Sie, ob frühe Rückgabe, optional chaining oder nicht-null-Assertion am besten geeignet ist
   - Berücksichtigen Sie Standardwerte oder Fehlerbehandlung

3. **Verwenden Sie konsistente Muster**

   - Bevorzugen Sie Early Return wo möglich
   - Nutzen Sie Optional Chaining für kürzere Ketten
   - Vermeiden Sie nicht-null-Assertions außer bei 100% Sicherheit

4. **Hinzufügen von Guard Clauses**

   - Vor allem in Funktionen, die mit Arrays oder Maps arbeiten
   - Fügen Sie explizite Prüfungen am Anfang von Funktionen ein

5. **Aktualisieren Sie die Typdefinitionen**
   - Klarer definieren, ob Werte optional sind (`?:`) oder explizit undefined sein können (`| undefined`)
   - Bei `exactOptionalPropertyTypes: true` müssen optionale Props explizit undefined als Typ haben
