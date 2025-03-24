#!/usr/bin/env node

/**
 * fix-missing-return-types-all.mjs
 * 
 * Dieses Script fügt fehlende Rückgabetypen zu Funktionen hinzu, die noch keine haben.
 * Es scannt alle .ts und .vue Dateien und ergänzt ': void' bei Funktionen ohne Rückgabetyp.
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
async function fixMissingReturnTypes() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');
  
  console.log(`Scanning project directory for missing return types: ${projectRoot}`);
  
  // Alle relevanten Dateien scannen
  const files = scanDir(projectRoot);
  console.log(`Found ${files.length} files to process`);
  
  let totalFixed = 0;
  
  // Für jede Datei
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Reguläre Ausdrücke für verschiedene Arten von Funktionen ohne Rückgabetyp
    const functionPatterns = [
      // Benannte Funktionen: function name(params) {
      {
        regex: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?!\s*:)/g,
        replacement: (match, name, params) => `function ${name}(${params}): void `
      },
      // Methoden in Klassen oder Objekten: methodName(params) {
      {
        regex: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?!\s*:|\s*=>)\s*\{/g,
        replacement: (match, name, params) => {
          // Überprüfen, ob es sich tatsächlich um eine Methode handelt (nicht Teil eines if/while/etc.)
          const beforeMatch = content.substring(0, content.indexOf(match)).trim();
          const lastChar = beforeMatch.charAt(beforeMatch.length - 1);
          if (lastChar === '{' || lastChar === ',' || lastChar === '(' || lastChar === ':') {
            return `${name}(${params}): void {`;
          }
          return match;
        }
      },
      // Arrow-Funktionen: const name = (params) => {
      {
        regex: /=\s*\(([^)]*)\)\s*(?!:)\s*=>/g,
        replacement: (match, params) => `= (${params}): void =>`
      },
      // Anonyme Funktionen in Callbacks: .then(() => {
      {
        regex: /\(\s*\(\)\s*(?!:)\s*=>\s*\{/g,
        replacement: '(() => {' // Keine Änderung für anonyme Callbacks ohne Parameter
      }
    ];
    
    // Jedes Muster anwenden
    for (const pattern of functionPatterns) {
      // Original-Inhalt zwischenspeichern, um später Veränderungen zu erkennen
      const originalContent = content;
      
      // Für dieses spezifische Muster alle Vorkommen ersetzen
      content = content.replace(pattern.regex, pattern.replacement);
      
      // Überprüfen, ob sich etwas geändert hat
      if (originalContent !== content) {
        modified = true;
      }
    }
    
    // Datei speichern, wenn sie geändert wurde
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`  Added return types in ${path.relative(projectRoot, file)}`);
      totalFixed++;
    }
  }
  
  console.log(`\nAdded return types in ${totalFixed} files`);
}

// Script ausführen
fixMissingReturnTypes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
