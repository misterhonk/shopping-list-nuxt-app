# Scripts für die Shopping-List-App

## Logger-Initialisierung hinzufügen (add-logger-init.js)

Dieses Skript durchsucht alle Vue-, TS- und JS-Dateien im Projekt und identifiziert solche, die `logger.`-Methoden verwenden, aber keine Logger-Initialisierung enthalten. Es fügt dann automatisch den erforderlichen Initialisierungscode hinzu.

### Verwendung

```bash
# Im Hauptverzeichnis des Projekts:
node scripts/add-logger-init.js
```

### Was das Skript macht

1. Es durchsucht rekursiv alle relevanten Dateien im Projekt
2. Es identifiziert Dateien, die `logger.`-Methoden aufrufen, aber keinen Logger initialisieren
3. Es fügt den entsprechenden Initialisierungscode hinzu:
   - Für Vue-Dateien: Nach dem `<script setup>`-Tag
   - Für TS/JS-Dateien: Am Anfang der Datei mit korrektem Import-Pfad

### Ignorierte Verzeichnisse

- `node_modules`
- `.git`
- `.nuxt`
- `.output`
- `dist`

### Beispiel-Output

```
Suche nach Dateien, die den Logger verwenden...
5 Dateien gefunden, die den Logger verwenden aber nicht initialisieren.

Füge Logger-Initialisierung hinzu...

Ergebnis: 5 von 5 Dateien erfolgreich bearbeitet.

Bearbeitete Dateien:
- components/CategoryList.vue
- composables/useShoppingList.ts
- pages/about.vue
- plugins/auth.ts
- stores/cart.ts
```

### Fehlerbehebung

Wenn Fehler auftreten, werden diese am Ende der Ausführung angezeigt. In diesem Fall kann die betroffene Datei manuell korrigiert werden.
