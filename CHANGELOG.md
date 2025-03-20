# Changelog

Alle wichtigen Änderungen der Shopping-List-App werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt der [Semantischen Versionierung](https://semver.org/lang/de/).

## [2.0.0] - 2025-03-20

### Geändert
- Umfassendes Refactoring der App-Architektur
- Einführung einer service-orientierten Architektur
- Implementierung des Repository-Patterns
- Klare Trennung von UI-Logik und Geschäftslogik

### Verbessert
- Verbesserte TypeScript-Integration
- Striktere TypeScript-Konfiguration
- Umfassende Interface-Definitionen für alle Datenstrukturen
- Vereinfachung komplexer Funktionen

### Hinzugefügt
- Neue Dokumentation für die Architektur
- Umfangreiche Docker-Deployment-Konfiguration
- Multi-Environment-Setup mit .env-Dateien
- Traefik-Integration für Reverse-Proxy und SSL

### Fehlerbehebungen
- Behoben: Import-Fehler 'Module does not provide named export Category'
- Korrigierte Import-Pfade
- Konsolidierung duplizierter Import/Export-Funktionalität

## [1.0.0] - 2025-01-15

### Hinzugefügt
- Erstversion der Shopping-List-App
- Grundlegende Funktionen zur Erstellung und Verwaltung von Einkaufslisten
- Offline-Funktionalität als Progressive Web App (PWA)
- Kategorie-Verwaltung für Artikel
- Dark Mode Unterstützung
- Responsive Design für mobile und Desktop-Geräte
