# Auto-Vervollständigung für Artikelnamen

Diese neue Funktion verbessert die Benutzererfahrung beim Hinzufügen neuer Artikel, indem sie basierend auf dem bisherigen Einkaufsverhalten intelligente Vorschläge macht.

## Implementierte Komponenten

### 1. `AutocompleteInput.vue`

Eine wiederverwendbare Komponente für Eingabefelder mit Vorschlägen:

- Zeigt Vorschläge während der Eingabe an
- Hebt übereinstimmende Textstellen hervor
- Vollständige Tastaturunterstützung (Pfeiltasten, Enter, Escape)
- Unterstützt optionale Zusatzinformationen in den Vorschlägen

### 2. `useItemSuggestions.ts`

Ein Composable, das Artikel-Vorschläge basierend auf der Nutzungshistorie bereitstellt:

- Speichert und verwaltet die Artikelhistorie im LocalStorage
- Verfolgt häufig gekaufte Artikel
- Erfasst typische Kategorien und Preise für jeden Artikel
- Bietet Vorschläge basierend auf Häufigkeit und letzter Verwendung

## Funktionsweise

1. **Datenerfassung**: Jeder hinzugefügte Artikel wird anonymisiert in einer lokalen Datenbank gespeichert
2. **Intelligente Analyse**: Die App analysiert Einkaufsmuster und lernt typische Artikel, Kategorien und Preise kennen
3. **Vorschläge bei Eingabe**: Bei der Eingabe eines Artikelnamens werden passende Vorschläge angezeigt
4. **Automatische Übernahme**: Bei Auswahl eines Vorschlags werden typische Kategorie und Preis automatisch vorausgefüllt

## Vorteile für den Benutzer

- Schnellere Eingabe: Reduziert Tippaufwand durch Vervollständigung
- Weniger Fehler: Konsistente Artikelnamen durch Vorschläge
- Zeitersparnis: Automatisches Ausfüllen von Kategorie und Preis
- Personalisierte Erfahrung: Vorschläge passen sich dem individuellen Einkaufsverhalten an

## Integration in bestehende Funktionen

Die Auto-Vervollständigung ist nahtlos in das bestehende Formular für neue Artikel integriert:

- Bei Fokus auf dem Eingabefeld werden beliebte Artikel angezeigt
- Bei Eingabe von mindestens 2 Zeichen werden passende Vorschläge gefiltert
- Übereinstimmende Teile im Text werden farblich hervorgehoben
- Die Anzahl der Vorschläge ist auf 6 begrenzt, um die Übersichtlichkeit zu wahren

## Technische Details

- Artikelhistorie wird im LocalStorage unter dem Schlüssel `itemHistory` gespeichert
- Pro Artikel werden maximal 10 Preispunkte gespeichert
- Die am häufigsten verwendete Kategorie wird für Vorschläge genutzt
- Vorschläge werden primär nach Häufigkeit und sekundär nach letzter Verwendung sortiert

## Nächste Schritte

- Erweiterung um Produktbilder
- Integration mit dem geplanten Preisvergleich-Feature
- Optimierung der Speichernutzung für große Datenmengen
- Möglichkeit zum manuellen Löschen von Einträgen aus dem Vorschlagsverlauf
