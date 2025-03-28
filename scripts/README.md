# Scripts-Verzeichnis

Dieses Verzeichnis enthält Hilfsskripte für die Entwicklung, Wartung und Deployment der Shopping-List-App.

## Richtlinien für Skripte

1. **Einheitliches Format**: Jedes Skript sollte ein einheitliches Format haben und klar dokumentiert sein.
2. **Sprechende Namen**: Verwende sprechende Namen für Skripte (z.B. `update-version.mjs` statt `update.mjs`).
3. **Dokumentation**: Jedes Skript sollte einen Header-Kommentar haben, der seinen Zweck beschreibt.
4. **Module-Format**: Verwende ES-Module (.mjs) für neue Skripte.
5. **Fehlerbehandlung**: Implementiere eine angemessene Fehlerbehandlung in jedem Skript.
6. **Logging**: Verwende einheitliches Logging, das sowohl informative als auch fehlerhafte Zustände anzeigt.

## Kategorien von Skripten

Organisiere Skripte in Unterverzeichnissen nach ihrer Funktion:

- **dev**: Entwicklungshilfen (z.B. Typkonvertierung, Codegenerierung)
- **build**: Build- und Deployment-Skripte
- **maintenance**: Wartungsskripte (z.B. Datenmigrationen)
- **quality**: Codequalitäts-Skripte (z.B. Linting, Formatierung)

## Beispiel-Header für Skripte

```javascript
/**
 * update-version.mjs - Aktualisiert die Versionsnummern in der App
 * 
 * Dieses Skript aktualisiert die Versionsnummern in package.json und
 * updateService.ts basierend auf den übergebenen Parametern.
 * 
 * Verwendung:
 * node scripts/build/update-version.mjs --major|--minor|--patch
 * 
 * Optionen:
 * --major: Erhöht die Hauptversionsnummer (z.B. 1.0.0 -> 2.0.0)
 * --minor: Erhöht die Nebenversionsnummer (z.B. 1.0.0 -> 1.1.0)
 * --patch: Erhöht die Patch-Versionsnummer (z.B. 1.0.0 -> 1.0.1)
 * 
 * @author Dein Name
 * @date YYYY-MM-DD
 */
```

## Best Practices

- Teste jedes Skript gründlich, bevor du es commitest.
- Halte Skripte auf dem neuesten Stand mit den aktuellen Projektanforderungen.
- Beachte die ESLint-Regeln des Projekts auch für Skripte.
- Verwende TypeScript für komplexere Skripte, um Typsicherheit zu gewährleisten.
- Dokumentiere die Verwendung jedes Skripts im Projektdokumentation.
