# Implementierungsplan: Laufweg-Sortierung und individuelle Kategorie-Anordnung

Dieses Dokument beschreibt den Plan zur Implementierung der marktspezifischen Laufweg-Sortierung und Drag & Drop-Funktionalität für die Shopping-List-App.

## Übersicht der Anforderungen

- Standard-Reihenfolge der Kategorien pro Markttyp, die dem typischen Laufweg entspricht
- Drag & Drop Funktionalität zur individuellen Anpassung der Kategorienreihenfolge
- Möglichkeit zwischen Standard-Sortierung und individueller Sortierung zu wechseln
- Robuste Fallback-Mechanismen (alphabetische Sortierung etc.)

## Implementierungsphasen

### Phase 1: Datenmodell und Standard-Sortierungen

- [ ] **Erweiterung des Datenmodells**

  - [ ] `Category`-Interface um `position`-Feld erweitern
  - [ ] `Template`-Interface um `defaultCategoryOrder` erweitern
  - [ ] Neues Interface `CategorySortConfig` für Benutzereinstellungen

- [ ] **Definition der Standard-Laufwege**
  - [ ] Für Supermarkt-Vorlage typischen Laufweg definieren
  - [ ] Für Baumarkt-Vorlage typischen Laufweg definieren
  - [ ] Für Drogerie-Vorlage typischen Laufweg definieren
  - [ ] Für Elektronikmarkt-Vorlage typischen Laufweg definieren
  - [ ] Weitere Markttypen nach Bedarf

### Phase 2: State Management

- [ ] **Pinia Store erweitern**

  - [ ] Erweiterung des Category/Template-Stores um Sortierungskonfiguration
  - [ ] Methoden zum Speichern/Laden benutzerdefinierter Sortierungen implementieren
  - [ ] Toggle-Funktion zwischen Standard- und individueller Sortierung hinzufügen
  - [ ] Persistenz der Einstellungen im localStorage implementieren

- [ ] **Sortierlogik implementieren**
  - [ ] Funktion zum Sortieren der Kategorien nach definierter Reihenfolge
  - [ ] Fallback-Logik für neue/unbekannte Kategorien (alphabetisch oder am Ende)
  - [ ] Unit-Tests für Sortierlogik schreiben

### Phase 3: Drag & Drop UI

- [ ] **Integration von vue-draggable-next**

  - [ ] Bibliothek installieren und konfigurieren
  - [ ] Drag & Drop-Komponente für Kategoriensortierung erstellen
  - [ ] Styling der Drag & Drop-Elemente für konsistente UI

- [ ] **Konfigurationsansicht**
  - [ ] Neue Einstellungsseite oder Modal für Sortierungskonfiguration
  - [ ] Toggle-Button für Umschaltung zwischen Standard/individueller Sortierung
  - [ ] Speichern/Zurücksetzen-Buttons für Benutzereinstellungen
  - [ ] Vorschau der aktuellen Sortierung

### Phase 4: Integration in die Einkaufsliste

- [ ] **Sortierung in bestehenden Komponenten**

  - [ ] ListItem-Komponenten anpassen, um neue Sortierreihenfolge zu nutzen
  - [ ] Gruppierung nach Kategorien entsprechend der Sortierung anpassen
  - [ ] Performance-Optimierungen für größere Listen

- [ ] **UI-Verbesserungen**
  - [ ] Visuelle Hinweise auf die aktuelle Sortierungsmethode
  - [ ] Schnellzugriff auf Sortierungseinstellungen in der Listenansicht
  - [ ] Responsive Design-Anpassungen für mobile Geräte

### Phase 5: Testing und Dokumentation

- [ ] **Tests**

  - [ ] Tests für Default-Sortierungen verschiedener Markttypen
  - [ ] Tests für Drag & Drop-Funktionalität
  - [ ] Tests für Persistenz der individuellen Sortierung
  - [ ] Tests für Edge Cases (neue Kategorien, gelöschte Kategorien)

- [ ] **Dokumentation**
  - [ ] Technische Dokumentation der neuen Features
  - [ ] Benutzerhandbuch-Update für die neue Funktionalität
  - [ ] Kommentare im Code für bessere Wartbarkeit

## Technische Details

### Vorgeschlagene Interface-Erweiterungen

```typescript
// types.ts
export interface Category {
  id: string;
  name: string;
  position?: number; // Optional für Abwärtskompatibilität
}

export interface Template {
  id: string;
  name: string;
  categories: Category[];
  defaultCategoryOrder: string[]; // Array von Category-IDs in der Standard-Reihenfolge
}

export interface CategorySortConfig {
  templateId: string;
  useCustomSort: boolean;
  customOrder: string[]; // Array von Category-IDs in benutzerdefinierter Reihenfolge
}
```

### Store-Erweiterungen (Konzept)

```typescript
export const useCategoryStore = defineStore('category', {
  state: () => ({
    // ... bestehender State
    sortConfigs: {} as Record<string, CategorySortConfig>,
  }),
  actions: {
    // ... bestehende Actions
    saveSortConfig(config: CategorySortConfig) {
      this.sortConfigs[config.templateId] = config;
      // Persistenz im localStorage
    },
    toggleSortMode(templateId: string) {
      const config = this.sortConfigs[templateId] || {
        templateId,
        useCustomSort: false,
        customOrder: [],
      };
      config.useCustomSort = !config.useCustomSort;
      this.saveSortConfig(config);
    },
    updateCustomOrder(templateId: string, newOrder: string[]) {
      const config = this.sortConfigs[templateId] || {
        templateId,
        useCustomSort: true,
        customOrder: [],
      };
      config.customOrder = newOrder;
      config.useCustomSort = true; // Automatisch auf benutzerdefiniert umstellen
      this.saveSortConfig(config);
    },
  },
  getters: {
    // ... bestehende Getters
    getCategoriesSorted: state => (templateId: string) => {
      // Logik zur Sortierung basierend auf Config
      // Falls keine Config, Default-Reihenfolge des Templates verwenden
      // Falls keine Default-Reihenfolge, alphabetisch sortieren
    },
  },
});
```
