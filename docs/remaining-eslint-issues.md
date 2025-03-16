# Verbleibende ESLint-Probleme und deren Lösungen

Nach der ersten automatischen Korrektur mit `npm run lint -- --fix` und der manuellen Behebung der kritischen Parsing-Fehler verbleiben noch einige Warnungen und Fehler. Hier ist eine Anleitung zur Behebung der wichtigsten Probleme:

## 1. Komponenten-Naming-Konvention

**Problem**: Vue-Komponenten sollten mehrteilige Namen haben (z.B. nicht nur "index" oder "categories").

```
Component name "index" should always be multi-word (vue/multi-word-component-names)
Component name "categories" should always be multi-word (vue/multi-word-component-names)
```

**Lösungen**:
- Umbenennen der Komponenten in z.B. "IndexPage" und "CategoriesPage"
- ODER die Regel in `.eslintrc.json` für diese Dateien deaktivieren:
```json
"overrides": [
  {
    "files": ["pages/**/*.vue"],
    "rules": {
      "vue/multi-word-component-names": "off"
    }
  }
]
```

## 2. Kognitive Komplexität

**Problem**: Viele Funktionen haben zu hohe kognitive Komplexität (über dem Limit von 15):

```
Refactor this function to reduce its Cognitive Complexity from 35 to the 15 allowed (sonarjs/cognitive-complexity)
```

**Lösungen**:
- Komplexe Funktionen in kleinere, besser benannte Funktionen aufteilen
- ODER das Limit in der Konfiguration erhöhen (nicht empfohlen, aber möglich):
```json
"rules": {
  "sonarjs/cognitive-complexity": ["warn", 25]
}
```

## 3. Unbenutzter Code

**Problem**: Unbenutzte Variablen und Importe:

```
'nextTick' is defined but never used (@typescript-eslint/no-unused-vars)
'toggleEditMode' is assigned a value but never used (@typescript-eslint/no-unused-vars)
```

**Lösungen**:
- Unbenutzte Variablen entfernen
- Wenn die Variable für zukünftige Verwendung gedacht ist, umbenennen mit Unterstrich-Präfix: `_nextTick`

## 4. Konsolenausgaben

**Problem**: Zu viele console.log-Anweisungen:

```
Unexpected console statement (no-console)
```

**Lösungen**:
- Entfernen oder durch ein Logging-System ersetzen
- ODER Regel für Entwicklungsumgebung deaktivieren:
```json
// In .eslintrc.json
"rules": {
  "no-console": process.env.NODE_ENV === 'production' ? "error" : "warn"
}
```

## 5. `any`-Typen in TypeScript

**Problem**: Verwendung von `any`-Typen:

```
Unexpected any. Specify a different type (@typescript-eslint/no-explicit-any)
```

**Lösungen**:
- Typen spezifizieren, wo immer möglich
- Wo wirklich nötig, explizite Ausnahmen machen: `// eslint-disable-next-line @typescript-eslint/no-explicit-any`

## 6. hasOwnProperty

**Problem**: Direkter Aufruf von `hasOwnProperty`:

```
Do not access Object.prototype method 'hasOwnProperty' from target object (no-prototype-builtins)
```

**Lösungen**:
- `Object.prototype.hasOwnProperty.call(obj, prop)` verwenden
- ODER `Object.hasOwn(obj, prop)` für moderne Browser

## 7. Duplizierte Strings

**Problem**: Mehrfach verwendete Strings:

```
Define a constant instead of duplicating this literal 3 times (sonarjs/no-duplicate-string)
```

**Lösungen**:
- Konstanten für wiederholte Strings definieren
- ODER in Konfiguration deaktivieren:
```json
"rules": {
  "sonarjs/no-duplicate-string": "off"
}
```

## 8. Import-Sortierung

**Problem**: Falsche Reihenfolge von Imports:

```
There should be no empty line within import group (import/order)
```

**Lösungen**:
- imports manuell sortieren
- ODER ein Tool wie `eslint-plugin-simple-import-sort` verwenden und in einer commit hook automatisieren

## Nächste Schritte

1. Führe `npm run lint:fix` noch einmal aus, um zu sehen, ob die kritischen Fehler behoben wurden
2. Entscheide, welche verbleibenden Warnungen wichtig genug sind, um sie zu beheben
3. Aktualisiere die ESLint-Konfiguration, um nicht wichtige Warnungen zu reduzieren
4. Füge Husky Pre-Commit-Hooks hinzu, um Linting vor jedem Commit zu erzwingen
