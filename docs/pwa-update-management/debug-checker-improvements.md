# Version-Checker Optimierung

## Übersicht

Der Debug-Version-Checker wurde überarbeitet, um die Benutzeroberfläche der App nicht zu stören und gleichzeitig wertvolle Informationen für Entwickler bereitzustellen.

## Problembeschreibung

Der ursprüngliche Version-Checker hatte folgende Probleme:

- Position in der oberen rechten Ecke störte wichtige UI-Elemente
- Dauerhaft sichtbar und nahm zu viel Platz ein
- Zeigte zu viele Informationen auf einmal
- Verwendete eine veraltete Version statt der zentralen APP_VERSION

## Umsetzung

### 1. Positionierung

Der Version-Checker wurde von der oberen rechten Ecke (wo er die Hauptfunktionalität der App störte) in die untere rechte Ecke verschoben, direkt über dem Footer. Dies sorgt für:

- Weniger Überlagerung der Hauptfunktionen
- Besser integriertes Erscheinungsbild
- Konsistente Platzierung mit anderen Benachrichtigungen

Neue Position: `fixed bottom-14 right-4`

### 2. Kollabierbare Ansicht

Der Checker ist jetzt standardmäßig minimiert und kann bei Bedarf erweitert werden:

- Im minimierten Zustand zeigt er nur "Debug-Info"
- Ein Toggle-Button ermöglicht das Aus- und Einklappen
- Die ausführlichen Informationen werden nur bei Bedarf angezeigt

Implementierung:

```vue
<div v-if="isExpanded">
  <p><strong>Version:</strong> {{ appVersion }}</p>
  <p><strong>Host:</strong> {{ hostname }}</p>
  <p><strong>SW:</strong> {{ hasSW ? 'Aktiv' : 'Inaktiv' }}</p>
  <p><strong>Stored:</strong> {{ storedVersion || 'Keine' }}</p>
  <p><strong>Build:</strong> {{ buildTime.split('T')[0] }}</p>
</div>
```

### 3. Kompakteres Design

Die Anzeige wurde kompakter gestaltet:

- Kleinere Schriftgröße (`text-xs`)
- Kürzere Bezeichnungen
- Optimiertes Datumsformat (nur Datum, keine Uhrzeit)
- Verbesserte visuelle Hierarchie

### 4. Verwendung der zentralen Versionsverwaltung

Der Version-Checker verwendet jetzt die zentrale Version aus dem updateService, wodurch:

- Konsistenz in der gesamten Anwendung gewährleistet wird
- Bei Updates nur eine Stelle geändert werden muss
- Die korrekte aktuelle Version angezeigt wird

```typescript
import { APP_VERSION, getStoredVersion } from '~/services/updateService';
```

## Verbessertes Debug-Plugin

Zusätzlich wurde das Debug-Plugin aktualisiert, um die Konsistenz der Versionsnummer zu gewährleisten:

```typescript
// Debug-Plugin aktualisiert
import { APP_VERSION } from '~/services/updateService';

// ...

return {
  provide: {
    debug: {
      // Aktuelle Version aus dem zentralen Service importieren
      version: APP_VERSION,
      // ...
    },
  },
};
```

## Vorteile

- Verbesserte Benutzererfahrung durch weniger visuelle Störung
- Nützlichere Debug-Informationen an einem diskreteren Ort
- Konsistente Versionierung in der gesamten Anwendung
- Bessere Balance zwischen Debuggability und UI-Design
