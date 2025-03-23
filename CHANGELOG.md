# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt befolgt [Semantische Versionierung](https://semver.org/lang/de/spec/v2.0.0.html).

## [2.0.1] - 2025-03-21

### Hinzugefügt

- PWA Update-Mechanismus zur automatischen Erkennung neuer App-Versionen
- UpdateNotification-Komponente zur Benachrichtigung der Benutzer über neue Versionen
- Service Worker-Optimierungen für zuverlässigere Updates
- Version-Check-Plugin zur Versionsverwaltung

### Geändert

- PWA-Konfiguration in nuxt.config.ts für besseres Cache-Management
- Optimierte Cache-Strategien für verschiedene Asset-Typen
- Service Worker aktiviert skipWaiting() und clients.claim() für sofortige Updates

### Technische Details

- Implementierung von App-Version-Management mit localStorage
- Automatische Erkennung und Anwendung von Updates
- Verbesserte Benutzer-Erfahrung durch klare Update-Benachrichtigungen

## [2.0.0] - 2025-03-20

### Hinzugefügt

- Service-Layer und Repository-Pattern für verbesserte Architektur
- Umfassende TypeScript-Interface-Definitionen für bessere Typsicherheit
- Klare Trennung von UI-Logik und Geschäftslogik

### Geändert

- Vollständiges Refactoring von Composables zur Verwendung des Service-Layers
- Verbesserte Architektur mit klaren Verantwortlichkeiten
- Umfassende Dokumentation des neuen Architekturansatzes

### Technische Details

- Migration zu service-orientierter Architektur
- Verbesserte Testbarkeit durch klare Schnittstellen
- Angepasste Projektstruktur für bessere Skalierbarkeit

## [1.0.0] - 2025-03-10

### Hinzugefügt

- Erste stabile Version der Shopping-List-App
- Unterstützung für mehrere Einkaufslisten
- Kategoriebasierte Organisation von Artikeln
- Offline-Funktionalität durch PWA-Implementierung
- Responsive Design für mobile und Desktop-Nutzung
