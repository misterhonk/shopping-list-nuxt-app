/**
 * ESLint-Verbesserungsphase 2: Interface-Namenskonventionen korrigieren
 *
 * Dieses Skript korrigiert Interface-Namen, die noch nicht die I-Präfix-Konvention
 * einhalten. Es fokussiert sich auf spezifische Interfaces wie ItemHistoryEntry
 * und konvertiert sie zu IItemHistoryEntry.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules-Unterstützung
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'types/app-types.ts',
  'types/form-types.ts',
  'types/uiTypes.ts',
  'composables/importExport/useListImport.ts',
  'composables/types.ts',
  'components/lists/ImportOptionsModal.vue',
];

const interfacesToFix = {
  ItemHistoryEntry: 'IItemHistoryEntry',
  ItemSuggestion: 'IItemSuggestion',
  ItemFormState: 'IItemFormState',
  ItemStatusDisplay: 'IItemStatusDisplay',
  ImportData: 'IImportData',
  ImportOptions: 'IImportOptions',
  ImportResult: 'IImportResult',
  ImportServices: 'IImportServices',
};

/**
 * Funktion zum Umbenennen von Interfaces in einer Datei
 * @param {string} filePath - Relativer Pfad zur Datei
 * @returns {boolean} - true, wenn Änderungen vorgenommen wurden
 */
function fixInterfacesInFile(filePath) {
  console.log(`Verarbeite Datei: ${filePath}`);

  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let newContent = content;

    // Für jedes Interface in der Liste
    for (const [oldName, newName] of Object.entries(interfacesToFix)) {
      // Interface-Definition umbenennen
      const interfacePattern = new RegExp(`interface\\s+${oldName}\\b`, 'g');
      newContent = newContent.replace(interfacePattern, `interface ${newName}`);

      // Verwendungen als Typ umbenennen
      const typePattern = new RegExp(`\\b${oldName}\\b(?!\\s*{)`, 'g');
      newContent = newContent.replace(typePattern, newName);

      // Überprüfe, ob Änderungen vorgenommen wurden
      if (newContent !== content) {
        console.log(`  ✓ Interface ${oldName} -> ${newName} umbenannt`);
      }
    }

    // Datei nur schreiben, wenn es Änderungen gibt
    if (newContent !== content) {
      fs.writeFileSync(fullPath, newContent);
      console.log(`  ✅ Datei ${filePath} aktualisiert`);
      return true;
    }

    console.log(`  - Keine Änderungen in ${filePath}`);
    return false;
  } catch (err) {
    console.error(`  ❌ Fehler bei Datei ${filePath}:`, err);
    return false;
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  console.log('Interface-Namen werden auf I-Präfix-Konvention aktualisiert...');

  let totalChanges = 0;

  for (const filePath of files) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const changed = fixInterfacesInFile(filePath);
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
