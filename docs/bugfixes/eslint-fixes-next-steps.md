# Plan zur Behebung verbleibender ESLint-Warnungen

## Aktueller Fortschritt (24. März 2025)

Wir haben bereits mehrere automatisierte Skripte erfolgreich implementiert und ausgeführt:

1. **Interface-Namenskonvention umgesetzt** mit `fix-remaining-interfaces.mjs`
2. **Ungenutzte Variablen korrigiert** mit `fix-unused-vars-prefix.mjs`
3. **Fehlende Rückgabetypen hinzugefügt** mit `fix-missing-return-types-all.mjs`
4. **CategoryManager.ts refaktoriert** für bessere Lesbarkeit und Wartbarkeit

Diese Änderungen wurden im Commit `1357049c4fc6f3b4c253123faab1996fc35025af` gespeichert.

## Verbleibende Probleme

Das automatische Hinzufügen von Rückgabetypen hat in einigen Dateien zu Syntax-Fehlern geführt:
- TypeScript-Parsing-Fehler wie "Expression expected", "'=>' expected", "'{' expected"
- Fehlerhafte Import-Abhängigkeiten aufgrund der Parsing-Fehler
- Verbleibende Interface-Namenskonventionsprobleme

## Nächste Schritte

### Phase 1: Kritische Dateien korrigieren
1. `utils/logger.ts` - Diese Datei wird häufig importiert und verursacht kaskadische Fehler
2. `services/updateService.ts` - Enthält wichtige Funktionalität für Updates und Versionierung
3. `stores/category/index.ts` - Zentrale Store-Datei mit vielen Abhängigkeiten

### Phase 2: Funktionale Module korrigieren
1. Composables-Dateien mit Parsing-Fehlern
   - `composables/useDarkMode.ts`
   - `composables/shoppingItems/*.ts`
   - `composables/utils/*.ts`
2. Service-Dateien
   - `services/CategoryService.ts`
   - `services/ItemService.ts` 
   - `services/ShoppingListService.ts`

### Phase 3: Interface-Konventionen abschließen
1. Verbleibende Interface-Formatierungsprobleme in:
   - `types/app-types.ts`
   - `types/uiTypes.ts`
   - `types/composable-types.ts`
   - `composables/types.ts`

### Phase 4: ESLint-Anpassungen und Validierung
1. ESLint-Konfiguration anpassen:
   - Regeln für "import/no-unused-modules" bei Public-API-Dateien
   - Konsistente Interface-Benennungsregeln sicherstellen
2. Vollständigen ESLint-Durchlauf zur Validierung durchführen
3. Build-Prozess testen, um zu bestätigen, dass alle Fehler behoben sind

## Prioritätsplan

1. **Hohe Priorität**: Phase 1 - Kritische Dateien
2. **Mittlere Priorität**: Phase 2 - Funktionale Module
3. **Niedrige Priorität**: Phasen 3 und 4 - Abschlussarbeiten

Dieser Plan wird uns helfen, die verbleibenden ESLint-Warnungen systematisch und effizient zu beheben.
