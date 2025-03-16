# Stores

Diese Directory enthält die Pinia Stores für den State der Anwendung.

## Struktur

- `categoryStore.js`: Verwaltet die Kategorien und Templates
- `templates/`: Enthält die Kategorie-Templates
- `shoppingList.ts`: Store für die Einkaufslisten (legacy, wird durch Composables ersetzt)

## Migrationsplan

Diese Stores werden schrittweise durch die kleineren, fokussierten Composables ersetzt, um die Anwendung modularer und wartbarer zu gestalten. Der CategoryStore wird vorerst beibehalten, da er die Kategorien-Templates zentral verwaltet.
