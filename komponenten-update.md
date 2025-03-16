# Shopping-List-App: Update des Import-Systems

## Implementierte Funktionen

1. **Erweiterte Import-Optionen**
   - Neue Importfunktion mit der Möglichkeit zu wählen:
     - Neue Liste erstellen
     - Bestehende Liste aktualisieren
   - Bei der Aktualisierung einer bestehenden Liste:
     - Artikel hinzufügen (vorhandene behalten)
     - Alle Artikel ersetzen

2. **Verbesserte Benutzeroberfläche**
   - Neuer Optionen-Dialog für den Import
   - Automatische Vorauswahl einer passenden Liste, falls der Name übereinstimmt
   - Anzeige der Artikelanzahl in den Listen zur besseren Übersicht

3. **Robustere ID-Generierung**
   - Listen und Artikel haben jetzt eindeutige, präfixbasierte IDs
   - Listenelemente nutzen ein anderes ID-Format als Listen selbst
   - Dies verhindert das vorherige Problem mit dem Löschen von Listen

## Verwendung

1. Klicken Sie auf "Liste importieren" im Menü
2. Wählen Sie die zu importierende JSON-Datei
3. Im erscheinenden Dialog wählen Sie:
   - "Neue Liste erstellen" oder
   - "Bestehende Liste aktualisieren" mit zusätzlicher Auswahl der Liste und des Update-Modus

## Implementierungsdetails

### Im Backend

- Neue Composables für das Update bestehender Listen
- Verbesserte ID-Generierung mit Präfixen und Zufallskomponenten
- Zwei Update-Modi: "append" (hinzufügen) und "replace" (ersetzen)

### In der Benutzeroberfläche

- Neuer modaler Dialog: `ImportOptionsModal.vue`
- Verbesserte Auswahl für den Import
- Automatische Vorauswahl bei Namensübereinstimmung

## Nächste Schritte

- Integration von Drag & Drop für Datei-Import
- Import aus anderen Formaten (CSV, etc.)
- Export-Optionen erweitern
- Automatisches Zusammenführen von doppelten Einträgen
