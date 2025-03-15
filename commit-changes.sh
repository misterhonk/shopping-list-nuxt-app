#!/bin/bash
# Skript zum Speichern der Änderungen als Git-Commit

# Aktuelles Arbeitsverzeichnis
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)
echo "Arbeite in: $PROJECT_DIR"

# Status anzeigen
git status

# Änderungen hinzufügen
git add app.vue pages/index.vue

# Commit erstellen
git commit -m "Fix Pinia-Initialisierung und Struktur der index.vue-Datei

- Entfernung der manuellen Pinia-Initialisierung in app.vue
- Korrektur der index.vue-Datei für eine saubere Struktur
- Sicherstellung korrekter Template-ID-Zuweisung bei Listenauswahl"

# Status nach dem Commit anzeigen
echo -e "\nStatus nach dem Commit:"
git status
