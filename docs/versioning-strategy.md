# Versionierungsstrategie für Shopping-List-App

## Überblick

Dieses Dokument beschreibt die Versionierungsstrategie für die Shopping-List-App. Wir verwenden [Semantische Versionierung (SemVer)](https://semver.org/lang/de/) als Grundlage für unsere Versionierung.

## Versionierungsformat

Die Versionsnummern folgen dem Format `MAJOR.MINOR.PATCH[-BEZEICHNER]`.

### Komponenten

- **MAJOR**: Wird erhöht, wenn inkompatible API-Änderungen vorgenommen werden
- **MINOR**: Wird erhöht, wenn Funktionalität in einer abwärtskompatiblen Art hinzugefügt wird
- **PATCH**: Wird erhöht, wenn abwärtskompatible Bugfixes implementiert werden
- **BEZEICHNER**: Optionaler Bezeichner für Pre-Releases (z.B. alpha, beta, rc)

## Aktuelle Version

Die aktuelle Version ist **2.0.0**. 

Diese Major-Version-Erhöhung spiegelt die umfangreichen Refactoring-Maßnahmen wider, insbesondere:
- Die Umstellung auf eine service-orientierte Architektur
- Die Implementierung des Repository-Patterns
- Die verbesserte TypeScript-Integration
- Die Trennung von UI-Logik und Geschäftslogik

## Versionssprünge

### Major-Version (X.0.0)
Eine Major-Version wird erhöht, wenn:
- Breaking Changes in der API oder der Datenstruktur eingeführt werden
- Eine umfassende Neugestaltung der Architektur erfolgt
- Grundlegende Änderungen im Bedienkonzept eingeführt werden
- Die Anwendung um fundamental neue Konzepte erweitert wird

### Minor-Version (0.X.0)
Eine Minor-Version wird erhöht, wenn:
- Neue Features hinzugefügt werden, die keine Breaking Changes verursachen
- Bestehende Funktionalität erweitert wird
- Öffentliche API-Funktionen als veraltet markiert werden
- Substanzielle neue Funktionen hinzugefügt werden

### Patch-Version (0.0.X)
Eine Patch-Version wird erhöht, wenn:
- Bugfixes implementiert werden
- Leistungsoptimierungen ohne Änderung des Verhaltens vorgenommen werden
- Kleine UI-Anpassungen vorgenommen werden
- Dokumentation aktualisiert wird
- Refactoring ohne Verhaltensänderung durchgeführt wird

## Pre-Release Kennzeichnungen

Für Features, die noch in der Entwicklung sind, verwenden wir die folgenden Kennzeichnungen:

- **alpha**: Frühe Entwicklungsversionen, möglicherweise instabil
- **beta**: Feature-vollständige Versionen für Testzwecke
- **rc** (Release Candidate): Potenzielle finale Versionen für letzte Tests

Beispiel: `2.1.0-alpha.1`, `2.1.0-beta.3`, `2.1.0-rc.2`

## Changelog

Ein Changelog wird in der Datei `CHANGELOG.md` gepflegt, um Änderungen zwischen Versionen zu dokumentieren.

## Versionswechsel für kommende Features

Basierend auf unserer Roadmap sind folgende Versionssprünge geplant:

- **2.1.0**: Implementierung der Preisverfolgung
- **2.2.0**: Verbessertes Artikelmanagement
- **2.3.0**: Statistik-Dashboard
- **2.4.0**: Preisvergleich
- **2.5.0**: Sharing & Kollaboration
- **3.0.0**: Backend-Integration (Major-Version wegen grundlegendem Architekturwechsel)

## Verwaltung der Versionsnummer

Die Versionsnummer wird in folgenden Dateien gepflegt:
- `package.json` (Hauptquelle)
- `CHANGELOG.md` (Dokumentation der Änderungen)
- Git-Tags für jede veröffentlichte Version

## Git-Branching-Strategie in Verbindung mit Versionierung

- `main`: Enthält immer die neueste stabile Version
- `develop`: Entwicklungszweig für die nächste Version
- `feature/x`: Temporäre Branches für Feature-Entwicklung
- `release/x.y.z`: Branch für Release-Vorbereitung
- `hotfix/x.y.z`: Branch für dringende Bugfixes

## Verantwortlichkeiten

Die Entscheidung über Major- und Minor-Versionserhöhungen wird im Team getroffen und muss dokumentiert werden.
