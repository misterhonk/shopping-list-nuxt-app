# Interface-Namenskonventionen für die Shopping-List-App

## Überblick

In der Shopping-List-App wurde die Entscheidung getroffen, Interface-Namen konsistent mit dem Präfix "I" zu versehen (z.B. `ICategory` statt `Category`). Diese Konvention verbessert die Lesbarkeit des Codes und macht die Unterscheidung zwischen Interfaces und konkreten Klassen oder Typen deutlicher.

## Aktuelle Problematik

Bei der ESLint-Validierung wurden mehrere Interfaces identifiziert, die nicht der Namenskonvention entsprechen:

1. `ItemHistoryEntry` → sollte `IItemHistoryEntry` sein
2. `ItemSuggestion` → sollte `IItemSuggestion` sein
3. `ImportData` → sollte `IImportData` sein
4. `ImportOptions` → sollte `IImportOptions` sein
5. `ImportResult` → sollte `IImportResult` sein
6. `ImportServices` → sollte `IImportServices` sein
7. `ItemFormState` → sollte `IItemFormState` sein
8. `ItemStatusDisplay` → sollte `IItemStatusDisplay` sein

## Korrekturplan

### 1. Manuelle Korrekturen für Import-bezogene Interfaces

Die Import-bezogenen Interfaces in `composables/importExport/useListImport.ts` und `composables/types.ts` sollten zuerst korrigiert werden:

```typescript
// Vorher
interface ImportResult { ... }
interface ImportServices { ... }
interface ImportOptions { ... }

// Nachher
interface IImportResult { ... }
interface IImportServices { ... }
interface IImportOptions { ... }
```

### 2. Automatisiertes Skript für übrige Interfaces

Für die restlichen Interfaces können wir ein ähnliches Skript wie in Phase 1 verwenden, aber mit einer fokussierteren Anwendung:

```javascript
// ~/scripts/fixes/fix-interface-names-phase2.mjs
import fs from 'fs';
import path from 'path';

const files = ['types/app-types.ts', 'types/form-types.ts', 'types/uiTypes.ts'];

const interfacesToFix = {
  ItemHistoryEntry: 'IItemHistoryEntry',
  ItemSuggestion: 'IItemSuggestion',
  ItemFormState: 'IItemFormState',
  ItemStatusDisplay: 'IItemStatusDisplay',
};

// Funktion zum Umbenennen von Interfaces in einer Datei
function fixInterfacesInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Für jedes Interface in der Liste
  for (const [oldName, newName] of Object.entries(interfacesToFix)) {
    // Interface-Definition umbenennen
    const interfacePattern = new RegExp(`interface\\s+${oldName}\\b`, 'g');
    newContent = newContent.replace(interfacePattern, `interface ${newName}`);

    // Verwendungen als Typ umbenennen
    const typePattern = new RegExp(`\\b${oldName}\\b(?!\\s*{)`, 'g');
    newContent = newContent.replace(typePattern, newName);
  }

  // Datei nur schreiben, wenn es Änderungen gibt
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`✓ Interfaces in ${filePath} aktualisiert`);
    return true;
  }

  console.log(`- Keine Änderungen in ${filePath}`);
  return false;
}

// Hauptfunktion
async function main() {
  console.log('Interface-Namen werden auf I-Präfix-Konvention aktualisiert...');

  let totalChanges = 0;

  for (const filePath of files) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const changed = fixInterfacesInFile(fullPath);
      if (changed) totalChanges++;
    } else {
      console.log(`⚠️ Datei nicht gefunden: ${fullPath}`);
    }
  }

  console.log(`\nFertig! ${totalChanges} Dateien wurden aktualisiert.`);
}

main().catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
```

### 3. Überprüfung der Änderungen

Nach der Anwendung des Skripts sollten folgende Schritte durchgeführt werden:

1. ESLint ausführen, um zu überprüfen, ob alle Namenskonventions-Warnungen behoben wurden
2. Die Anwendung testen, um sicherzustellen, dass keine Laufzeitfehler auftreten
3. Die Änderungen in Git commiten mit einer aussagekräftigen Commit-Nachricht

## Best Practices für zukünftige Interface-Definitionen

Um zukünftige Namenskonventions-Probleme zu vermeiden:

1. Immer das "I"-Präfix für neue Interfaces verwenden
2. Die ESLint-Regel `@typescript-eslint/naming-convention` beibehalten
3. Automatisierte Prüfungen in den CI/CD-Prozess integrieren
4. Code-Reviews dahingehend anpassen, dass sie die Namenskonvention prüfen

## Vorteile der konsistenten Interface-Benennung

1. **Bessere Lesbarkeit**: Sofortige Erkennung von Interfaces im Code
2. **Wartbarkeit**: Klare Unterscheidung zwischen Interfaces und konkreten Implementierungen
3. **IDE-Integration**: Verbesserte Auto-Vervollständigung und Typ-Inferenz
4. **Entwickler-Onboarding**: Einfachere Einarbeitung für neue Teammitglieder

Die konsistente Benennung ist ein wichtiger Aspekt der Codequalität und sollte stets beachtet werden.
