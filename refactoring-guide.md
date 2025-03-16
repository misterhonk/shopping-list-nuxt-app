# Refactoring-Guide für die Shopping-List-App

Dieses Dokument erklärt die durchgeführte Code-Restrukturierung und gibt Anleitung für die weitere Entwicklung.

## Übersicht der Änderungen

Die App wurde grundlegend restrukturiert, um einen modularen, wartbaren Code zu ermöglichen:

1. **Composables statt monolithischer Store**: Die Geschäftslogik wurde in kleine, fokussierte Composables aufgeteilt
2. **Logische Gruppierung**: Zusammenhängende Funktionen wurden in thematischen Unterordnern gruppiert
3. **Klare Trennung der Verantwortlichkeiten**: Jede Datei hat einen klaren, eng definierten Aufgabenbereich

## Neue Struktur der Composables

```
composables/
├── core/
│   └── useLocalStorage.js       # Basis-Funktionen für localStorage
├── shoppingList/
│   ├── useListManagement.js     # Grundoperationen für Listen
│   ├── useListProperties.js     # Eigenschaften von Listen
│   └── index.js                 # Export der Liste-Funktionen
├── shoppingItems/
│   ├── useItemManagement.js     # Grundoperationen für Artikel
│   ├── useItemForm.js           # Formular-Verwaltung
│   ├── useItemAnalytics.js      # Statistik und Berechnungen
│   └── index.js                 # Export der Artikel-Funktionen
├── importExport/
│   ├── useListExport.js         # Export von Listen
│   ├── useListImport.js         # Import von Listen
│   └── index.js                 # Export der Import/Export-Funktionen
└── index.js                     # Zentrale Export-Datei
```

## Vorteile des neuen Aufbaus

1. **Bessere Wartbarkeit**: Kleinere Dateien sind leichter zu verstehen und zu warten
2. **Einfachere Erweiterbarkeit**: Neue Funktionen können in passende Module eingefügt werden
3. **Verbesserte Testbarkeit**: Isolierte Funktionen lassen sich gezielt testen
4. **Bessere Wiederverwendbarkeit**: Funktionen können genau dort importiert werden, wo sie benötigt werden

## Verwendungsbeispiel

```javascript
// Alte Methode
import { useShoppingLists } from '../composables/useShoppingLists';
import { useShoppingItems } from '../composables/useShoppingItems';

// Neue Methode (über zentrale Export-Datei)
import { useShoppingLists, useShoppingItems, useListImportExport } from '../composables';
```

## Weitere Schritte für die Migration

1. **Vue-Komponenten umstellen**: `index-refactored.vue` zeigt, wie die Umstellung erfolgen kann
2. **Weitere Funktionalitäten modularisieren**: Die CategoryStore-Logik könnte ähnlich aufgeteilt werden
3. **TypeScript einführen**: Die Composables könnten mit TypeScript typisiert werden für bessere Entwicklererfahrung
4. **Tests schreiben**: Unit-Tests für die einzelnen Composables entwickeln
5. **Dokumentation ausbauen**: JSDoc für alle Funktionen ergänzen

## Allgemeine Richtlinien für die Weiterentwicklung

1. **Eine Datei = Eine Verantwortlichkeit**: Jede Datei sollte genau einen Aspekt der Anwendung abdecken
2. **Kleine Funktionen**: Funktionen sollten idealerweise nicht mehr als 20-30 Zeilen umfassen
3. **Klare Abhängigkeiten**: Abhängigkeiten sollten explizit als Parameter übergeben werden
4. **Kompatibilität wahren**: Achte auf eine konsistente API, um Breaking Changes zu vermeiden
5. **Dokumentation aktuell halten**: Bei jeder Änderung die Dokumentation anpassen

## Testen der Änderungen

Schritte zum Testen der Refactorierung:

1. Die Website mit den bestehenden Dateien starten (Original-Code)
2. Nach erfolgreicher Überprüfung der Basisfunktionalität:
   - `index.vue` umbenennen zu `index.vue.bak`
   - `index-refactored.vue` zu `index.vue` umbenennen
3. Die Website mit der refactorierten Version testen
4. Bei Problemen die Original-Dateien wiederherstellen und Fehler beheben
