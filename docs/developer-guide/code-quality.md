# Code-Qualität und Automatisierung

Diese Dokumentation beschreibt die automatisierten Prozesse, die in der Shopping-List-App für die Gewährleistung der Code-Qualität implementiert sind.

## Übersicht

Die Shopping-List-App verwendet verschiedene Tools und Verfahren zur Sicherstellung der Code-Qualität:

1. **ESLint**: Statische Code-Analyse für JavaScript/TypeScript/Vue
2. **Prettier**: Code-Formatierung
3. **TypeScript**: Typsicherheit
4. **Husky**: Git-Hooks-Integration
5. **lint-staged**: Optimierte Linting für Staged Files
6. **GitHub Actions**: Kontinuierliche Integration

## Setup und Verwendung

### Lokale Entwicklung

Bei der lokalen Entwicklung werden die folgenden automatisierten Checks ausgeführt:

- **Pre-commit Hook**: Vor jedem Commit werden Dateien mit ESLint und Prettier überprüft
- **Commit-Message Hook**: Validiert, dass Commit-Nachrichten dem Conventional Commits Standard folgen
- **Pre-push Hook**: Führt umfangreichere Prüfungen durch, bevor Code gepusht wird

### Verfügbare Befehle

Diese Befehle können manuell ausgeführt werden:

```bash
# Lint-Prüfung ausführen
npm run lint

# Lint-Probleme automatisch beheben
npm run lint:fix

# Code formatieren
npm run format

# Überprüfen, ob der Code korrekt formatiert ist
npm run format:check

# TypeScript-Typüberprüfung
npm run typecheck

# Alle Validierungen ausführen (Lint, Format, TypeScript)
npm run validate
```

## Git-Hooks

Die folgenden Git-Hooks sind mit Husky konfiguriert:

### pre-commit

Führt `lint-staged` aus, das:
- ESLint zur Fehlererkennung und -behebung für JS/TS/Vue-Dateien ausführt
- Prettier zur Formatierung für Code-Dateien verwendet

### commit-msg

Überprüft, ob die Commit-Nachricht dem Conventional Commits Standard folgt:
- Format: `<type>(<optional scope>): <description>`
- Typen: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test

Beispiele:
- `feat(ui): Füge neue Sidebar-Komponente hinzu`
- `fix: Behebe Fehler bei der Kategoriesortierung`
- `docs: Aktualisiere README mit Installationsanleitung`

### pre-push

Führt vor dem Push alle Validierungen aus:
- ESLint-Prüfung
- Prettier-Formatkontrolle
- TypeScript-Typüberprüfung

## Continuous Integration

Die GitHub Actions CI-Pipeline führt bei jedem Push oder Pull Request folgende Schritte aus:

1. Installation der Abhängigkeiten
2. ESLint-Prüfung
3. Prettier-Formatkontrolle
4. TypeScript-Typüberprüfung
5. Build-Prozess

## Formatierungs- und Lint-Regeln

### ESLint

Die ESLint-Konfiguration beinhaltet:
- TypeScript-Integration
- Vue 3 spezifische Regeln
- Import-Regeln für konsistente Modul-Importe
- Promise-Handling-Regeln
- SonarJS für Codequalität

### Prettier

Prettier ist für konsistente Formatierung konfiguriert:
- Einzelne Anführungszeichen
- 2-Zeichen-Einrückung
- Zeilenbreite von 100 Zeichen
- Semicolons
- Trailing Commas in ES5-Syntax

## Beitragende

Wenn Sie zum Projekt beitragen, sollten Sie:

1. Sicherstellen, dass Husky korrekt installiert ist (wird normalerweise mit `npm install` ausgeführt)
2. Alle Validierungsprüfungen bestehen, bevor Sie einen PR erstellen
3. Dem Conventional Commits Standard für Commit-Nachrichten folgen
4. TypeScript-Typen für neue Funktionen hinzufügen

## Fehlerbehebung

### Husky-Hooks werden nicht ausgeführt

Wenn die Git-Hooks nicht ausgeführt werden:

```bash
# Husky neu installieren
npm run prepare

# Überprüfen, ob die Hooks ausführbar sind
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### Übersprungen von Git-Hooks

In Ausnahmefällen können Git-Hooks übersprungen werden:

```bash
# Pre-commit-Hook überspringen
git commit --no-verify -m "feat: Dringende Änderung"

# Pre-push-Hook überspringen
git push --no-verify
```

**Hinweis**: Das Überspringen von Hooks sollte nur in Ausnahmefällen erfolgen.
