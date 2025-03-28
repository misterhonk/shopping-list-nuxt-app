#!/usr/bin/env node

/**
 * fix-type-files.mjs
 *
 * Dieses Script behebt spezifische ESLint-Probleme in den Typdateien:
 * - types/app-types.ts
 * - types/uiTypes.ts
 * - types/composable-types.ts
 * - composables/types.ts
 *
 * Zu korrigierende Probleme:
 * 1. Interface-Namen konsistent mit 'I'-Präfix
 * 2. Import- und Export-Anweisungen korrigieren
 * 3. Type-Imports konsistent machen
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Die Typendateien, die wir verarbeiten wollen
const TYPE_FILES = [
  'types/app-types.ts',
  'types/uiTypes.ts',
  'types/composable-types.ts',
  'composables/types.ts',
];

// Hauptfunktion
async function fixTypeFiles() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');

  console.log(`Fixing type files in: ${projectRoot}`);

  // Für jede Typdatei
  for (const relativeFilePath of TYPE_FILES) {
    const filePath = path.join(projectRoot, relativeFilePath);

    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      continue;
    }

    console.log(`\nProcessing: ${relativeFilePath}`);

    // Datei einlesen
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Interface-Namen konsistent mit 'I'-Präfix
    const interfaceFixResult = fixInterfaceNames(content);
    if (interfaceFixResult.modified) {
      content = interfaceFixResult.content;
      modified = true;
      console.log(`- Standardized interface names with 'I' prefix`);
    }

    // 2. Import-Anweisungen korrigieren
    const importFixResult = fixTypeImports(content);
    if (importFixResult.modified) {
      content = importFixResult.content;
      modified = true;
      console.log(`- Fixed type imports`);
    }

    // 3. Export-Anweisungen korrigieren
    const exportFixResult = fixTypeExports(content);
    if (exportFixResult.modified) {
      content = exportFixResult.content;
      modified = true;
      console.log(`- Fixed type exports`);
    }

    // Änderungen speichern, falls vorhanden
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${relativeFilePath}`);
    } else {
      console.log(`No changes needed in ${relativeFilePath}`);
    }
  }

  console.log('\nType files fix completed');
}

/**
 * Behebt Interface-Namen ohne I-Präfix
 */
function fixInterfaceNames(content) {
  let modified = false;
  const original = content;

  // Alle Interface-Deklarationen finden
  const interfaceRegex = /interface\s+([A-Za-z][A-Za-z0-9]*)\b/g;
  let match;
  const interfacesToFix = [];

  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    if (!interfaceName.startsWith('I')) {
      interfacesToFix.push(interfaceName);
    }
  }

  // Für jedes gefundene Interface ohne I-Präfix
  for (const interfaceName of interfacesToFix) {
    const newInterfaceName = `I${interfaceName}`;

    // Interface-Deklaration ändern
    const declRegex = new RegExp(`\\binterface\\s+${interfaceName}\\b`, 'g');
    content = content.replace(declRegex, `interface ${newInterfaceName}`);

    // Interface-Verwendungen ändern
    const usagePatterns = [
      // Typannotationen
      {
        regex: new RegExp(`(:\\s*)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`,
      },
      // Type Assertions
      {
        regex: new RegExp(`(as\\s+)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`,
      },
      // Generics
      {
        regex: new RegExp(`<${interfaceName}(>|,)`, 'g'),
        replacement: `<${newInterfaceName}$1`,
      },
      // Array-Typen
      {
        regex: new RegExp(`${interfaceName}(\\[])`, 'g'),
        replacement: `${newInterfaceName}$1`,
      },
      // Erweiterte Interfaces
      {
        regex: new RegExp(`(extends\\s+)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`,
      },
      // Type Aliases
      {
        regex: new RegExp(`(type\\s+[A-Za-z][A-Za-z0-9]*\\s*=\\s*)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`,
      },
      // Export-Anweisungen
      {
        regex: new RegExp(`(export\\s*\\{[^}]*)\\b${interfaceName}\\b([^}]*\\})`, 'g'),
        replacement: `$1${newInterfaceName}$2`,
      },
    ];

    for (const pattern of usagePatterns) {
      const updatedContent = content.replace(pattern.regex, pattern.replacement);
      if (updatedContent !== content) {
        content = updatedContent;
      }
    }
  }

  // Überprüfen, ob sich etwas geändert hat
  if (original !== content) {
    modified = true;
  }

  return { content, modified };
}

/**
 * Behebt Import-Anweisungen für Typen
 */
function fixTypeImports(content) {
  let modified = false;
  const original = content;

  // Reguläre Import-Anweisungen in Type-Imports umwandeln
  const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g;

  // Für jeden Import prüfen, ob es sich um Typen handelt
  content = content.replace(importRegex, (match, imports, source) => {
    // Wenn es sich um eine app-types.ts oder andere Typdatei handelt, als type-import behandeln
    if (source.includes('types') || match.includes('type {')) {
      return `import type { ${imports} } from '${source}'`;
    }
    return match;
  });

  // Überprüfen, ob sich etwas geändert hat
  if (original !== content) {
    modified = true;
  }

  return { content, modified };
}

/**
 * Behebt Export-Anweisungen für Typen
 */
function fixTypeExports(content) {
  let modified = false;
  const original = content;

  // Spezifische Probleme in Typdateien beheben

  // 1. Doppelte Export-Anweisungen entfernen
  const duplicateExportRegex =
    /export\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]\s*;\s*export\s+\{\s*\1\s*\}\s+from\s+['"]\2['"];\s*/g;
  content = content.replace(duplicateExportRegex, (match, exports, source) => {
    return `export { ${exports} } from '${source}';\n`;
  });

  // 2. Konsistente Export-Anweisungen für Typen
  const exportRegex = /export\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g;

  // Für jeden Export prüfen, ob es sich um Typen handelt
  content = content.replace(exportRegex, (match, exports, source) => {
    // Wenn es sich um eine app-types.ts oder andere Typdatei handelt, als type-export behandeln
    if (source.includes('types')) {
      return `export type { ${exports} } from '${source}'`;
    }
    return match;
  });

  // Überprüfen, ob sich etwas geändert hat
  if (original !== content) {
    modified = true;
  }

  return { content, modified };
}

// Script ausführen
fixTypeFiles().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
