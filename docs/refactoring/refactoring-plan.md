# Umfassender Refactoring-Plan 2025

## Einleitung

Dieses Dokument beschreibt einen strukturierten Plan für das Refactoring der Shopping List App. Das Ziel ist, die Codequalität zu verbessern, technische Schulden abzubauen und die Wartbarkeit des Projekts zu erhöhen. Die schrittweise Umsetzung dieses Plans wird eine stabilere, leistungsfähigere und besser wartbare Anwendung schaffen.

### Ziele des Refactorings

- **Verbesserte Wartbarkeit**: Code einfacher zu verstehen und zu modifizieren
- **Erhöhte Robustheit**: Weniger Fehler und stabileres Verhalten
- **Verbesserte Performance**: Schnellere Lade- und Reaktionszeiten
- **Reduzierte Komplexität**: Einfachere Codestrukturen und klare Verantwortlichkeiten
- **Zukunftssicherheit**: Bessere Anpassbarkeit an neue Anforderungen

## Prioritätsmatrix

Die folgende Matrix klassifiziert Refactoring-Maßnahmen nach Aufwand und Nutzen:

| Maßnahme | Aufwand | Nutzen | Priorität |
|----------|---------|--------|-----------|
| Tote Code-Teile entfernen | Niedrig | Mittel | Hoch |
| Konsistente Namenskonventionen | Niedrig | Mittel | Hoch |
| Codekommentare verbessern | Niedrig | Mittel | Hoch |
| Unnötige Abhängigkeiten entfernen | Niedrig | Hoch | Hoch |
| Redundante CSS-Stile bereinigen | Niedrig | Mittel | Hoch |
| Komplexe Funktionen vereinfachen | Mittel | Hoch | Hoch |
| TypeScript strenger konfigurieren | Mittel | Hoch | Hoch |
| Interfaces für Datenstrukturen | Mittel | Hoch | Hoch |
| Core-Funktionalität isolieren | Mittel | Hoch | Mittel |
| Duplizierte Logik eliminieren | Mittel | Hoch | Mittel |
| Zuständigkeiten klarer trennen | Hoch | Sehr hoch | Mittel |
| Dependency Injection verbessern | Hoch | Hoch | Mittel |
| Veraltete Komponenten modernisieren | Hoch | Hoch | Mittel |
| Lazy Loading implementieren | Hoch | Hoch | Mittel |
| Rendering-Performance optimieren | Hoch | Hoch | Niedrig |
| Modulstruktur optimieren | Sehr hoch | Sehr hoch | Niedrig |
| Domain-Driven Design anwenden | Sehr hoch | Sehr hoch | Niedrig |
| Plugin-System überarbeiten | Sehr hoch | Hoch | Niedrig |
| Caching-Strategien implementieren | Sehr hoch | Hoch | Niedrig |
| Type Guards und Runtime-Checks | Sehr hoch | Hoch | Niedrig |

## Detaillierter Refactoring-Plan

Der Plan ist in vier Phasen unterteilt, die nach Komplexität und Aufwand geordnet sind.

### Phase 1: Quick Wins (1-3 Stunden pro Maßnahme)

#### 1.1 Tote Code-Teile entfernen

**Problem**: Ungenutzter Code erhöht die kognitive Last, erschwert das Verständnis und erhöht die Bundle-Größe.

**Konkrete Schritte**:
1. ESLint mit der Regel `no-unused-vars` konfigurieren
2. Code systematisch durchgehen und suchen nach:
   - Nicht importierten Komponenten in Verzeichnissen
   - Importierten, aber ungenutzten Abhängigkeiten
   - Definierten, aber ungenutzten Funktionen
   - Veralteten Hilfsfunktionen
3. VS Code "Find all References" für verdächtige Komponenten nutzen
4. Vorhandene Tests überprüfen, bevor Code entfernt wird
5. Schrittweise entfernen und testen

**Tools**:
- ESLint mit `no-unused-exports` Plugin
- IDE-Funktionen wie "Find Usages" / "Find References"
- `npm-check` für ungenutzte Abhängigkeiten

**Definition of Done**:
- Alle ESLint-Warnungen bezüglich ungenutzter Variablen/Funktionen sind behoben
- Bundle-Größe ist reduziert
- Alle Tests laufen erfolgreich

**Risiken und Mitigation**:
- **Risiko**: Entfernen von Code, der doch verwendet wird
- **Mitigation**: Inkrementelles Vorgehen mit Tests nach jeder Änderung, temporäres Kommentieren statt sofortigem Löschen

#### 1.2 Konsistente Namenskonventionen durchsetzen

**Problem**: Inkonsistente Benennung erschwert das Verständnis und die Vorhersagbarkeit des Codes.

**Konkrete Schritte**:
1. Namenskonventionen für folgende Bereiche definieren:
   - Komponenten: PascalCase (z.B. `ShoppingList.vue`)
   - Composables: camelCase mit 'use' Präfix (z.B. `useShoppingItem.ts`)
   - Funktionen: camelCase (z.B. `calculateTotal`)
   - Konstanten: UPPER_SNAKE_CASE (z.B. `MAX_ITEMS`)
   - Typen/Interfaces: PascalCase (z.B. `ShoppingItem`)
   - CSS-Klassen: kebab-case (z.B. `item-container`)
2. ESLint-Regeln für Namenskonventionen einrichten
3. Systematische Umbenennung mit IDE-Refactoring-Werkzeugen
4. Pull-Request für Review erstellen

**Tools**:
- ESLint mit `eslint-plugin-naming-convention`
- IDE-Funktionen für globales Umbenennen

**Definition of Done**:
- Dokumentierte Namenskonventionen
- Code entspricht vollständig den definierten Konventionen
- ESLint zeigt keine Warnungen mehr an

**Risiken und Mitigation**:
- **Risiko**: Umfangreiche Änderungen können zu Konflikten führen
- **Mitigation**: Separate Branches für verschiedene Arten von Umbenennungen

#### 1.3 Codekommentare verbessern

**Problem**: Fehlende oder veraltete Kommentare erschweren das Verständnis komplexer Funktionen.

**Konkrete Schritte**:
1. Fokus auf komplexe oder nicht-intuitive Codestellen setzen
2. JSDoc für öffentliche Funktionen und Komponenten hinzufügen:
   - Funktionsbeschreibung
   - Parameter-Dokumentation
   - Rückgabewerte
   - Beispiele bei komplexen Funktionen
3. Geschäftslogik und "Warum"-Entscheidungen dokumentieren
4. Veraltete Kommentare aktualisieren oder entfernen

**Beispiel für guten Kommentar**:
```typescript
/**
 * Berechnet den Gesamtpreis aller Artikel in der Einkaufsliste.
 * 
 * @param items - Array von Einkaufsartikeln
 * @param options - Konfigurationsoptionen für die Berechnung
 * @param options.includeTax - Ob Steuern einbezogen werden sollen (Standard: true)
 * @param options.taxRate - Steuersatz in Prozent (Standard: 19)
 * 
 * @returns Berechneter Gesamtpreis mit oder ohne Steuern
 * 
 * @example
 * const total = calculateTotalPrice(items, { includeTax: false });
 */
```

**Tools**:
- ESLint mit `eslint-plugin-jsdoc`
- VS Code Extension für JSDoc-Generierung

**Definition of Done**:
- Alle öffentlichen Funktionen und Komponenten sind dokumentiert
- Komplexe Logik ist mit Inline-Kommentaren erklärt
- Konsistenter Dokumentationsstil im gesamten Projekt

**Risiken und Mitigation**:
- **Risiko**: Überkommentierung oder Kommentare, die schnell veralten
- **Mitigation**: Fokus auf "Warum" statt "Was", Kommentare bei Änderungen aktualisieren

#### 1.4 Unnötige Abhängigkeiten entfernen

**Problem**: Zu viele Abhängigkeiten erhöhen die Bundle-Größe, Komplexität und potenzielle Sicherheitsrisiken.

**Konkrete Schritte**:
1. Analyse der `package.json` mit `npm-check` oder `depcheck`
2. Identifizieren von:
   - Ungenutzten Paketen
   - Veralteten Paketen
   - Überlappenden Paketen (ähnliche Funktionalität)
   - Zu großen Paketen, die durch kleinere ersetzt werden können
3. Entfernen oder Ersetzen identifizierter Pakete
4. Testen nach jeder Änderung

**Tools**:
- `npm-check` oder `depcheck`
- `npm ls` zur Anzeige der Abhängigkeitshierarchie
- `bundle-analyzer` zur Visualisierung der Bundle-Größe

**Definition of Done**:
- Reduzierte Anzahl an Abhängigkeiten
- Kleinere Bundle-Größe
- Keine ungenutzten Abhängigkeiten in `package.json`
- Alle verbleibenden Abhängigkeiten sind aktuell

**Risiken und Mitigation**:
- **Risiko**: Entfernen benötigter Abhängigkeiten
- **Mitigation**: Schrittweises Vorgehen mit Tests nach jeder Änderung

#### 1.5 Redundante CSS-Stile bereinigen

**Problem**: Redundante und inkonsistente Stile erhöhen die Stylesheet-Größe und erschweren Änderungen am Design.

**Konkrete Schritte**:
1. Stile in Komponenten auditieren und identifizieren:
   - Duplizierte Stile
   - Überschreibende Stile
   - Nicht verwendete Stile
2. Lokale Stile in `.vue`-Dateien durch Tailwind-Klassen ersetzen
3. Gemeinsame Stile in Basis-Komponenten oder Utilities extrahieren
4. Tailwind-Konfiguration überprüfen und optimieren

**Tools**:
- PurgeCSS zur Entfernung ungenutzter Stile
- Tailwind Inspector Browser-Extension
- Stylelint für CSS-Linting

**Definition of Done**:
- Reduzierte CSS-Größe
- Konsistente Verwendung von Tailwind-Klassen
- Keine doppelten Stildeklarationen
- Dokumentierte Designsystem-Komponenten

**Risiken und Mitigation**:
- **Risiko**: Visuelle Regressionen durch Stiländerungen
- **Mitigation**: Visuelle Regression-Tests oder manuelle Überprüfung

### Phase 2: Moderate Verbesserungen (3-8 Stunden pro Maßnahme)

#### 2.1 Komplexe Funktionen vereinfachen

**Problem**: Zu lange oder komplexe Funktionen sind schwer zu verstehen, zu testen und zu warten.

**Konkrete Schritte**:
1. Funktionen mit hoher kognitiver Komplexität identifizieren:
   - Lange Funktionen (>50 Zeilen)
   - Viele verschachtelte Bedingungen
   - Mehrere Verantwortlichkeiten
2. Funktion in kleinere, fokussierte Funktionen aufteilen:
   - Jede Funktion sollte eine klare einzelne Verantwortung haben
   - Sinnvolle Benennung der neuen Funktionen
3. Gemeinsame Logik extrahieren und wiederverwenden
4. Tests für neue Funktionen schreiben

**Beispiel**:
```typescript
// Vorher: Eine große komplexe Funktion
function processShoppingList(items) {
  // 100 Zeilen Code mit vielen Verantwortlichkeiten
}

// Nachher: In kleinere Funktionen aufgeteilt
function processShoppingList(items) {
  const validItems = validateItems(items);
  const categorizedItems = categorizeItems(validItems);
  const sortedItems = sortItemsByPriority(categorizedItems);
  return calculateTotals(sortedItems);
}

function validateItems(items) { /* ... */ }
function categorizeItems(items) { /* ... */ }
function sortItemsByPriority(items) { /* ... */ }
function calculateTotals(items) { /* ... */ }
```

**Tools**:
- ESLint mit `complexity` und `max-lines-per-function` Regeln
- SonarQube oder ähnliche Tools zur Identifizierung komplexer Funktionen

**Definition of Done**:
- Keine Funktion ist länger als 50 Zeilen
- Keine Funktion hat eine zyklomatische Komplexität > 10
- Jede Funktion hat eine klare, einzelne Verantwortung
- Tests decken die neue Funktionalität ab

**Risiken und Mitigation**:
- **Risiko**: Überrefaktorieren kann zu übermäßiger Fragmentierung führen
- **Mitigation**: Balance zwischen Einfachheit und Modularität finden

#### 2.2 TypeScript strenger konfigurieren

**Problem**: Lockere TypeScript-Einstellungen erlauben unsichere Praktiken und reduzieren die Vorteile der statischen Typisierung.

**Konkrete Schritte**:
1. `tsconfig.json` Konfiguration verschärfen:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```
2. Schrittweise Behebung auftretender TypeScript-Fehler
3. Explizites Typisieren von:
   - Funktionsparametern
   - Rückgabewerten
   - Variablen mit komplexen Typen
4. `any`-Typen durch konkrete Typen ersetzen

**Tools**:
- TypeScript Compiler
- ESLint mit `@typescript-eslint` Plugin
- Type Coverage Reporting Tool

**Definition of Done**:
- Strenge TypeScript-Konfiguration ohne Fehler
- Keine `any`-Typen im Code (außer in spezifischen Ausnahmefällen)
- Explizite Typen für alle APIs und komplexen Datenstrukturen
- Dokumentierte TypeScript-Best-Practices

**Risiken und Mitigation**:
- **Risiko**: Zu viele Fehler auf einmal können überwältigend sein
- **Mitigation**: Schrittweise Einführung strengerer Regeln, beginnend mit wichtigen Modulen

#### 2.3 Interfaces für alle Datenstrukturen definieren

**Problem**: Fehlende oder inkonsistente Typdefinitionen führen zu Fehlern und erschwerem das Verständnis der Datenstrukturen.

**Konkrete Schritte**:
1. Zentrale Typdefinitionsdateien in `composables/types.ts` oder einem eigenen `types`-Verzeichnis erstellen
2. Interfaces für alle Hauptdatenmodelle definieren:
```typescript
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: Category;
  price?: number;
  checked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```
3. Konstante Typen mit Enums oder Union Types definieren:
```typescript
export type SortOrder = 'asc' | 'desc';
export enum ItemPriority { Low, Medium, High }
```
4. Interfaces in allen Komponenten und Funktionen verwenden
5. Typen für API-Responses definieren

**Tools**:
- TypeScript
- VSCode mit TypeScript-Plugins für bessere Navigation
- ESLint mit TypeScript-Regeln

**Definition of Done**:
- Alle Datenmodelle haben eigene Interface-Definitionen
- Keine impliziten Objekt-Typen mehr im Code
- Konsistente Verwendung der Typen im gesamten Projekt
- Dokumentation der Typstruktur

**Risiken und Mitigation**:
- **Risiko**: Zu komplexe Typenhierarchien
- **Mitigation**: Balance zwischen Typsicherheit und Komplexität

#### 2.4 Core-Funktionalität klarer isolieren

**Problem**: Vermischung von UI-Logik und Geschäftslogik erschwert Tests und Wiederverwendung.

**Konkrete Schritte**:
1. Identifizieren der Kernfunktionalitäten:
   - Einkaufslisten-Verwaltung
   - Artikelverwaltung
   - Kategorieverwaltung
   - Preisberechnung
   - Sortier- und Filterfunktionen
2. Extraktion in eigenständige Composables oder Services:
```typescript
// useShoppingList.ts
export function useShoppingList() {
  // Core Funktionalität ohne UI-Abhängigkeiten
  function addItem(list, item) { /* ... */ }
  function removeItem(list, itemId) { /* ... */ }
  function updateItem(list, itemId, updates) { /* ... */ }
  // ...

  return {
    addItem,
    removeItem,
    updateItem,
    // ...
  }
}
```
3. UI-Komponenten verwenden nur diese isolierten Funktionen
4. Tests für isolierte Funktionalität schreiben

**Tools**:
- Vue Composables Pattern
- Dependency Injection für Services
- Unit Testing Framework (Jest/Vitest)

**Definition of Done**:
- Klare Trennung zwischen UI und Geschäftslogik
- Geschäftslogik ist in eigenständigen, testbaren Modulen
- Unit-Tests für Kernfunktionalität
- Dokumentierte API für Core-Module

**Risiken und Mitigation**:
- **Risiko**: Überabstraktion kann zu unnötiger Komplexität führen
- **Mitigation**: Pragmatischer Ansatz, nur Kernfunktionalität isolieren

#### 2.5 Duplizierte Logik eliminieren

**Problem**: Duplizierter Code erhöht die Wartungslast und das Risiko inkonsistenter Änderungen.

**Konkrete Schritte**:
1. Duplizierte Code-Muster identifizieren:
   - Ähnliche Funktionen in verschiedenen Komponenten
   - Wiederholte Berechnungen
   - Kopiertere UI-Elemente mit leichten Variationen
2. Gemeinsame Funktionalität in Utilities oder Composables extrahieren:
```typescript
// utils/formatters.ts
export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency
  }).format(amount);
}

// utils/validators.ts
export function isValidItemName(name) {
  return name && name.length >= 2 && name.length <= 50;
}
```
3. Datenverarbeitungsroutinen in wiederverwendbare Funktionen extrahieren
4. UI-Muster in Basis-Komponenten zusammenfassen

**Tools**:
- Code-Analyse-Tools zur Identifizierung ähnlicher Code-Blöcke
- Unit-Tests zur Validierung extrahierter Funktionen

**Definition of Done**:
- Keine doppelten Implementierungen derselben Funktionalität
- Gemeinsam genutzte Funktionen sind in zentralen Utilities
- Wiederverwendbare UI-Komponenten für gemeinsame Muster
- Tests für alle extrahierten Funktionen

**Risiken und Mitigation**:
- **Risiko**: Übermäßige Abstraktion führt zu schwer verständlichem Code
- **Mitigation**: Balance zwischen DRY-Prinzip und Verständlichkeit

### Phase 3: Strukturelle Verbesserungen (1-3 Tage pro Maßnahme)

#### 3.1 Zuständigkeiten klarer trennen (SRP)

**Problem**: Komponenten mit zu vielen Verantwortlichkeiten sind schwer zu warten und zu testen.

**Konkrete Schritte**:
1. Komponenten analysieren und Verantwortlichkeiten identifizieren
2. Mehrfachverantwortlichkeiten aufteilen in separate Komponenten:
   - Präsentationskomponenten (UI und Styling)
   - Container-Komponenten (Datenabruf und -verwaltung)
   - Utility-Komponenten (wiederverwendbare Funktionalität)
3. SOLID-Prinzipien anwenden, besonders das Single Responsibility Principle
4. Komponenten in kleinere, fokussierte Komponenten aufteilen

**Beispiel für Trennung nach Verantwortlichkeiten**:
```typescript
// Vorher: Eine große Komponente mit vielen Verantwortlichkeiten
<script setup lang="ts">
// Daten laden, transformieren, UI-State verwalten und rendern
</script>

// Nachher: Getrennte Verantwortlichkeiten
// ShoppingListContainer.vue - Datenverwaltung
<script setup lang="ts">
// Lädt Daten, verwaltet State, verwendet ShoppingListView für Darstellung
</script>

// ShoppingListView.vue - Präsentation
<script setup lang="ts">
// Rein für Darstellung, erhält Daten als Props
</script>

// ShoppingListFilter.vue - Filterung
<script setup lang="ts">
// Spezialisiert auf Filterlogik
</script>
```

**Tools**:
- Component Analyzer für Komplexitätsanalyse
- IDE-Features für Extract Component

**Definition of Done**:
- Jede Komponente hat eine klar definierte Verantwortung
- Reduzierte Komponentenkomplexität
- Komponenteninteraktion ist klar dokumentiert
- Verbesserte Testabdeckung für aufgeteilte Komponenten

**Risiken und Mitigation**:
- **Risiko**: Übermäßige Fragmentierung führt zu Kommunikationsoverhead
- **Mitigation**: Sinnvolle Komponenten-Granularität finden, Gemeinsamkeiten berücksichtigen

#### 3.2 Dependency Injection verbessern

**Problem**: Direkte Abhängigkeiten zwischen Komponenten erschweren Tests und erhöhen die Kopplung.

**Konkrete Schritte**:
1. Direkte Abhängigkeiten in Komponenten identifizieren
2. Services und Utilities über provide/inject einfügen:
```typescript
// plugins/services.ts
export const shoppingServiceKey = Symbol() as InjectionKey<ShoppingService>

export default defineNuxtPlugin((nuxtApp) => {
  const shoppingService = {
    // Service-Implementierung
  }
  
  nuxtApp.provide(shoppingServiceKey, shoppingService)
})

// Komponente
<script setup lang="ts">
const shoppingService = inject(shoppingServiceKey)
</script>
```
3. Mock-Implementierungen für Tests erstellen
4. Factory-Funktionen für komplexe Abhängigkeiten erstellen

**Tools**:
- Vue's provide/inject System
- Nuxt Plugins/Modules
- Dependency Injection Container (optional)

**Definition of Done**:
- Keine direkten Abhängigkeiten zwischen Komponenten
- Services sind über DI verfügbar
- Tests verwenden Mock-Implementierungen
- Dokumentierte Service-Interfaces

**Risiken und Mitigation**:
- **Risiko**: Zu komplexe DI-Struktur
- **Mitigation**: Einfach halten, nur für wesentliche Services verwenden

#### 3.3 Veraltete Komponenten modernisieren

**Problem**: Veraltete Komponenten nutzen nicht die Vorteile moderner Vue 3 Funktionen.

**Konkrete Schritte**:
1. Veraltete Komponenten identifizieren:
   - Optionen-API statt Composition API
   - Keine TypeScript-Typisierung
   - Veraltete Lifecycle-Hooks
   - JavaScript statt TypeScript
2. Refactoren zu Composition API mit `<script setup>`:
```typescript
// Vorher: Optionen-API
<script>
export default {
  data() { return { items: [] } },
  methods: {
    addItem() { /* ... */ }
  }
}
</script>

// Nachher: Composition API mit <script setup>
<script setup lang="ts">
import { ref } from 'vue'
import type { ShoppingItem } from '@/types'

const items = ref<ShoppingItem[]>([])
function addItem(item: ShoppingItem) { /* ... */ }
</script>
```
3. TypeScript-Typisierung hinzufügen
4. Moderne Vue-Features nutzen (computed, watch, provide/inject)

**Tools**:
- Migration-Helfer für Vue 2 zu Vue 3
- ESLint Vue Plugin

**Definition of Done**:
- Alle Komponenten verwenden Composition API mit `<script setup>`
- Vollständige TypeScript-Integration
- Moderne Vue 3 Patterns werden durchgängig verwendet
- Tests sind an neue Struktur angepasst

**Risiken und Mitigation**:
- **Risiko**: Funktionalitätsverlust durch Migrations-Fehler
- **Mitigation**: Schrittweise Migration mit Tests nach jeder Komponente

#### 3.4 Lazy Loading implementieren

**Problem**: Große Bundle-Größe führt zu langsamen Ladezeiten, besonders auf mobilen Geräten.

**Konkrete Schritte**:
1. Routen-basiertes Lazy Loading in Nuxt implementieren:
```typescript
// Automatisches Chunk-Splitting für Routen in Nuxt
// Konfiguration in nuxt.config.ts

export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true
  },
  routeRules: {
    '/admin/**': { prerender: false }
  }
})
```
2. Komponenten-basiertes Lazy Loading für große Komponenten:
```typescript
// Lazy-loading für große Komponenten
const HeavyChart = defineAsyncComponent(() => 
  import('@/components/HeavyChart.vue')
)
```
3. Dynamisches Importieren von Library-Code, der nicht sofort benötigt wird
4. Preloading/Prefetching für wahrscheinlich benötigte Komponenten einrichten

**Tools**:
- Vue/Nuxt eigene Lazy-Loading-Mechanismen
- Bundle Analyzer zur Identifizierung großer Chunks
- Performance-Monitoring-Tools

**Definition of Done**:
- Reduzierte initiale Bundle-Größe
- Verbesserte Ladezeiten auf mobilen Geräten
- Optimiertes Chunk-Splitting
- Performance-Metriken zeigen Verbesserung

**Risiken und Mitigation**:
- **Risiko**: Zu viele kleine Chunks können zu Netzwerk-Overhead führen
- **Mitigation**: Sinnvolle Chunk-Größen definieren, zusammengehörige Komponenten zusammenfassen

#### 3.5 Rendering-Performance optimieren

**Problem**: Ineffiziente Renders und unnötige Neuberechnungen führen zu Performance-Problemen.

**Konkrete Schritte**:
1. Performance-Bottlenecks identifizieren:
   - Häufig neugerenderte Komponenten
   - Langsame computed properties
   - Unnötige Neuerstellungen von Arrays/Objekten
2. Memoisation für Funktionen und computed properties einsetzen:
```typescript
// Memoisation für teure Berechnungen
const sortedItems = computed(() => {
  console.log('Sorting items...') // Sollte nicht bei jedem Render erscheinen
  return [...items.value].sort((a, b) => a.name.localeCompare(b.name))
})
```
3. `v-once` und `v-memo` für statische oder selten ändernde Inhalte verwenden
4. Virtuelle Listen für lange Listen einsetzen
5. Vermeidung von Inline-Funktionen in Templates

**Tools**:
- Vue DevTools Performance Tab
- Chrome Performance Tools
- Profiling-Tools

**Definition of Done**:
- Messbare Performance-Verbesserungen in dev/prod-Umgebung
- Glatte Scrollperformance auch bei langen Listen
- Reduzierte CPU-Auslastung
- Weniger unbeabsichtigte Neuerstellungen

**Risiken und Mitigation**:
- **Risiko**: Vorzeitige Optimierung kann zu komplexerem Code führen
- **Mitigation**: Erst messen, dann optimieren

### Phase 4: Architektonische Umgestaltung (3+ Tage pro Maßnahme)

#### 4.1 Modulstruktur optimieren

**Problem**: Unklare Modulstruktur erschwert Navigation und Verständnis des Codes.

**Konkrete Schritte**:
1. Aktuelle Projektstruktur analysieren und Verbesserungspotential identifizieren
2. Neu strukturieren nach folgenden Prinzipien:
   - Feature-basierte Organisation statt technischer Trennung
   - Zusammengehörige Funktionalität gruppieren
   - Klare Abhängigkeitshierarchie definieren
3. Ordnerstruktur überarbeiten, z.B.:
```
src/
  features/
    shopping-lists/
      components/
      composables/
      types/
      utils/
    categories/
    items/
    statistics/
  shared/
    components/
    composables/
    types/
    utils/
  infrastructure/
    api/
    storage/
    logging/
```
4. Klare Import-Regeln definieren und durchsetzen
5. Barrel-Exports für einfachere Importe implementieren

**Tools**:
- ESLint-Regeln für Import-Struktur
- Refactoring-Tools der IDE

**Definition of Done**:
- Dokumentierte Projektstruktur
- Konsistente Anwendung der neuen Struktur
- Verbesserte Navigierbarkeit des Codes
- Keine zirkulären Abhängigkeiten

**Risiken und Mitigation**:
- **Risiko**: Großer Umstrukturierungsaufwand mit vielen Merge-Konflikten
- **Mitigation**: Schrittweise Umstellung, Feature für Feature

#### 4.2 Domain-Driven Design anwenden

**Problem**: Fehlende klare Domänenmodellierung führt zu inkonsistenter Implementierung der Geschäftslogik.

**Konkrete Schritte**:
1. Domänen und Subdomänen identifizieren:
   - Einkaufslisten
   - Artikel
   - Kategorien
   - Benutzer
   - Statistiken
2. Bounded Contexts definieren und dokumentieren
3. Ubiquitäre Sprache etablieren und konsistent anwenden
4. Aggregates, Entities und Value Objects definieren:
```typescript
// Domain/ShoppingList/ShoppingList.ts
export class ShoppingList {
  readonly id: string;
  readonly name: string;
  private _items: ShoppingItem[] = [];
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
  
  get items(): readonly ShoppingItem[] {
    return [...this._items];
  }
  
  addItem(item: ShoppingItem): void {
    // Domain-Logik für das Hinzufügen eines Items
  }
  
  removeItem(itemId: string): void {
    // Domain-Logik für das Entfernen eines Items
  }
}
```
5. Domain Services für komplexe Operationen implementieren
6. Repositories für Datenzugriff definieren

**Tools**:
- Event Storming für Domänenanalyse
- C4-Modell für Architekturdokumentation

**Definition of Done**:
- Dokumentiertes Domänenmodell
- Klare Bounded Contexts mit definierten Schnittstellen
- Konsistente Anwendung der ubiquitären Sprache im Code
- Domain-Logik in Entitäten und Domain Services gekapselt

**Risiken und Mitigation**:
- **Risiko**: Überkomplexität für einfache Domänen
- **Mitigation**: Pragmatisches DDD mit Fokus auf Wertschöpfung

#### 4.3 Plugin-System überarbeiten

**Problem**: Starr gekoppelte Erweiterungspunkte erschweren die Erweiterbarkeit der Anwendung.

**Konkrete Schritte**:
1. Aktuelle Plugin-Integrationen identifizieren
2. Plugin-Architektur mit klaren Extension Points definieren:
```typescript
// Core/Plugin/PluginRegistry.ts
export interface Plugin {
  name: string;
  hooks: {
    beforeItemAdd?: (item: ShoppingItem) => ShoppingItem | false;
    afterItemAdd?: (item: ShoppingItem) => void;
    // weitere Hooks
  };
  components?: Record<string, Component>;
  // weitere Extension Points
}

export class PluginRegistry {
  private plugins: Plugin[] = [];
  
  register(plugin: Plugin): void {
    this.plugins.push(plugin);
  }
  
  runHook<T>(hookName: string, data: T): T | false {
    // Hook-Ausführungslogik
  }
}
```
3. Plugin-Konfiguration über Dependency Injection bereitstellen
4. Lazy Loading für Plugins implementieren
5. Plugin-Dokumentation erstellen

**Tools**:
- Dependency Injection
- Dynamic Imports

**Definition of Done**:
- Dokumentierte Plugin-API
- Testbarkeit von Plugin-Integrationen
- Beispiel-Plugins für verschiedene Erweiterungspunkte
- Klare Lifecycle-Hooks für Plugins

**Risiken und Mitigation**:
- **Risiko**: Zu generisches System erhöht Komplexität
- **Mitigation**: Mit konkreten Use-Cases beginnen und abstrahieren

#### 4.4 Caching-Strategien implementieren

**Problem**: Ineffiziente Datenabrufe und -berechnungen verschlechtern die Performance und Offline-Fähigkeit.

**Konkrete Schritte**:
1. Caching-Anforderungen identifizieren:
   - API-Responses
   - Berechnungsergebnisse
   - Nutzereinstellungen
   - Offline-Daten
2. Mehrschichtiges Caching implementieren:
```typescript
// infrastructure/cache/CacheService.ts
export class CacheService {
  // In-Memory Cache für häufig genutzte Daten
  private memoryCache = new Map<string, any>();
  
  // LocalStorage/IndexedDB für persistente Daten
  async getFromStorage(key: string): Promise<any> { /* ... */ }
  async saveToStorage(key: string, value: any): Promise<void> { /* ... */ }
  
  // Intelligentes Caching mit TTL und Invalidierung
  async get(key: string, fetchFn?: () => Promise<any>, options?: CacheOptions): Promise<any> {
    // Cache-Logik mit Fallback auf fetchFn
  }
}
```
3. Service Worker für Offline-Caching konfigurieren
4. Cache-Invalidierungsstrategien implementieren
5. Konfliktlösung für synchronisierte Daten

**Tools**:
- IndexedDB/LocalStorage
- Service Worker API
- Workbox für PWA-Caching

**Definition of Done**:
- Funktionierender Offline-Modus
- Schnellere wiederholte Datenabrufe
- Reduzierte Serveranfragen
- Transparentes Caching für Entwickler

**Risiken und Mitigation**:
- **Risiko**: Veraltete Daten durch zu aggressives Caching
- **Mitigation**: Sorgfältige TTL-Strategien und Invalidierungsmechanismen

#### 4.5 Type Guards und Runtime-Checks implementieren

**Problem**: Fehlende Laufzeitüberprüfungen für externe Daten führen zu schwer zu findenden Fehlern.

**Konkrete Schritte**:
1. Kritische Datenpfade identifizieren:
   - API-Responses
   - LocalStorage-Daten
   - Benutzerinputdaten
2. Type Guards für komplexe Typen implementieren:
```typescript
// utils/typeGuards.ts
export function isShoppingItem(obj: unknown): obj is ShoppingItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'quantity' in obj &&
    'category' in obj
  );
}
```
3. Validation Library (z.B. Zod, io-ts, Ajv) für strukturelle Validierung einsetzen:
```typescript
// utils/validation.ts
import { z } from 'zod';

export const ShoppingItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  quantity: z.number().positive(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string().min(1)
  }),
  price: z.number().nonnegative().optional(),
  checked: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ValidatedShoppingItem = z.infer<typeof ShoppingItemSchema>;

export function validateShoppingItem(data: unknown): ValidatedShoppingItem {
  return ShoppingItemSchema.parse(data);
}
```
4. Fehlerbehandlung für Validierungsfehler implementieren
5. Logging von Validierungsfehlern für Debugging

**Tools**:
- Zod/io-ts/Ajv für Laufzeitvalidierung
- TypeScript für statische Typprüfung

**Definition of Done**:
- Robuste Validierung aller externen Datenquellen
- Aussagekräftige Fehlermeldungen bei ungültigen Daten
- Typsichere Verarbeitung nach Validierung
- Tests für Validierungslogik

**Risiken und Mitigation**:
- **Risiko**: Performance-Overhead durch exzessive Validierung
- **Mitigation**: Strategische Validierung an Systemgrenzen

## Umsetzungsplanung

### Zeitplan und Priorisierung

Der folgende Zeitplan ist ein Vorschlag für die Umsetzung der Refactoring-Maßnahmen:

**Sprint 1: Quick Wins**
- Tote Code-Teile entfernen
- Konsistente Namenskonventionen durchsetzen
- Unnötige Abhängigkeiten entfernen
- Redundante CSS-Stile bereinigen

**Sprint 2: TypeScript und Code-Struktur**
- TypeScript strenger konfigurieren
- Interfaces für alle Datenstrukturen definieren
- Codekommentare verbessern

**Sprint 3: Logik-Optimierung**
- Komplexe Funktionen vereinfachen
- Core-Funktionalität klarer isolieren
- Duplizierte Logik eliminieren

**Sprint 4: Komponenten-Modernisierung**
- Zuständigkeiten klarer trennen
- Dependency Injection verbessern
- Veraltete Komponenten modernisieren

**Sprint 5: Performance**
- Lazy Loading implementieren
- Rendering-Performance optimieren

**Sprint 6+: Architektur-Evolution**
- Modulstruktur optimieren
- Domain-Driven Design anwenden (langfristig)
- Plugin-System überarbeiten (bei Bedarf)
- Caching-Strategien implementieren
- Type Guards und Runtime-Checks implementieren

### Erfolgsmessung

Für jede Refactoring-Phase sollten folgende Metriken erfasst werden:

**Quantitative Metriken**:
- Bundle-Größe vor/nach
- Ladezeiten auf verschiedenen Geräten
- Anzahl bekannter Bugs
- Code-Coverage durch Tests
- Zyklomatische Komplexität
- Komponentengröße (Durchschnitt, Maximum)

**Qualitative Metriken**:
- Entwickler-Feedback zur Codequalität
- Zeit für Onboarding neuer Entwickler
- Geschwindigkeit bei der Implementierung neuer Features

### Empfehlungen für nachhaltiges Refactoring

1. **Kontinuierliches Refactoring**: "Boy Scout Rule" einführen - Code besser hinterlassen als vorgefunden
2. **Code Reviews**: Refactoring-Aspekte explizit in Code-Review-Checklisten aufnehmen
3. **Automatisierung**: Linting, Typ-Prüfung und Tests in CI/CD-Pipeline integrieren
4. **Dokumentation**: Architekturentscheidungen und Patterns dokumentieren
5. **Schulung**: Team in Clean Code und SOLID-Prinzipien schulen

## Fazit

Dieser Refactoring-Plan bietet einen strukturierten Ansatz zur Verbesserung der Shopping List App. Die schrittweise Umsetzung ermöglicht kontinuierliche Verbesserungen ohne den laufenden Entwicklungsprozess zu behindern. Der Fokus liegt auf nachhaltigem Refactoring, das sowohl kurzfristige Gewinne als auch langfristige architektonische Verbesserungen ermöglicht.

Die Implementierung dieses Plans wird zu einer robusteren, wartbareren und leistungsfähigeren Anwendung führen, die besser für zukünftige Anforderungen und Erweiterungen gerüstet ist.
