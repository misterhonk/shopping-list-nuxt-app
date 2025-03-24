#!/usr/bin/env node

/**
 * fix-composables.mjs
 * 
 * Dieses Script behebt spezifische ESLint-Probleme in Composables-Dateien:
 * - composables/useDarkMode.ts
 * - composables/shoppingItems/*.ts
 * - composables/utils/*.ts
 * 
 * Zu korrigierende Probleme:
 * 1. Parsing-Fehler aufgrund fehlerhafter Rückgabetypen
 * 2. Fehlende Import-Anweisungen für Typen
 * 3. Korrektur der Interface-Verwendung
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helferfunktion zum rekursiven Scannen von Verzeichnissen
function scanDir(dir, pattern, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.nuxt') && !filePath.includes('.output')) {
      scanDir(filePath, pattern, fileList);
    } else if (file.endsWith('.ts') && file.match(pattern)) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Hauptfunktion
async function fixComposables() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');
  
  console.log(`Fixing composables in: ${projectRoot}`);
  
  // Spezifische Dateien direkt verarbeiten
  const specificFiles = [
    path.join(projectRoot, 'composables/useDarkMode.ts')
  ];
  
  // Verzeichnisse scannen
  const shoppingItemsDir = path.join(projectRoot, 'composables/shoppingItems');
  const utilsDir = path.join(projectRoot, 'composables/utils');
  
  const shoppingItemsFiles = fs.existsSync(shoppingItemsDir) 
    ? scanDir(shoppingItemsDir, /\.ts$/) 
    : [];
  
  const utilsFiles = fs.existsSync(utilsDir)
    ? scanDir(utilsDir, /\.ts$/)
    : [];
  
  // Alle zu verarbeitenden Dateien sammeln
  const filesToProcess = [
    ...specificFiles.filter(file => fs.existsSync(file)),
    ...shoppingItemsFiles,
    ...utilsFiles
  ];
  
  console.log(`Found ${filesToProcess.length} composables files to process`);
  
  // Für jede Datei
  for (const filePath of filesToProcess) {
    const relativeFilePath = path.relative(projectRoot, filePath);
    console.log(`\nProcessing: ${relativeFilePath}`);
    
    // Datei einlesen
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Fehlerhafte Rückgabetypen korrigieren
    const returnTypeFixResult = fixComposableReturnTypes(content);
    if (returnTypeFixResult.modified) {
      content = returnTypeFixResult.content;
      modified = true;
      console.log(`- Fixed return types`);
    }
    
    // 2. Fehlende Import-Anweisungen für Typen ergänzen
    const importFixResult = fixComposableImports(content);
    if (importFixResult.modified) {
      content = importFixResult.content;
      modified = true;
      console.log(`- Fixed type imports`);
    }
    
    // 3. Interface-Verwendungen korrigieren
    const interfaceFixResult = fixInterfaceUsage(content);
    if (interfaceFixResult.modified) {
      content = interfaceFixResult.content;
      modified = true;
      console.log(`- Fixed interface usage`);
    }
    
    // Änderungen speichern, falls vorhanden
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${relativeFilePath}`);
    } else {
      console.log(`No changes needed in ${relativeFilePath}`);
    }
  }
  
  console.log('\nComposables fix completed');
}

/**
 * Behebt fehlerhafte Rückgabetypen in Composables
 */
function fixComposableReturnTypes(content) {
  let modified = false;
  const original = content;
  
  // 1. Typische Composable-Funktionen mit korrektem Rückgabetyp
  // Export-Funktionen mit defineNuxtPlugin
  content = content.replace(
    /(export\s+(?:default\s+)?function\s+\w+\([^)]*\))\s*(?!\s*:)/g, 
    '$1: ReturnType<typeof useComposable> '
  );
  
  // 2. useXYZ-Funktionen mit fehlenden Rückgabetypen
  content = content.replace(
    /(export\s+(?:default\s+)?function\s+use\w+\([^)]*\))\s*(?!\s*:)/g,
    '$1: Record<string, any> '
  );
  
  // 3. Arrow Functions in Composables
  content = content.replace(
    /(export\s+const\s+use\w+\s*=\s*\([^)]*\)\s*(?!\s*:))\s*=>/g,
    '$1: Record<string, any> =>'
  );
  
  // 4. Composable Rückgabewerte korrigieren
  // Von: return { ... } zu: return { ... } as const
  content = content.replace(
    /(return\s*\{[^}]*\})\s*(?!\s*as)/g,
    '$1 as const'
  );
  
  // Überprüfen, ob sich etwas geändert hat
  if (original !== content) {
    modified = true;
  }
  
  return { content, modified };
}

/**
 * Behebt fehlende Import-Anweisungen in Composables
 */
function fixComposableImports(content) {
  let modified = false;
  const original = content;
  
  // 1. Fehlenden Import für ReturnType ergänzen (falls verwendet)
  if (content.includes('ReturnType') && !content.includes('import type { ReturnType }')) {
    const importStatement = "import type { ReturnType } from 'typescript';\n";
    content = importStatement + content;
    modified = true;
  }
  
  // 2. Imports aus falschen Pfaden korrigieren
  // Von: import { xyz } from '~/composables/types'
  // Zu: import type { xyz } from '~/types/app-types'
  content = content.replace(
    /import\s+(?!type)\{([^}]*)\}\s+from\s+['"]~\/composables\/types['"]/g,
    'import type {$1} from \'~/types/app-types\''
  );
  
  // 3. Fehlende type-Imports ergänzen
  content = content.replace(
    /import\s+(?!type)\{([^}]*)\}\s+from\s+['"]~\/types\/([^'"]+)['"]/g,
    'import type {$1} from \'~/types/$2\''
  );
  
  // Überprüfen, ob sich etwas geändert hat
  if (original !== content) {
    modified = true;
  }
  
  return { content, modified };
}

/**
 * Behebt falsche Interface-Verwendungen
 */
function fixInterfaceUsage(content) {
  let modified = false;
  const original = content;
  
  // Liste von bekannten Interfaces, die korrigiert werden müssen
  const interfacesToFix = [
    'Category', 'ShoppingItem', 'ShoppingList', 'ItemHistoryEntry', 
    'ItemSuggestion', 'UpdateInfo', 'CategoryTemplate'
  ];
  
  // Für jedes zu korrigierende Interface
  for (const interfaceName of interfacesToFix) {
    const newInterfaceName = `I${interfaceName}`;
    
    // Verschiedene Verwendungsmuster ersetzen
    const patterns = [
      // Typannotationen
      {
        regex: new RegExp(`(:\\s*)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`
      },
      // Type Assertions
      {
        regex: new RegExp(`(as\\s+)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`
      },
      // Generics
      {
        regex: new RegExp(`<${interfaceName}(>|,)`, 'g'),
        replacement: `<${newInterfaceName}$1`
      },
      // Array-Typen
      {
        regex: new RegExp(`${interfaceName}(\\[])`, 'g'),
        replacement: `${newInterfaceName}$1`
      }
    ];
    
    for (const pattern of patterns) {
      content = content.replace(pattern.regex, pattern.replacement);
    }
  }
  
  // Überprüfen, ob sich etwas geändert hat
  if (original !== content) {
    modified = true;
  }
  
  return { content, modified };
}

// Script ausführen
fixComposables().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
