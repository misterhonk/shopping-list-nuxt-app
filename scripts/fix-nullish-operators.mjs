#!/usr/bin/env node

/**
 * Skript zur Korrektur von falschen Verwendungen des Nullish Coalescing Operators (??)
 *
 * Der Nullish Coalescing Operator sollte nur verwendet werden, um einen Fallback-Wert
 * zu definieren, wenn der linke Operand null oder undefined ist, nicht in Bedingungen
 * mit logischen Ausdrücken.
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Findet alle Dateien mit potenziellen Problemen
const findProblematicFiles = () => {
  try {
    const result = execSync(
      `grep -r "!.*??\\|??.*!" --include="*.ts" --include="*.js" --include="*.vue" .`,
      { encoding: 'utf-8' }
    );
    return result
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [filePath] = line.split(':');
        return filePath;
      })
      .filter((item, pos, self) => self.indexOf(item) === pos); // Entfernt Duplikate
  } catch (e) {
    // Wenn grep nichts findet, wirft es einen Fehler
    return [];
  }
};

// Korrigiert falsche Verwendungen des ??-Operators in einer Datei
const fixFile = filePath => {
  console.log(`Bearbeite: ${filePath}`);

  try {
    let content = readFileSync(filePath, 'utf-8');

    // Fall 1: !variable ?? bedingung  ->  !variable && bedingung
    content = content.replace(/!([^()!&|]+)\s*\?\?\s*([^;,)\n]+)/g, '!$1 && $2');

    // Fall 2: bedingung ?? !variable  ->  bedingung && !variable
    content = content.replace(/([^;,(!&|\n]+)\s*\?\?\s*!([^()]+)/g, '$1 && !$2');

    // Fall 3: !a ?? !b  ->  !a && !b
    content = content.replace(/!([^()!&|]+)\s*\?\?\s*!([^()]+)/g, '!$1 && !$2');

    writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Fehler bei ${filePath}:`, error);
    return false;
  }
};

// Hauptfunktion
const main = () => {
  const files = findProblematicFiles();

  if (files.length === 0) {
    console.log('Keine problematischen Dateien gefunden.');
    return;
  }

  console.log(`${files.length} problematische Dateien gefunden.`);

  let successCount = 0;
  for (const file of files) {
    if (fixFile(file)) {
      successCount++;
    }
  }

  console.log(`${successCount} von ${files.length} Dateien erfolgreich korrigiert.`);
};

main();
