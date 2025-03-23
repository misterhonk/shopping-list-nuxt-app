# PWA Update-Mechanismus Testanleitung

Nach der Implementierung des verbesserten PWA-Update-Mechanismus ist es wichtig, diesen gründlich zu testen. Diese Anleitung beschreibt die Testprozedur und gibt Hinweise zur Behebung möglicher Probleme.

## Voraussetzungen

- Smartphone oder Computer mit modernem Browser (Chrome, Firefox, Safari, Edge)
- Die PWA muss zuvor installiert oder besucht worden sein

## Testszenarien

### 1. Basis-Update-Test

Dieser Test prüft, ob die App den Benutzer über Updates informiert:

1. **Setup**:

   - Die alte App-Version in Chrome/Firefox öffnen (dies ist bereits der Fall beim Benutzer)
   - Sicherstellen, dass der Service Worker aktiviert ist

2. **Durchführung**:

   - Erhöhen der Version in `package.json` auf `2.0.1` ✅
   - Aktualisieren der Version in `updateService.ts` auf `2.0.1` ✅
   - Rebuild und Deploy der App
   - App in einem neuen Tab öffnen

3. **Erwartetes Ergebnis**:
   - Update-Benachrichtigung erscheint, die den Benutzer über die neue Version informiert
   - Nach Klick auf "Jetzt aktualisieren" wird die App neu geladen
   - Die neue Version wird korrekt angezeigt

### 2. Service Worker Update-Test

Dieser Test prüft, ob der Service Worker korrekt aktualisiert wird:

1. **Setup**:

   - Chrome DevTools öffnen
   - Zur Registerkarte "Application" → "Service Workers" navigieren

2. **Durchführung**:

   - Eine kleine Änderung an einer Vue-Komponente vornehmen
   - Rebuild und Deploy der App
   - Prüfen, ob ein neuer Service Worker registriert wird

3. **Erwartetes Ergebnis**:
   - Ein neuer Service Worker sollte als "waiting" angezeigt werden
   - Nach Klick auf "Jetzt aktualisieren" wird der neue Service Worker aktiviert
   - Die App wird neu geladen und zeigt die neue Version

### 3. Offline-Funktionalität nach Update

Dieser Test prüft, ob die App auch nach Updates offline funktionsfähig bleibt:

1. **Setup**:

   - App auf dem Gerät öffnen und verwenden
   - Ein Update durchführen (wie in Test 1)

2. **Durchführung**:

   - Nach dem Update den Flugmodus aktivieren / Netzwerkverbindung trennen
   - App erneut öffnen/neu laden

3. **Erwartetes Ergebnis**:
   - App sollte auch offline funktionieren
   - Vorher gespeicherte Daten sollten weiterhin verfügbar sein

### 4. Automatischer Update-Test

Dieser Test prüft das automatische Update-Verhalten:

1. **Setup**:

   - App in einem Browser-Tab geöffnet lassen
   - In einem anderen Tab/Browser die Entwicklertools öffnen

2. **Durchführung**:

   - Eine Änderung an der App vornehmen und deployen
   - Zum ursprünglichen Tab zurückkehren und die App eine Weile verwenden

3. **Erwartetes Ergebnis**:
   - Die Update-Benachrichtigung sollte automatisch erscheinen

## Fehlerbehebung

### Problem: Update-Benachrichtigung erscheint nicht

1. **Überprüfen der Version**:

   - Sicherstellen, dass die Versionen in `package.json` und `updateService.ts` übereinstimmen und aktualisiert wurden

2. **Service Worker Check**:

   - In Chrome: DevTools → Application → Service Workers
   - Prüfen, ob ein Service Worker aktiv ist und ob ein Update verfügbar ist

3. **Cache-Löschen**:
   - Chrome: DevTools → Application → Clear Storage → "Clear site data"
   - Seite neu laden und testen

### Problem: App wird nach Update nicht aktualisiert

1. **Force Reload**:

   - Manuelles Neuladen der Seite (Shift+F5 oder Cmd+Shift+R)

2. **Service Worker Check**:

   - In Chrome: DevTools → Application → Service Workers
   - "Unregister" den aktuellen Service Worker
   - Seite neu laden

3. **localStorage prüfen**:
   - In Chrome: DevTools → Application → localStorage
   - Prüfen, ob die gespeicherte Version korrekt aktualisiert wurde

## Testprotokoll

Für jeden Test sollte dokumentiert werden:

- Datum und Uhrzeit
- Testgerät und Browser
- Durchgeführte Schritte
- Ergebnisse (erfolgreich/fehlgeschlagen)
- Bei Fehlern: Beschreibung und Screenshots

## Automatisierung

Für zukünftige Updates wird empfohlen:

1. Ein automatisiertes Skript zu erstellen, das:

   - Die Version in allen relevanten Dateien aktualisiert
   - Ein Git-Tag für die neue Version erstellt
   - Den Build- und Deploy-Prozess startet

2. Einen automatisierten Test zu implementieren, der:
   - Die Update-Funktionalität prüft
   - Die korrekte Anzeige der Update-Benachrichtigung testet
   - Die Offline-Funktionalität nach Updates validiert
