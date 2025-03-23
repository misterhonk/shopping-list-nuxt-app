# TypeScript-Import-Probleme behoben

## Problembeschreibung

Nach der Umstellung auf TypeScript und der Konsolidierung von Typdefinitionen in zentralen Dateien kam es zu Konflikten bei den Import-Pfaden. Der Build schlug mit dem Fehler `Module '/_nuxt/composables/types.ts' does not provide named export 'Category'` fehl, was darauf hindeutet, dass die Anwendung versucht, Typen aus einer alten Pfadstruktur zu importieren.

## Ursache

1. Im Zuge der TypeScript-Konvertierung wurden Typdefinitionen in zentrale Dateien unter `~/types/app-types.ts` verschoben, aber nicht alle Komponenten wurden korrekt aktualisiert.
2. Insbesondere verwendeten einige Komponenten weiterhin `import type { ... } from '~/composables/types'`, obwohl die Typen (Category, ShoppingItem, ShoppingList, CategoryTemplate) jetzt in `~/types/app-types.ts` definiert sind.
3. Die Datei `composables/types.ts` reexportiert zwar einige dieser Typen, aber der Build-Prozess hatte Probleme damit.
4. Zusätzlich gab es Probleme mit dem Vue Script-Setup-Format in der CategoryManager-Komponente.
5. Ein weiteres Problem bestand im Import der Funktion `addDefaultPathsToTemplates` aus einem falschen Pfad.

## Lösung

Die folgenden Änderungen wurden vorgenommen:

1. **Import-Pfade korrigiert**: In vielen Dateien haben wir `import type { ... } from '~/composables/types'` auf `import type { ... } from '~/types/app-types'` geändert.
2. **Script-Setup korrigiert**: In `components/categories/CategoryManager.vue` wurde das `<script setup lang="ts">` zu normalen `<script lang="ts">` geändert, da der Export `export default script` mit dem Script-Setup-Format nicht kompatibel ist.
3. **Template-Funktionalität konsolidiert**: Die Funktion `addDefaultPathsToTemplates` und die zugehörigen Pfade wurden direkt in die Datei `templates.ts` integriert, anstatt sie aus einer anderen Datei zu importieren, um Pfad-Auflösungsprobleme zu beheben.

## Dateien

Folgende Dateien wurden angepasst:
- components/items/ItemListItem.vue
- components/categories/CategoryManager.vue
- components/template-selector.vue
- types/uiTypes.ts
- composables/utils/dataMigration.ts
- composables/importExport/useListExport.ts
- composables/importExport/useListImport.ts
- composables/shoppingItems/debug-helpers.ts
- composables/shoppingList/useListManagement.ts
- stores/category/migration.ts
- stores/category/storage.ts
- stores/category/utils.ts
- stores/category/operations.ts
- stores/category/templates.ts
- stores/category/sorting.ts
- stores/category/index.ts
- stores/templates/defaultPaths.ts
- components/categories/testing-helper.ts
- services/CategoryService.ts
- services/ItemService.ts
- services/ShoppingListService.ts

## Weiterhin bestehende Warnungen

Es gibt noch Warnungen bezüglich der falschen Verwendung des `??`-Operators in mehreren Dateien. Dieser Operator wird oft fälschlicherweise in Kombinationen wie `!variable ?? bedingung` verwendet, was logisch nicht korrekt ist, da der linke Operand `!variable` immer ein boolescher Wert ist und der `??`-Operator daher nie den rechten Operanden zurückgibt. Diese Warnungen beeinträchtigen den Build nicht, sollten aber in einem zukünftigen Fix behoben werden.

## Commit

Die Änderungen wurden im Commit bf25698b2ae4758dcdd3cbd3edfe772ee650c584 vom 23. März 2025 festgehalten.
