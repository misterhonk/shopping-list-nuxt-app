# Empfohlene VS Code-Erweiterungen

Diese Dokumentation beschreibt die empfohlenen VS Code-Erweiterungen für die Entwicklung an der Shopping-List-App.

## Automatische Erweiterungsempfehlungen

VS Code wird automatisch empfohlene Erweiterungen vorschlagen, wenn Sie den Projektordner öffnen. Diese Empfehlungen sind in der `.vscode/extensions.json`-Datei definiert.

## Kernempfehlungen

### Vue.js Entwicklung
- **Vue Language Features (Volar)** (`vue.volar`)
  - Offizielle Vue.js Erweiterung für VS Code
  - Syntax-Hervorhebung, Intellisense und mehr
  - Ersetzt die ältere Vetur-Erweiterung

- **TypeScript Vue Plugin (Volar)** (`vue.vscode-typescript-vue-plugin`)
  - Verbesserte TypeScript-Integration für Vue-Dateien
  - Ergänzt Volar für die Arbeit mit Vue und TypeScript

### Code-Qualität
- **ESLint** (`dbaeumer.vscode-eslint`)
  - Zeigt ESLint-Fehler und -Warnungen direkt im Editor an
  - Integriert sich in unsere ESLint-Konfiguration
  - Kann Probleme automatisch beim Speichern korrigieren

- **Prettier** (`esbenp.prettier-vscode`)
  - Formatiert Code automatisch gemäß unserer Prettier-Konfiguration
  - Unterstützt alle im Projekt verwendeten Dateitypen
  - Empfohlen mit Format-On-Save aktiviert

- **Error Lens** (`usernamehw.errorlens`)
  - Zeigt Fehler und Warnungen direkt im Code an
  - Verbessert die Sichtbarkeit von Problemen

- **Code Spell Checker** (`streetsidesoftware.code-spell-checker`)
  - Erkennt Tippfehler in Code und Kommentaren
  - Reduziert die Anzahl der Rechtschreibfehler im Code

### CSS und Styling
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
  - Autovervollständigung für Tailwind CSS-Klassen
  - Linting und Hover-Vorschau für Tailwind
  - Speziell für unser Tailwind-Setup konfiguriert

- **Stylelint** (`stylelint.vscode-stylelint`)
  - Linting für CSS und SCSS
  - Erkennt Probleme in Stilregeln
  - Kann Probleme automatisch korrigieren

### Umgebungskonfiguration
- **.ENV** (`mikestead.dotenv`)
  - Syntax-Hervorhebung für .env-Dateien
  - Unterstützt die verschiedenen Umgebungskonfigurationen

- **YAML** (`redhat.vscode-yaml`)
  - Unterstützung für YAML-Dateien
  - Besonders nützlich für GitHub Actions und Docker-Konfigurationen

- **EditorConfig** (`editorconfig.editorconfig`)
  - Konsistente Formatierung über verschiedene Editoren hinweg
  - Verwendet die .editorconfig-Datei des Projekts

### DevOps
- **GitHub Actions** (`github.vscode-github-actions`)
  - Syntax-Hervorhebung für GitHub Actions Workflows
  - IntelliSense für YAML-basierende GitHub Actions

- **Docker** (`ms-azuretools.vscode-docker`)
  - Unterstützung für Docker und Docker Compose
  - Syntax-Hervorhebung für Dockerfiles
  - Container-Management direkt aus VS Code

### Zusätzliche Hilfsmittel
- **Version Lens** (`pflannery.vscode-versionlens`)
  - Zeigt Versionsinformationen für Abhängigkeiten an
  - Erleichtert das Aktualisieren von npm-Paketen

## Setup-Anleitung

1. Öffnen Sie VS Code
2. Klicken Sie auf das Erweiterungssymbol in der Seitenleiste
3. Suchen Sie nach den empfohlenen Erweiterungen und installieren Sie sie
4. Alternativ können Sie auch auf die Benachrichtigung klicken, die VS Code anzeigt, wenn empfohlene Erweiterungen verfügbar sind

## Konfigurationsempfehlungen

Für eine optimale Entwicklungserfahrung empfehlen wir folgende Einstellungen in VS Code:

1. Öffnen Sie die Einstellungen (File > Preferences > Settings oder `Ctrl+,`)
2. Aktivieren Sie folgende Einstellungen:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ],
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

## Troubleshooting

Falls Probleme mit den Erweiterungen auftreten:

1. Stellen Sie sicher, dass alle Node-Module installiert sind (`npm install`)
2. Laden Sie VS Code neu (`Ctrl+Shift+P` > "Reload Window")
3. Überprüfen Sie die Erweiterungs-Logs über das Output-Panel (`Ctrl+Shift+U` und wählen Sie die betreffende Erweiterung)
