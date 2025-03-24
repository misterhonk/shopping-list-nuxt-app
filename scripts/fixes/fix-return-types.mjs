#!/usr/bin/env node

/**
 * fix-return-types.mjs
 * 
 * Korrigiert Fehler in Rückgabetyp-Deklarationen bei Arrow-Funktionen
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hauptfunktion
async function fixReturnTypes() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');
  
  console.log(`Fixing return type declarations in: ${projectRoot}`);
  
  // Fix für category/migration.ts
  const migrationPath = path.join(projectRoot, 'stores/category/migration.ts');
  if (fs.existsSync(migrationPath)) {
    console.log('Fixing stores/category/migration.ts...');
    let content = fs.readFileSync(migrationPath, 'utf8');
    
    // Falsche Arrow-Funktionen mit Rückgabetyp korrigieren
    // Von: const x = (params) => ReturnType {
    // Zu: const x = (params): ReturnType => {
    const wrongArrowReturnTypeRegex = /(\w+\s*=\s*\([^)]*\))\s*=>\s*(\w+(?:<[^>]+>)?(?:\[\])?)(?:\s*\{)/g;
    if (wrongArrowReturnTypeRegex.test(content)) {
      content = content.replace(wrongArrowReturnTypeRegex, '$1: $2 => {');
      fs.writeFileSync(migrationPath, content, 'utf8');
      console.log('✓ Fixed arrow function return type syntax');
    }
    
    // Falsche Bedingungsprüfung in for-Schleife
    const wrongForInSyntaxRegex = /for\s*\(const\s+(\w+)\s+in\s+(\w+)\):\s*void\s*\{/g;
    if (wrongForInSyntaxRegex.test(content)) {
      content = content.replace(wrongForInSyntaxRegex, 'for (const $1 in $2) {');
      fs.writeFileSync(migrationPath, content, 'utf8');
      console.log('✓ Fixed for-in loop with void syntax');
    }
    
    // Unbenutzter Logger korrigieren
    if (content.includes('logger.info')) {
      content = content.replace(/logger\.info/g, '_logger.info');
      fs.writeFileSync(migrationPath, content, 'utf8');
      console.log('✓ Fixed logger reference');
    }
  }
  
  // Nach weiteren Dateien mit ähnlichen Fehlern suchen
  console.log('\nScanning for similar issues in other TypeScript files...');
  
  const allTsFiles = getAllTsFiles(projectRoot);
  let fixedCount = 0;
  
  for (const filePath of allTsFiles) {
    if (filePath === migrationPath) continue; // Bereits bearbeitet
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Falsche Arrow-Funktionen mit Rückgabetyp korrigieren
    const wrongArrowReturnTypeRegex = /(\w+\s*=\s*\([^)]*\))\s*=>\s*(\w+(?:<[^>]+>)?(?:\[\])?)(?:\s*\{)/g;
    if (wrongArrowReturnTypeRegex.test(content)) {
      content = content.replace(wrongArrowReturnTypeRegex, '$1: $2 => {');
      modified = true;
    }
    
    // Falsche Bedingungsprüfung in for-Schleife
    const wrongForInSyntaxRegex = /for\s*\(const\s+(\w+)\s+in\s+(\w+)\):\s*void\s*\{/g;
    if (wrongForInSyntaxRegex.test(content)) {
      content = content.replace(wrongForInSyntaxRegex, 'for (const $1 in $2) {');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed return type issues in ${path.relative(projectRoot, filePath)}`);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed return type issues in ${fixedCount} additional files`);
  console.log('Return type fixes completed');
}

/**
 * Findet alle TypeScript-Dateien im Projektverzeichnis
 * @param {string} dir - Verzeichnis zum Durchsuchen
 * @returns {string[]} - Liste aller TypeScript-Dateien
 */
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.nuxt') && !filePath.includes('.output')) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Script ausführen
fixReturnTypes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
