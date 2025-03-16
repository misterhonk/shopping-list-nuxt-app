# Prettier Konfiguration

Diese Shopping-List-App verwendet Prettier zur konsistenten Code-Formatierung. Die Konfiguration sorgt für einen einheitlichen Codestil im gesamten Projekt.

## Konfigurationsdetails

Die Prettier-Konfiguration befindet sich in der Datei `.prettierrc.json` und enthält folgende Einstellungen:

- `semi: true` - Semikolons am Ende jeder Anweisung
- `singleQuote: true` - Einfache Anführungszeichen für Strings
- `tabWidth: 2` - Einrückungstiefe von 2 Leerzeichen
- `trailingComma: "es5"` - Abschließende Kommas nach ES5-Standard
- `printWidth: 100` - Maximale Zeilenlänge von 100 Zeichen
- `bracketSpacing: true` - Leerzeichen in Objektliteralen
- `arrowParens: "avoid"` - Klammern bei Arrow-Funktionen mit einem Parameter vermeiden
- `endOfLine: "lf"` - Linux-Zeilenenden (LF)
- `vueIndentScriptAndStyle: false` - Keine Einrückung für Script und Style in Vue-Dateien

## Verwendung

Um die Formatierung für das gesamte Projekt anzuwenden, führe folgenden Befehl aus:

```bash
npm run format
```

Um zu überprüfen, ob dein Code den Formatierungsregeln entspricht (ohne Änderungen vorzunehmen):

```bash
npm run format:check
```

## VS Code Integration

Für eine optimale Entwicklungserfahrung wird empfohlen, die [Prettier-Erweiterung](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) für VS Code zu installieren. Die projektspezifischen Einstellungen in `.vscode/settings.json` konfigurieren VS Code so, dass der Code automatisch beim Speichern formatiert wird.

## Ignorierte Dateien

Bestimmte Dateien und Verzeichnisse werden von der Formatierung ausgeschlossen. Diese sind in der `.prettierignore`-Datei definiert und umfassen:

- Build-Verzeichnisse (`.nuxt`, `.output`, `dist`)
- Node-Module
- Log-Dateien
- Editor-spezifische Dateien
- Lock-Dateien
- Cache-Verzeichnisse
