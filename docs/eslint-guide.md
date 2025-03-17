# ESLint Konfiguration

Diese Einkaufslisten-App verwendet ESLint zur statischen Codeanalyse und zur Sicherstellung von Codequalität. Diese Dokumentation erklärt die Konfiguration und Verwendung.

## Verwendete Plugins

Die ESLint-Konfiguration verwendet folgende Plugins und Erweiterungen:

- **@nuxtjs/eslint-config-typescript**: Nuxt.js-spezifische Regeln mit TypeScript-Unterstützung
- **eslint-plugin-vue**: Vue 3-spezifische Regeln
- **@typescript-eslint**: TypeScript-spezifische Regeln
- **eslint-plugin-import**: Regeln für konsistente Import-Anweisungen
- **eslint-plugin-promise**: Best Practices für Promise-Handling
- **eslint-plugin-sonarjs**: Codequalitätsregeln basierend auf SonarJS
- **eslint-plugin-prettier**: Integration mit Prettier

## Verwendung

### Linting ausführen

Um ESLint auf dem gesamten Projekt auszuführen:

```bash
npm run lint
```

### Automatische Korrekturen

Um ESLint mit automatischen Korrekturen auszuführen:

```bash
npm run lint:fix
```

### Integration mit VS Code

Mit der VS Code ESLint-Erweiterung siehst du ESLint-Fehler direkt im Editor. Die Projektkonfiguration ist so eingestellt, dass ESLint-Probleme beim Speichern automatisch behoben werden.

Erforderliche VS Code-Erweiterungen:

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)

## Wichtige Regeln

### JavaScript/TypeScript

- **no-console**: Erlaubt nur `console.warn`, `console.error` und `console.info`
- **curly**: Erfordert geschweifte Klammern für alle Kontrollstrukturen
- **eqeqeq**: Erfordert `===` statt `==`
- **require-await**: Warnt vor async-Funktionen ohne await
- **prefer-const**: Bevorzugt const vor let, wenn möglich

### Vue

- **vue/component-name-in-template-casing**: PascalCase für Komponenten im Template
- **vue/multi-word-component-names**: Deaktiviert für normale Dateien, aktiviert für Komponenten und Pages
- **vue/component-tags-order**: Festgelegte Reihenfolge: template, script, style

### Import

- **import/order**: Gruppierung und Sortierung von Imports

### TypeScript

- **@typescript-eslint/no-explicit-any**: Warnt bei Verwendung von `any`
- **@typescript-eslint/no-unused-vars**: Erlaubt ungenutzte Variablen, die mit Unterstrich beginnen

## Anpassung der Regeln

Wenn du die ESLint-Regeln anpassen möchtest, kannst du dies in der `.eslintrc.json`-Datei tun. Regeln können die folgenden Werte haben:

- `"off"` oder `0`: Regel deaktivieren
- `"warn"` oder `1`: Regel aktivieren als Warnung
- `"error"` oder `2`: Regel aktivieren als Fehler

## Ignorieren von Dateien

Die `.eslintignore`-Datei legt fest, welche Dateien und Verzeichnisse von ESLint ignoriert werden sollen.

## Deaktivierung von ESLint für bestimmte Zeilen

In Ausnahmefällen kannst du ESLint für bestimmte Zeilen deaktivieren:

```javascript
// eslint-disable-next-line
const foo = 'bar';

/* eslint-disable */
// Code ohne ESLint-Prüfung
/* eslint-enable */
```

**Wichtig**: Verwende diese Ausnahmen sparsam und nur mit gutem Grund!
