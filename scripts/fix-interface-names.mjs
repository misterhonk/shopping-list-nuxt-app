#!/usr/bin/env node

/**
 * Script zum automatischen Beheben von Interface-Namen-Konventionen
 *
 * Dieses Script fügt das "I"-Präfix zu Interface-Namen hinzu,
 * die nicht damit beginnen, um der TypeScript-Konvention zu entsprechen.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Hilfsfunktion für __dirname Äquivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verzeichnisse, die durchsucht werden sollen
const directoriesToSearch = [
  'components',
  'composables',
  'pages',
  'types',
  'stores',
  'services',
  'utils',
];

// Regex-Muster für Interfaces
const interfacePattern = /^(\s*)export\s+interface\s+([A-Z][a-zA-Z0-9_]*)\s+/gm;

// Funktion zum Durchsuchen von Dateien in einem Verzeichnis rekursiv
function searchFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      searchFiles(filePath);
    } else if (stat.isFile() && filePath.endsWith('.ts') && !filePath.includes('node_modules')) {
      fixFile(filePath);
    }
  }
}

// Funktion zum Beheben der Interface-Namen in einer Datei
function fixFile(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  let madeChanges = false;

  // Suche nach Interface-Definitionen und ändere sie
  fileContent = fileContent.replace(interfacePattern, (match, space, interfaceName) => {
    // Überspringen, wenn der Name bereits mit I beginnt
    if (interfaceName.startsWith('I')) {
      return match;
    }

    console.log(`Renaming interface ${interfaceName} to I${interfaceName} in ${filePath}`);
    madeChanges = true;
    return `${space}export interface I${interfaceName} `;
  });

  // Update Referenzen zu den geänderten Interfaces im gleichen File
  if (madeChanges) {
    // Extrahiere alle geänderten Interface-Namen
    const renamedInterfaces = [];
    fileContent.match(interfacePattern) &&
      fileContent.match(interfacePattern).forEach(match => {
        const interfaceName = match.match(/interface\s+([A-Z][a-zA-Z0-9_]*)/)[1];
        if (interfaceName.startsWith('I')) {
          const originalName = interfaceName.substring(1);
          renamedInterfaces.push({ original: originalName, renamed: interfaceName });
        }
      });

    // Ersetze alle Referenzen im gleichen File
    for (const { original, renamed } of renamedInterfaces) {
      // Suche nach Typreferenzen, die korrekt ersetzt werden müssen
      const referencePattern = new RegExp(`(\\b)(${original})(\\b)`, 'g');
      fileContent = fileContent.replace(referencePattern, (match, prefix, type, suffix) => {
        // Überspringe Interface-Deklarationen selbst
        if (prefix.includes('interface ')) {
          return match;
        }
        return `${prefix}${renamed}${suffix}`;
      });
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`Fixed interface names in ${filePath}`);
  }
}

// Hauptfunktion
function main() {
  console.log('Looking for interface name issues...');

  for (const directory of directoriesToSearch) {
    const dirPath = path.join(process.cwd(), directory);

    if (fs.existsSync(dirPath)) {
      searchFiles(dirPath);
    }
  }

  console.log('Interface name fixes complete!');
}

main();
