#!/bin/sh
# Skript zum Speichern aller Änderungen als Git-Commit

# Aktuelles Arbeitsverzeichnis
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)
echo "Arbeite in: $PROJECT_DIR"

# Status anzeigen
echo "Status vor dem Commit:"
git status

# Alle Änderungen hinzufügen
git add .

# Commit erstellen
git commit -m "Umfassende Aktualisierung der Einkaufslisten-App

- Entfernung der manuellen Pinia-Initialisierung in app.vue
- Vereinfachung und Struktur-Optimierung der index.vue-Datei
- Korrektur der Template-ID-Zuweisung bei Listenwechsel
- Integration der optimierten Kategorieverwaltung
- Verbesserung der Datenpersistenz durch bessere localStorage-Nutzung
- Hinzufügen von Hilfsskripts für die Einrichtung"

# Status nach dem Commit anzeigen
echo -e "\nStatus nach dem Commit:"
git status

echo -e "\nCommit erfolgreich erstellt. Änderungen können mit 'git push' hochgeladen werden."
