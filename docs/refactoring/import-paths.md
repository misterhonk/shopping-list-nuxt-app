# Import-Pfad-Optimierung für Shopping List App

Um die Wartbarkeit und Lesbarkeit des Codes zu verbessern, sollten alle Import-Pfade optimiert werden.

## Aktuelle Probleme

1. Relative Pfade mit mehreren Ebenen (`../../`)
2. Inkonsistente Import-Stile

## Nuxt-Alias-Standard

In Nuxt-Projekten sollten folgende Aliase verwendet werden:

- `~` - Verweist auf das Stammverzeichnis des Projekts
- `@` - Verweist auf das `src`-Verzeichnis (in Nuxt 2/3 identisch mit `~`)

## Richtlinien für Imports

1. Bevorzuge Nuxt-Aliase gegenüber relativen Pfaden:

```typescript
// SCHLECHT
import { createLogger } from '../../utils/logger';
import { useStorage } from '../core/useStorage';

// GUT
import { createLogger } from '~/utils/logger';
import { useStorage } from '~/composables/core/useStorage';
```

2. Importiere Typen mit dem `type`-Schlüsselwort:

```typescript
// SCHLECHT
import { ShoppingItem } from '~/composables/types';

// GUT
import type { ShoppingItem } from '~/composables/types';
```

3. Importe gruppieren und sortieren:
   - Zuerst Vue-Komponenten
   - Dann externe Bibliotheken
   - Dann interne Module
   - Zuletzt Typen

## Bereits korrigierte Dateien

Folgende Dateien wurden bereits korrigiert:

1. `composables/importExport/useListImport.ts`
2. `composables/importExport/useListExport.ts`
3. `composables/shoppingItems/useItemSuggestions.ts`
4. `composables/shoppingItems/debug-helpers.ts`
5. `composables/shoppingItems/useItemManagement.ts`
6. `composables/shoppingList/useListProperties.ts`
7. `composables/shoppingList/useListUpdate.ts`

## Zu überprüfende Dateien

Die folgenden Dateien sollten noch überprüft und bei Bedarf korrigiert werden:

1. Vue-Komponenten in `components/`
2. Stores in `stores/`
3. Plugins in `plugins/`
4. Weitere Composables in `composables/`

## Umsetzungsstrategie

1. Verwende ESLint mit Import-Regeln, um Probleme zu identifizieren:
   ```json
   // .eslintrc.json
   "rules": {
     "import/no-relative-parent-imports": "warn",
     "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }]
   }
   ```
2. Nutze IDE-Funktionen für globale Suche/Ersetzen:
   - Suche nach `from '../` und `from '../../'`
   - Ersetze mit den entsprechenden Nuxt-Aliase
3. Aktualisiere Imports und teste nach jeder Datei-Kategorie

## Vorteile

- Bessere Lesbarkeit
- Einfacheres Refactoring (Pfade brechen weniger leicht)
- Konsistenter Codestil
- Verbesserte IDE-Unterstützung
- Bessere Fehlermeldungen bei fehlenden Imports
