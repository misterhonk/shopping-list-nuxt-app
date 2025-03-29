# Skripte für die Shopping-List-App

Dieser Ordner enthält Hilfsskripte für die Entwicklung und Wartung der Shopping-List-App.

## Verfügbare Skripte

### `replace-deprecated-types.sh`

Ein Hilfsskript zum Ersetzen veralteter Typdefinitionen im gesamten Projekt.

**Verwendung:**
```bash
# Führe das Skript aus dem Projektroot aus
chmod +x scripts/replace-deprecated-types.sh
./scripts/replace-deprecated-types.sh
```

**Hinweis:** Dieses Skript führt automatische Ersetzungen durch, kann aber nicht alle Typen korrekt ersetzen. Nach der Ausführung sollte das Projekt manuell überprüft werden.

## Dokumentation

### `type-migration.md`

Dokumentation zur Migration von veralteten Typdefinitionen zu den neuen, konsistenten Definitionen. Enthält Anleitungen und eine Referenztabelle für die Umstellung.

## Hinweise zur Verwendung

1. Alle Skripte sollten vom Projektroot-Verzeichnis aus ausgeführt werden, nicht innerhalb des `scripts`-Ordners.
2. Mache vor der Ausführung automatisierter Skripte immer einen Git-Commit oder eine Sicherung deines Projekts.
3. Nach der Ausführung automatisierter Skripte sollte der Code auf Fehler oder unerwartete Änderungen überprüft werden.
