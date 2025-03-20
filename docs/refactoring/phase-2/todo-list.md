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

- [ ] **4.1 Service-Layer einführen**
  - [ ] Verzeichnisstruktur für Services erstellen
  - [ ] `ShoppingListService` implementieren
  - [ ] `ItemService` implementieren 
  - [ ] `CategoryService` implementieren
  - [ ] Commit: `feat: Service-Layer für Geschäftslogik eingeführt`

- [ ] **4.2 Storage-Repository implementieren**
  - [ ] Interface für `StorageRepository` definieren
  - [ ] `LocalStorageRepository` als Implementierung erstellen
  - [ ] Tests für Storage-Funktionalität schreiben
  - [ ] Commit: `feat: Repository-Pattern für Datenspeicherung implementiert`

- [ ] **4.3 Composables auf Service-Layer umstellen**
  - [ ] `useShoppingItems` auf Services umstellen
  - [ ] `useListManagement` auf Services umstellen
  - [ ] `useShoppingLists` auf Services umstellen
  - [ ] Commit: `refactor: Composables auf Service-Layer umgestellt`

## Hinweise zur Umsetzung

1. **Schrittweise Vorgehen**: Jede Aufgabe sollte einzeln bearbeitet und getestet werden.
2. **Commits**: Für jede abgeschlossene Aufgabe einen separaten Commit erstellen.
3. **Tests**: Wo möglich, Tests für neue Funktionalität schreiben.
4. **Dokumentation**: Wichtige Funktionen mit JSDoc dokumentieren.
5. **Regressionstests**: Nach jeder Änderung sicherstellen, dass die App weiterhin funktioniert.

## Status und Fortschritt

- **Startdatum Phase 2.1**: 20.03.2025
- **Aktueller Fokus**: Service-Layer einführen (4.1)
- **Nächster Schritt**: Verzeichnisstruktur für Services erstellen
- **Abgeschlossen**: 
  - Vereinfachung komplexer Funktionen (1.1 - 1.3)
  - TypeScript strenger konfigurieren (2.1 - 2.2)
  - UI-Status-Interfaces definieren (3.1)
  - Validierungs-Utilities implementieren (3.2)
