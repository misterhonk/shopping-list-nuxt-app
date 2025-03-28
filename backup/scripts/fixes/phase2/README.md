# ESLint-Verbesserungen Phase 2 - Automatisierungsskripte

Dieses Verzeichnis enthält Skripte zur automatisierten Behebung von ESLint-Warnungen für Phase 2 der ESLint-Optimierungen. Die einzelnen Skripte sind für spezifische Probleme konzipiert und können individuell oder über `run-all-fixes.mjs` ausgeführt werden.

## Verfügbare Skripte

### Bereits implementiert und getestet

- `fix-logger.mjs` - Korrigiert Probleme in utils/logger.ts (Variablennamen, eslint-disable)
- `fix-category-store.mjs` - Korrigiert Probleme in stores/category/index.ts (Variablennamen, setTimeout-Rückgabetypen)
- `fix-update-service.mjs` - Korrigiert Probleme in services/updateService.ts (Syntaxfehler, Variablenkonsistenz)
- `run-all-fixes.mjs` - Führt alle implementierten Fix-Skripte aus

### Vorbereitete Skripte (noch nicht implementiert)

- `fix-callback-literals.mjs` - Korrigiert Probleme mit Callback-Literalen
- `fix-console-errors.mjs` - Korrigiert fehlende eslint-disable für console-Aufrufe
- `fix-error-args.mjs` - Korrigiert inkonsistente Error-Parameter
- `fix-logger-level.mjs` - Korrigiert falsche Logger-Level-Verwendung
- `fix-registration-var.mjs` - Korrigiert inkonsistente Service-Worker-Registration-Variablen
- `fix-remaining-issues.mjs` - Sammlung von Fixes für verbleibende Probleme
- `fix-variable-consistency.mjs` - Verbessert die Konsistenz der Variablenbenennungen

## Verwendung

```bash
# Ausführen eines einzelnen Skripts
node scripts/fixes/phase2/fix-logger.mjs

# Ausführen aller implementierten Skripte
node scripts/fixes/phase2/run-all-fixes.mjs
```

## Dokumentation

Jedes Skript enthält eine ausführliche Dokumentation am Anfang der Datei, die den Zweck und die durchgeführten Änderungen beschreibt. Nach Ausführung eines Skripts sollte immer eine ESLint-Prüfung durchgeführt werden, um den Erfolg zu verifizieren.

```bash
# ESLint-Prüfung für eine spezifische Datei
npm run lint -- utils/logger.ts
```

## Nächste Schritte

1. Implementieren der verbleibenden Skripte nach Bedarf
2. Testen und Verifizieren mit ESLint
3. Erweitern auf weitere Dateien und Probleme
