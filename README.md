# Shopping List App (v2.0.0)

Eine einfache Einkaufslisten-App mit Nuxt.js und Vue 3, die folgende Funktionen bietet:

## Features

- Mehrere Einkaufslisten erstellen und verwalten
- Artikel hinzufügen, abhaken und löschen
- Kategoriebasierte Darstellung der Artikel
- Flexibles Kategorie-Management mit verschiedenen Vorlagen
  - Vordefinierte Vorlagen für verschiedene Geschäftstypen (Supermarkt, Drogeriemarkt, Baumarkt, Elektronikmarkt)
  - Eigene Vorlagen erstellen und anpassen
  - Kategorien hinzufügen, bearbeiten und löschen
- Lokale Speicherung im Browser (localStorage)
- Responsive Design für alle Geräte

## Technologien

- Vue 3 / Nuxt 3 mit TypeScript
- Composition API
- Tailwind CSS
- Pinia State Management
- Service-orientierte Architektur
- Repository-Pattern für Datenzugriff

## Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist dann unter http://localhost:3000 verfügbar.

## Neue Kategoriesystem-Funktion

Die App enthält jetzt ein flexibles Kategoriesystem mit verschiedenen Vorlagen:

- **Supermarkt**: Standard-Einkaufskategorien für Lebensmittelgeschäfte
- **Drogeriemarkt**: Kategorien für Drogerieprodukte
- **Baumarkt**: Kategorien für Baumaterialien und Werkzeuge
- **Elektronikmarkt**: Kategorien für elektronische Produkte

Sie können diese Vorlagen verwenden, eigene erstellen oder bestehende anpassen. Jede Kategorie kann hinzugefügt, bearbeitet oder gelöscht werden.

## Versionierung

Die App folgt den Prinzipien der [Semantischen Versionierung](https://semver.org/lang/de/).

Aktuelle Version: **2.0.0**

Details zur Versionierungsstrategie finden Sie in der [Versionierungsdokumentation](docs/versioning-strategy.md).

Eine detaillierte Liste der Änderungen zwischen Versionen finden Sie im [Changelog](CHANGELOG.md).
