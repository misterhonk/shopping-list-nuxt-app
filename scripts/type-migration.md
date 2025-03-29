# Typdefinitionen-Migration

Dieses Dokument erklärt die Migration von veralteten TypeScript-Definitionen zu den neuen, konsistenten Definitionen.

## Hintergrund

Im Laufe der Entwicklung haben sich inkonsistente Typdefinitionen im Projekt angesammelt. Insbesondere:

1. Die Datei `composables/types.ts` enthält veraltete Typdefinitionen, die jetzt in den folgenden Dateien zu finden sind:
   - `types/app-types.ts` (Haupttypen der Anwendung)
   - `types/form-types.ts` (Formular-bezogene Typen)
   - `types/composable-types.ts` (Rückgabetypen für Composables)

2. Es gab Inkonsistenzen in der Benennung:
   - Einige Typen hatten das `I`-Präfix (Interface-Konvention), wie `IShoppingList`
   - Andere hatten kein Präfix, wie `ShoppingList`

## Neue Konvention

Alle Interface-Typen sollten jetzt das `I`-Präfix verwenden:

- ✅ `IShoppingList` statt `ShoppingList`
- ✅ `IShoppingItem` statt `ShoppingItem`
- ✅ `ICategory` statt `Category`

## Migrationscheckliste

1. Aktualisiere Importe:
   - ❌ `import { ShoppingList } from '~/composables/types'`
   - ✅ `import { IShoppingList } from '~/types/app-types'`

2. Aktualisiere Typverwendung:
   - ❌ `function useExample(list: ShoppingList): void`
   - ✅ `function useExample(list: IShoppingList): void`

3. Aktualisiere Re-Exports:
   - Falls du Typen re-exportierst, stelle sicher, dass du die richtigen Namen verwendest:
   - ❌ `export type { ShoppingList } from '~/composables/types'`
   - ✅ `export type { IShoppingList } from '~/types/app-types'`

## Wichtige Migrationspfade

### Von `composables/types.ts` zu `types/app-types.ts`

| Alt                  | Neu                   |
|----------------------|-----------------------|
| `ShoppingList`       | `IShoppingList`       |
| `ShoppingItem`       | `IShoppingItem`       |
| `Category`           | `ICategory`           |
| `CategoryTemplate`   | `ICategoryTemplate`   |
| `ICreateListOptions` | `ICreateListOptions`  |
| `ITemplateCollection`| `ITemplateCollection` |
| `ICategorySortConfig`| `ICategorySortConfig` |
| `IImportOptions`     | `IImportOptions`      |
| `IExportedList`      | `IExportedList`       |
| `IAvailableListInfo` | `IAvailableListInfo`  |
| `ICategoryEventBus`  | `ICategoryEventBus`   |

## Kompatibilitätshinweis

Die Datei `composables/types.ts` bleibt vorübergehend erhalten, um die Migration zu erleichtern, ist aber als veraltet markiert und wird in Zukunft entfernt werden. Sie re-exportiert jetzt die korrekten Typen aus der richtigen Quelle, aber alle neuen Importe sollten direkt aus `types/app-types.ts` erfolgen.
