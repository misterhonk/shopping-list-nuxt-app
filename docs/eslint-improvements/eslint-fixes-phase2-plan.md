# ESLint Verbesserungen - Phase 2 Plan

## Übersicht

Nach Abschluss der Phase 1, die sich auf die Behebung kritischer TypeScript-Parsing-Fehler konzentrierte, wurden mehrere verbleibende ESLint-Warnungen identifiziert. Dieser Plan beschreibt die systematische Behebung dieser verbleibenden Probleme.

## Verbleibende Probleme

Die verbleibenden ESLint-Probleme fallen hauptsächlich in folgende Kategorien:

1. **Ungenutzte Variablen**

   - Variablen mit Unterstrich-Präfix (z.B. `_props`, `_emit`)
   - Importierte, aber nicht verwendete Typen

2. **Ungenutzte Exporte**

   - Funktionen und Typen, die exportiert, aber nicht importiert werden
   - Nuxt-spezifische Exporte (`default` in Plugin-Dateien)

3. **Formatierungsprobleme**

   - Prettier-Warnungen bezüglich Einrückung und Leerzeichen
   - Fehlende Kommas und andere Syntaxprobleme

4. **Interface-Namenskonventionen**

   - Nicht standardisierte Interface-Namen (z.B. ohne 'I'-Präfix)
   - Interface-Namen, die nicht dem PascalCase-Format entsprechen

5. **Unnötige Bedingungsprüfungen**

   - Bedingungen, die immer wahr oder falsch sind

6. **Promise-Behandlung**
   - Fehlende await, catch oder return bei Promises
   - Verschachtelte Promises

## Arbeitsplan

### Phase 2.1: Ungenutzte Variablen und Imports

1. **Skript erstellen: fix-unused-vars-phase2.mjs**

   - Ungenutzte Variablen mit Unterstrich-Präfix versehen
   - Fokus auf Vue-Komponenten (props, emit, etc.)

2. **Skript erstellen: fix-unused-imports.mjs**
   - Ungenutzte Imports entfernen oder mit Unterstrich-Präfix versehen
   - Typenimports korrigieren

### Phase 2.2: Formatierungsprobleme

1. **Prettier-Konfiguration prüfen**

   - Sicherstellen, dass die Konfiguration korrekt ist

2. **Skript erstellen: format-all-files.mjs**
   - Alle Dateien mit Prettier formatieren
   - Fokus auf kritische Dateien mit vielen Formatierungswarnungen

### Phase 2.3: Interface-Namenskonventionen (Fortsetzung)

1. **Skript erstellen: fix-interface-names-phase2.mjs**
   - Verbleibende Interface-Namen standardisieren
   - Fokus auf spezielle Interfaces in Komponenten

### Phase 2.4: Promises und Bedingungsprüfungen

1. **Skript erstellen: fix-promises.mjs**

   - Fehlende Promise-Behandlung hinzufügen
   - Verschachtelte Promises optimieren

2. **Skript erstellen: fix-conditions-phase2.mjs**
   - Unnötige Bedingungsprüfungen optimieren
   - Code vereinfachen

## Priorisierung

1. Formatierungsprobleme (hohe Priorität)
2. Ungenutzte Variablen (mittlere Priorität)
3. Interface-Namenskonventionen (mittlere Priorität)
4. Ungenutzte Exporte (niedrige Priorität)
5. Promise-Behandlung (niedrige Priorität)
6. Bedingungsprüfungen (niedrige Priorität)

## Ausführung

Für die Phase 2 wird folgender Workflow vorgeschlagen:

1. Fokus auf eine Kategorie von Problemen pro Sprint
2. Für jede Kategorie:

   - Automatisierungsskript erstellen
   - Script auf alle betroffenen Dateien anwenden
   - Ergebnisse prüfen und manuell nachbessern
   - Änderungen committen

3. Nach jeder Kategorie:
   - ESLint-Bericht generieren
   - Fortschritt dokumentieren
   - Plan für nächste Kategorie anpassen

## Ergebnis-Metriken

- Reduktion der ESLint-Fehler um 50%
- Reduktion der ESLint-Warnungen um 30%
- Erfolgreicher ESLint-Durchlauf ohne kritische Fehler
- Verbesserte Codequalität-Metriken
