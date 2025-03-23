#!/usr/bin/env node

/**
 * Script zum automatischen Beheben von Problemen mit dem "??" Operator
 * in TypeScript-Dateien.
 *
 * Dieses Script findet Muster wie "!variable ?? bedingung" und ersetzt sie
 * mit "!variable || bedingung", da der ??-Operator für null/undefined-Checks
 * gedacht ist, nicht für boolesche Werte.
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
  'plugins',
  'stores',
  'services',
  'utils',
];

// Regex-Muster für die zu ersetzenden Probleme
const patterns = [
  {
    // Match: !variable ?? bedingung
    regex: /(!\s*[\w.[\]()]+)\s*\?\?\s*(.+)/g,
    replacement: '$1 || $2',
    description: 'Fixing !variable ?? pattern',
  },
  {
    // Match: variable ?? (typeof variable === something || array check)
    regex: /([\w.[\]()]+)\s*\?\?\s*(\(.+\))/g,
    replacement: '$1 === null || $1 === undefined || $2',
    description: 'Fixing complex ?? conditions',
  },
];

// Funktion zum Durchsuchen von Dateien in einem Verzeichnis rekursiv
function searchFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      searchFiles(filePath);
    } else if (
      stat.isFile() &&
      (filePath.endsWith('.ts') || filePath.endsWith('.vue')) &&
      !filePath.includes('node_modules')
    ) {
      fixFile(filePath);
    }
  }
}

// Funktion zum Beheben der Probleme in einer Datei
function fixFile(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  let madeChanges = false;

  for (const pattern of patterns) {
    const originalContent = fileContent;
    fileContent = fileContent.replace(pattern.regex, pattern.replacement);

    if (originalContent !== fileContent) {
      console.log(`${pattern.description} in ${filePath}`);
      madeChanges = true;
    }
  }

  if (madeChanges) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`Fixed issues in ${filePath}`);
  }
}

// Hauptfunktion
function main() {
  console.log('Looking for TypeScript syntax issues...');

  for (const directory of directoriesToSearch) {
    const dirPath = path.join(process.cwd(), directory);

    if (fs.existsSync(dirPath)) {
      searchFiles(dirPath);
    }
  }

  console.log('Fixes complete!');
}

main();
