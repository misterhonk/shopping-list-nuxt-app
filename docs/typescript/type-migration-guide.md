# Migrationsanleitung: JavaScript zu TypeScript

Diese Anleitung beschreibt den Prozess zur Migration von JavaScript zu TypeScript in der Shopping-List-App.

## Inhaltsverzeichnis

1. [Abgeschlossene Migration](#abgeschlossene-migration)
2. [Migrationsschritte](#migrationsschritte)
3. [Umgang mit Migrationsproblemen](#umgang-mit-migrationsproblemen)
4. [Post-Migration-Optimierungen](#post-migration-optimierungen)

## Abgeschlossene Migration

Alle Komponenten und Dateien wurden erfolgreich auf TypeScript umgestellt. Dies umfasst:

- Alle Vue-Komponenten (28 Dateien)
- Alle Composables und Services
- Store-Dateien mit Pinia
- Hilfsfunktionen und Utilities

## Migrationsschritte

Der Migrationsprozess folgte diesen Schritten:

1. **Vorbereitung der Infrastruktur**:
   - Einrichtung von `tsconfig.json` mit strikten TypeScript-Einstellungen
   - Aktualisierung der ESLint-Konfiguration für TypeScript
   - Erstellung zentraler Typ-Definitionen in `types/app-types.ts`

2. **Migration der Komponenten**:
   - Änderung von `<script setup>` zu `<script setup lang="ts">`
   - Konvertierung von `defineProps({})` zu `defineProps<{}>()`
   - Verwendung von `withDefaults()` für Props mit Standardwerten
   - Typisierung von Refs und reaktiven Objekten
   - Hinzufügen von Rückgabetypen für Funktionen

3. **Migration der Composables**:
   - Hinzufügen von TypeScript-Typen zu allen Parametern und Rückgabewerten
   - Verwendung von generischen Typen wo sinnvoll
   - Ersetzen von JavaScript-Docblocks durch TypeScript-Signaturen

4. **Store-Migration**:
   - Typisierung der State-Definitionen
   - Typisierung der Actions und Getters
   - Sicherstellung der Typensicherheit bei Store-Interaktionen

5. **Automatisierung**:
   - Verwendung des Skripts `scripts/convert-to-typescript.mjs` für die Grundkonvertierung
   - Manuelle Nachbearbeitung für komplexere Typdefinitionen

## Umgang mit Migrationsproblemen

Während der Migration traten verschiedene Probleme auf, die wie folgt gelöst wurden:

### 1. Type-Import-Probleme

**Problem**: Module '/_nuxt/composables/types.ts' does not provide named export 'Category'

**Lösung**:
- Konsolidierung aller Typdefinitionen in `types/app-types.ts`
- Verwendung von `import type { ... } from '...'` für saubere Typimporte
- Vermeidung von Zyklusabhängigkeiten bei Typimporten

### 2. Implizite Any-Typen

**Problem**: Implizite Any-Typen verletzten die `noImplicitAny`-Regel

**Lösung**:
- Explizite Typdefinitionen für alle Funktionsparameter
- Verwendung von `event: Event` und Type Assertions wie `(event.target as HTMLInputElement)`
- Erstellung von Utility-Typen für wiederholende Muster

### 3. Null/Undefined-Checks

**Problem**: Null-/Undefined-Fehler durch `strictNullChecks`

**Lösung**:
- Hinzufügen von Null-/Undefined-Checks mit nullish Coalescing (`??`) und Optional Chaining (`?.`)
- Verwendung von Typenschutzmechanismen (Type Guards) zur Laufzeittypenüberprüfung
- Default-Werte für optionale Parameter

## Post-Migration-Optimierungen

Nach der grundlegenden Migration wurden die folgenden Optimierungen vorgenommen:

1. **Verbesserte Typsicherheit**:
   - Strengere TypeScript-Einstellungen in `tsconfig.json`
   - Hinzufügen von spezifischen ESLint-Regeln für TypeScript
   - Einführung von Namenskonventionen für Typen (Interface mit `I`-Präfix)

2. **Testwerkzeuge**:
   - Einrichtung von Vitest für typisierte Tests
   - Erstellung von typisierten Test-Hilfsfunktionen
   - Beispiel-Tests für Komponenten

3. **Dokumentation**:
   - Erstellung dieses TypeScript-Migrationsleitfadens
   - Dokumentation bewährter TypeScript-Praktiken
   - Aktualisierung der Komponentendokumentation mit TypeScript-Typen

4. **Entwicklererfahrung**:
   - Einrichtung von IDE-Unterstützung für TypeScript
   - VSCode-Snippets für häufige TypeScript-Muster (geplant)
   - Type-Generatoren für häufig verwendete Datenstrukturen (geplant)
