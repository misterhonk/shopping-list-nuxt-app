#!/usr/bin/env node

/**
 * Script zum Beheben fehlender Rückgabetypen bei Funktionen
 *
 * Dieses Script fügt ": void" zu Funktionen hinzu, die keinen Rückgabetyp haben,
 * um ESLint-Warnungen zu beheben.
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

// Regex-Muster für Funktionen ohne Rückgabetyp
// Erfasst arrow functions und reguläre Funktionen ohne Rückgabetyp
const noReturnTypePatterns = [
  {
    // Arrow Functions: (param) => { ... }
    regex: /(\([\w\s:,?=[\]{}|&]*\))\s*=>\s*(\{)/g,
    replacement: '$1: void => $2',
    description: 'Adding void return type to arrow function',
  },
  {
    // Regular functions: function name() { ... }
    regex: /(function\s+[\w]+\s*\([\w\s:,?=[\]{}|&]*\))\s*(\{)/g,
    replacement: '$1: void $2',
    description: 'Adding void return type to function',
  },
  {
    // Methods: methodName() { ... }
    regex: /(\s*)([\w]+\s*\([\w\s:,?=[\]{}|&]*\))\s*(\{)/g,
    checkContext: (text, match, index) => {
      // Prüfen, ob es sich um eine Methode handelt (nicht innerhalb eines Objektliterals, etc.)
      const beforeMatch = text.substring(0, index);
      const lastLine = beforeMatch.split('\n').pop().trim();
      return !lastLine.includes('=') && !lastLine.match(/[\{\,]$/);
    },
    replacement: '$1$2: void $3',
    description: 'Adding void return type to method',
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
  try {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    let madeChanges = false;

    for (const pattern of noReturnTypePatterns) {
      const originalContent = fileContent;

      if (pattern.checkContext) {
        // Für komplexere Patterns, die Kontext-Prüfung benötigen
        let lastIndex = 0;
        let match;

        while ((match = pattern.regex.exec(originalContent)) !== null) {
          if (pattern.checkContext(originalContent, match, match.index)) {
            const beforeMatch = originalContent.substring(0, match.index);
            const afterMatch = originalContent.substring(match.index + match[0].length);
            const replacement = match[0].replace(pattern.regex, pattern.replacement);

            fileContent = beforeMatch + replacement + afterMatch;
            console.log(`${pattern.description} in ${filePath}`);
            madeChanges = true;
          }
        }
      } else {
        // Einfache globale Ersetzung
        fileContent = fileContent.replace(pattern.regex, pattern.replacement);

        if (originalContent !== fileContent) {
          console.log(`${pattern.description} in ${filePath}`);
          madeChanges = true;
        }
      }
    }

    if (madeChanges) {
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`Fixed return type issues in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Hauptfunktion
function main() {
  console.log('Looking for missing return types...');

  for (const directory of directoriesToSearch) {
    const dirPath = path.join(process.cwd(), directory);

    if (fs.existsSync(dirPath)) {
      searchFiles(dirPath);
    }
  }

  console.log('Return type fixes complete!');
}

main();
