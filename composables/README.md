# Composables

Diese Directory enthält die Vue Composables (Composition API), die die Geschäftslogik der Anwendung implementieren.

## Struktur

### Core

- `core/useLocalStorage.js`: Grundlegende Funktionen für die Interaktion mit dem localStorage

### Einkaufslisten

- `shoppingList/useListManagement.js`: Basisoperationen für Einkaufslisten (Erstellen, Auswählen, Löschen)
- `shoppingList/useListProperties.js`: Verwaltung von Listeneigenschaften (Name, Favoriten-Status)
- `shoppingList/index.js`: Zentrale Exportdatei für Listenfunktionen

### Einkaufsartikel

- `shoppingItems/useItemManagement.js`: Basisoperationen für Artikel (Hinzufügen, Entfernen, Abhaken)
- `shoppingItems/useItemForm.js`: Formularverwaltung für das Hinzufügen von Artikeln
- `shoppingItems/useItemAnalytics.js`: Berechnungen und Statistiken zu Artikeln (Preise, Mengen)
- `shoppingItems/index.js`: Zentrale Exportdatei für Artikelfunktionen

### Import/Export

- `importExport/useListExport.js`: Funktionen zum Exportieren von Listen als JSON
- `importExport/useListImport.js`: Funktionen zum Importieren von Listen aus JSON
- `importExport/index.js`: Zentrale Exportdatei für Import/Export-Funktionen

## Verwendung

Die Composables können über die zentrale `index.js` importiert werden:

```javascript
import { useShoppingLists, useShoppingItems, useListImportExport } from '../composables';

// In Vue-Komponenten
const { lists, currentList, createList } = useShoppingLists();
const { allItems, addNewItem, toggleItemChecked } = useShoppingItems(lists, currentList.id);
```

## Vorteile dieser Struktur

- **Modularität**: Klare Trennung der Verantwortlichkeiten
- **Wiederverwendbarkeit**: Einzelne Funktionen können in verschiedenen Komponenten genutzt werden
- **Testbarkeit**: Kleinere Einheiten sind einfacher zu testen
- **Wartbarkeit**: Überschaubare Dateien mit einem klaren Fokus
