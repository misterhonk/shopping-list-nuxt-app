#!/usr/bin/env node

/**
 * fix-parsing-errors.mjs
 * 
 * Dieses Script behebt spezifische Parsing-Fehler in TypeScript-Dateien, die durch unsere 
 * automatisierten Skripte entstanden sind oder bestehen bleiben.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helferfunktion zum rekursiven Scannen von Verzeichnissen
function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.nuxt') && !filePath.includes('.output')) {
      scanDir(filePath, fileList);
    } else if ((file.endsWith('.ts') || file.endsWith('.vue')) && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Hauptfunktion
async function fixParsingErrors() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');
  
  console.log(`Fixing parsing errors in: ${projectRoot}`);
  
  // Bekannte Dateien mit Parsing-Fehlern
  const knownProblematicFiles = [
    'services/updateService.ts',
    'utils/logger.ts',
    'stores/category/index.ts',
    'composables/shoppingItems/useItemManagement.ts',
    'composables/shoppingItems/useItemForm.ts',
    'composables/shoppingItems/useItemSuggestions.ts',
    'composables/utils/operations/listOperations.ts'
  ];
  
  // Zunächst die bekannten Problemdateien verarbeiten
  for (const relativeFilePath of knownProblematicFiles) {
    const filePath = path.join(projectRoot, relativeFilePath);
    
    if (fs.existsSync(filePath)) {
      console.log(`\nChecking known problematic file: ${relativeFilePath}`);
      await fixFileParsingErrors(filePath, projectRoot);
    }
  }
  
  // Anschließend nach weiteren Dateien mit ähnlichen Fehlern suchen
  const allFiles = scanDir(projectRoot);
  
  // Nur Dateien verarbeiten, die nicht bereits in knownProblematicFiles sind
  const filesToProcess = allFiles.filter(file => 
    !knownProblematicFiles.some(problematicFile => 
      file.endsWith(problematicFile)
    )
  );
  
  console.log(`\nScanning ${filesToProcess.length} additional files for parsing errors...`);
  
  let fixedCount = 0;
  
  for (const filePath of filesToProcess) {
    const fixed = await fixFileParsingErrors(filePath, projectRoot);
    if (fixed) {
      fixedCount++;
    }
  }
  
  console.log(`\nFixed parsing errors in ${fixedCount} additional files`);
  console.log('Parsing errors fix completed');
}

/**
 * Behebt Parsing-Fehler in einer bestimmten Datei
 */
async function fixFileParsingErrors(filePath, projectRoot) {
  const relativeFilePath = path.relative(projectRoot, filePath);
  
  // Datei einlesen
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 1. Date._now() zu Date.now() korrigieren
  const dateNowRegex = /Date\._now\(\)/g;
  if (dateNowRegex.test(content)) {
    content = content.replace(dateNowRegex, 'Date.now()');
    modified = true;
    console.log(`  - Fixed Date._now() in ${relativeFilePath}`);
  }
  
  // 2. Fehlerhafte if-Bedingungen mit void korrigieren
  const ifVoidRegex = /if\s*\(([^)]+)\)\s*:\s*void\s*\{?/g;
  if (ifVoidRegex.test(content)) {
    content = content.replace(ifVoidRegex, (match, condition) => {
      return `if (${condition}) {`;
    });
    modified = true;
    console.log(`  - Fixed if-condition with void in ${relativeFilePath}`);
  }
  
  // 3. Callback-Funktionen mit ): void => void korrigieren
  const callbackVoidRegex = /(\([^)]*\))\s*:\s*void\s*=>\s*void/g;
  if (callbackVoidRegex.test(content)) {
    content = content.replace(callbackVoidRegex, '$1 => void');
    modified = true;
    console.log(`  - Fixed callback with void => void in ${relativeFilePath}`);
  }
  
  // 4. Fehlerhaftes ): void => in if-Bedingungen korrigieren
  const arrowVoidRegex = /if\s*\([^)]+\)\s*:\s*void\s*=>/g;
  if (arrowVoidRegex.test(content)) {
    content = content.replace(arrowVoidRegex, match => {
      return match.replace(': void', '');
    });
    modified = true;
    console.log(`  - Fixed if-condition with void => in ${relativeFilePath}`);
  }
  
  // 5. Doppelte Rückgabetyp-Deklarationen korrigieren
  const doubleReturnTypeRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*:\s*void\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$<>[\]]*)/g;
  if (doubleReturnTypeRegex.test(content)) {
    content = content.replace(doubleReturnTypeRegex, 'function $1($2): $3');
    modified = true;
    console.log(`  - Fixed double return type declaration in ${relativeFilePath}`);
  }
  
  // 6. Nach Expression expected in return-Anweisungen suchen und beheben
  const returnExpressionRegex = /return\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$<>[\]]*)\s*{/g;
  if (returnExpressionRegex.test(content)) {
    content = content.replace(returnExpressionRegex, 'return {');
    modified = true;
    console.log(`  - Fixed return with type in ${relativeFilePath}`);
  }
  
  // 7. Fehlerhafte switch-case-Statements korrigieren
  const switchCaseRegex = /switch\s*\(([^)]+)\)\s*:\s*void\s*{/g;
  if (switchCaseRegex.test(content)) {
    content = content.replace(switchCaseRegex, 'switch($1) {');
    modified = true;
    console.log(`  - Fixed switch statement with void in ${relativeFilePath}`);
  }
  
  // 8. Mehrfache Rückgabetypen mit kommas anstelle von UND in Interfaces
  const multipleReturnTypesRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$<>[\]]*)\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$<>[\]]*)/g;
  if (multipleReturnTypesRegex.test(content)) {
    content = content.replace(multipleReturnTypesRegex, '$1($2): $3 & $4');
    modified = true;
    console.log(`  - Fixed multiple return types with comma in ${relativeFilePath}`);
  }
  
  // Änderungen speichern, falls vorhanden
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${relativeFilePath}`);
    return true;
  }
  
  return false;
}

// Script ausführen
fixParsingErrors().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
