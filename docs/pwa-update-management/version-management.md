# Versions-Management in der Shopping-List-App

Die Shopping-List-App implementiert ein zentralisiertes Versions-Management, um konsistente Versionsinformationen im gesamten System zu gewährleisten und zuverlässige Updates zu ermöglichen.

## Wichtige Komponenten des Versions-Managements

### 1. Zentrale Versionsdefinition

Die aktuelle App-Version wird an folgenden zentralen Stellen definiert:

1. **package.json**: Die offizielle Versionsnummer des Projekts:

   ```json
   {
     "name": "shopping-list-app",
     "version": "2.0.1",
     ...
   }
   ```

2. **services/updateService.ts**: Die Version für den App-Update-Mechanismus:
   ```typescript
   export const APP_VERSION = '2.0.1';
   ```

**WICHTIG**: Bei jedem Update müssen die Versionsnummern an beiden Stellen synchron gehalten werden!

### 2. Anzeige der Version

Die App-Version wird an verschiedenen Stellen angezeigt:

- **Footer**: Zeigt die aktuelle Version automatisch an durch Import aus dem `updateService`
- **Update-Benachrichtigung**: Zeigt die neue verfügbare Version bei Updates an

### 3. Version-Check-Mechanismus

Der Update-Service bietet folgende Funktionen für die Versionskontrolle:

- **getStoredVersion()**: Gibt die im localStorage gespeicherte Version zurück
- **storeVersion()**: Speichert die aktuelle Version im localStorage
- **checkForUpdates()**: Vergleicht die gespeicherte und aktuelle Version
- **applyUpdate()**: Aktualisiert die gespeicherte Version und lädt die App neu

## Update-Prozess

Bei der Veröffentlichung einer neuen Version:

1. Erhöhen Sie die Versionsnummer in **package.json**
2. Aktualisieren Sie die Versionsnummer in **services/updateService.ts**
3. Dokumentieren Sie die Änderungen im CHANGELOG.md
4. Bauen und deployen Sie die App

## Wichtige Hinweise

- Die Version folgt dem SemVer-Format: `MAJOR.MINOR.PATCH` (z.B. 2.0.1)
- Major-Version: Bedeutende Änderungen mit Inkompatibilitäten
- Minor-Version: Neue Features ohne Breaking Changes
- Patch-Version: Bugfixes und kleinere Verbesserungen

## Automatisierung

Für zukünftige Entwicklungen könnte ein Automatisierungsscript entwickelt werden, das die Versionen an allen erforderlichen Stellen synchron aktualisiert und ein Git-Tag setzt.
