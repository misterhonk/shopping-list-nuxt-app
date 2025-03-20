# Phase 2 Refactoring: To-Do-Liste

Diese Liste enthält die geplanten Aufgaben für Phase 2 des Refactorings der Shopping-List-App. Jede Aufgabe sollte in einem eigenen Commit abgeschlossen werden.

## 1. Vereinfachung komplexer Funktionen

- [x] **1.1 Erstellung von `utils/listOperations.ts`**
  - [x] Gemeinsame Basisfunktionen für Listen- und Item-Operationen implementieren
  - [x] Funktionen für immutable Updates erstellen
  - [x] JSDoc-Dokumentation für alle Funktionen
  - [x] Commit: `refactor: Basisfunktionen für Listenoperationen erstellt`

- [x] **1.2 Refaktorierung von `useShoppingItems.ts`**
  - [x] Funktionen wie `addItem`, `removeItem`, `toggleItemChecked` vereinfachen
  - [x] Gemeinsame Logik durch Basisfunktionen ersetzen
  - [x] Prüfung und Verbesserung der Fehlerbehandlung
  - [x] Commit: `refactor: useShoppingItems vereinfacht durch Verwendung von Basisfunktionen`

- [x] **1.3 Refaktorierung von `useListManagement.ts`**
  - [x] Listenmanagement-Funktionen vereinfachen
  - [x] Duplizierte Logik entfernen
  - [x] Durchgängige Nutzung immutable Updates sicherstellen
  - [x] Commit: `refactor: useListManagement vereinfacht durch Verwendung von Basisfunktionen`

## 2. TypeScript strenger konfigurieren

- [x] **2.1 Erweiterte ESLint-Regeln für TypeScript**
  - [x] Konfiguration von `no-explicit-any` und anderen TypeScript-spezifischen Regeln
  - [x] Konfiguration von `explicit-function-return-type`
  - [x] Anpassung der ESLint-Konfiguration für bessere TypeScript-Unterstützung
  - [x] Commit: `chore: ESLint-Regeln für strikte TypeScript-Prüfung konfiguriert`

- [x] **2.2 Beseitigung von `any`-Typen**
  - [x] Durchsuchen des Codes nach `any`-Typen
  - [x] Ersetzen durch spezifische Typen oder `unknown` mit Type Guards
  - [x] Anmerkung: Bei der Codesuche wurden keine `any`-Typen im Code gefunden
  - [x] Commit: `refactor: any-Typen durch spezifische Typen ersetzt` (übersprungen, da nicht nötig)

## 3. Interfaces für alle Datenstrukturen definieren

- [x] **3.1 UI-Status-Interfaces definieren**
  - [x] Erstellung von `types/uiTypes.ts` für UI-spezifische Interfaces
  - [x] Definition von Interfaces für Formular-Zustände
  - [x] Definition von Interfaces für Filter-Optionen
  - [x] Commit: `feat: UI-Status-Interfaces für bessere Typsicherheit definiert`

- [x] **3.2 Validierungs-Utilities implementieren**
  - [x] Type Guards für wichtige Datenstrukturen erstellen
  - [x] Validierungsfunktionen für Benutzerinput implementieren
  - [x] Commit: `feat: Type Guards und Validierungsfunktionen für Datenstrukturen implementiert`

## 4. Core-Funktionalität klarer isolieren

- [x] **4.1 Service-Layer einführen**
  - [x] Verzeichnisstruktur für Services erstellen
  - [x] `ShoppingListService` implementieren
  - [x] `ItemService` implementieren 
  - [x] `CategoryService` implementieren
  - [x] Commit: `feat: Service-Layer für Geschäftslogik eingeführt`

- [x] **4.2 Storage-Repository implementieren**
  - [x] Interface für `StorageRepository` definieren
  - [x] `LocalStorageRepository` als Implementierung erstellen
  - [x] Tests für Storage-Funktionalität schreiben
  - [x] Commit: `feat: Repository-Pattern für Datenspeicherung implementiert` (im Rahmen von 4.1 erledigt)

- [x] **4.3 Composables auf Service-Layer umstellen**
  - [x] `useShoppingItems` auf Services umstellen
  - [x] `useListManagement` auf Services umstellen
  - [x] `useShoppingLists` auf Services umstellen
  - [x] Commit: `refactor: Composables auf Service-Layer umgestellt`

## Hinweise zur Umsetzung

1. **Schrittweise Vorgehen**: Jede Aufgabe sollte einzeln bearbeitet und getestet werden.
2. **Commits**: Für jede abgeschlossene Aufgabe einen separaten Commit erstellen.
3. **Tests**: Wo möglich, Tests für neue Funktionalität schreiben.
4. **Dokumentation**: Wichtige Funktionen mit JSDoc dokumentieren.
5. **Regressionstests**: Nach jeder Änderung sicherstellen, dass die App weiterhin funktioniert.

## Status und Fortschritt

- **Startdatum Phase 2.1**: 20.03.2025
- **Aktueller Status**: Phase 2 vollständig abgeschlossen! ✅
- **Nächste Phase**: Core-Funktionalität im Service-Layer weiter verbessern
- **Abgeschlossen**: 
  - Vereinfachung komplexer Funktionen (1.1 - 1.3)
  - TypeScript strenger konfigurieren (2.1 - 2.2)
  - UI-Status-Interfaces definieren (3.1)
  - Validierungs-Utilities implementieren (3.2)
  - Service-Layer einführen (4.1)
  - Storage-Repository implementieren (4.2)
  - Composables auf Service-Layer umstellen (4.3)
