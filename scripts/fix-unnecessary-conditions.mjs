#!/usr/bin/env node

/**
 * Skript zum Beheben unnötiger Bedingungsprüfungen
 * 
 * Fokussiert auf zwei häufige Probleme:
 * 1. Unnötige Verwendung des Nullish-Coalescing-Operators (??) für nicht-nullish Werte
 * 2. Unnötige Bedingungen, die immer true oder immer false sind
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Hilfsfunktion für __dirname Äquivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Projektbasis-Verzeichnis
const baseDir = path.resolve(__dirname, '..');

// ESLint ausführen und Warnungen sammeln
function collectUnnecessaryConditions() {
  console.log('Sammle unnötige Bedingungen mit ESLint...');
  
  let eslintOutput;
  try {
    eslintOutput = execSync('npx eslint --ext .js,.ts,.vue --ignore-path .eslintignore .', {
      cwd: baseDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
  } catch (error) {
    // ESLint gibt einen Fehler zurück, wenn es Probleme findet, also nehmen wir die Ausgabe
    eslintOutput = error.stdout;
  }
  
  // Extrahiere die Fehlermeldungen und Dateien für verschiedene Arten von unnötigen Bedingungen
  const unnecessaryConditionsMap = new Map(); // Map für Datei -> Array von Objekten mit Zeilennummern und Meldungen
  
  let currentFile = null;
  
  // Durch die ESLint-Ausgabe zeilenweise gehen
  const lines = eslintOutput.split('\n');
  for (const line of lines) {
    // Neue Datei gefunden
    if (line.includes('/Users/martinmelcher/Dev/shopping-list-app/')) {
      currentFile = line.trim();
      continue;
    }
    
    // Wenn wir in einer Datei sind und eine unnötige Bedingung finden
    if (currentFile && line.includes('@typescript-eslint/no-unnecessary-condition')) {
      // Extrahiere Zeilennummer und Meldung
      const match = line.match(/(\d+):(\d+)\s+warning\s+(.*?)(@typescript-eslint\/no-unnecessary-condition)/);
      if (match) {
        const lineNumber = parseInt(match[1], 10);
        const message = match[3].trim();
        
        if (!unnecessaryConditionsMap.has(currentFile)) {
          unnecessaryConditionsMap.set(currentFile, []);
        }
        
        unnecessaryConditionsMap.get(currentFile).push({
          lineNumber,
          message
        });
      }
    }
  }
  
  return unnecessaryConditionsMap;
}

// Verarbeitet eine Datei und behebt unnötige Bedingungen
function processFile(filePath, conditionsToFix) {
  if (!fs.existsSync(filePath)) {
    console.error(`Datei nicht gefunden: ${filePath}`);
    return 0;
  }
  
  console.log(`Verarbeite Datei: ${filePath}`);
  console.log(`Zu fixende Bedingungen: ${conditionsToFix.length}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let changes = 0;
  
  // Sortiere die Bedingungen nach Zeilennummer absteigend, damit wir von unten nach oben arbeiten
  // (um Zeilenverschiebungen zu vermeiden)
  conditionsToFix.sort((a, b) => b.lineNumber - a.lineNumber);
  
  for (const condition of conditionsToFix) {
    const lineIndex = condition.lineNumber - 1;
    const line = lines[lineIndex];
    
    if (!line) {
      console.warn(`  Warnung: Linie ${condition.lineNumber} nicht gefunden`);
      continue;
    }
    
    // Verschiedene Arten von Fixes basierend auf der Meldung
    if (condition.message.includes('expected left-hand side of `??` operator to be possibly null or undefined')) {
      // Finde die Position des ?? Operators und ersetze ihn durch ||
      const nullishIndex = line.indexOf('??');
      if (nullishIndex >= 0) {
        lines[lineIndex] = line.substring(0, nullishIndex) + '||' + line.substring(nullishIndex + 2);
        changes++;
        console.log(`  Linie ${condition.lineNumber}: ?? durch || ersetzt`);
      }
    } else if (condition.message.includes('value is always truthy') || 
              condition.message.includes('value is always falsy') ||
              condition.message.includes('both sides of the expression are literal values')) {
      // Hier müssten wir die gesamte Bedingung analysieren und ggf. entfernen
      // Da dies komplexer ist, geben wir nur eine Warnung aus
      console.log(`  Linie ${condition.lineNumber}: Komplexe Bedingung gefunden, manuelle Überprüfung erforderlich`);
      console.log(`    ${line.trim()}`);
    }
  }
  
  // Schreibe die Datei nur, wenn Änderungen vorgenommen wurden
  if (changes > 0) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`  Gesamt: ${changes} Änderungen in der Datei vorgenommen`);
  } else {
    console.log(`  Keine Änderungen in der Datei vorgenommen`);
  }
  
  return changes;
}

// Hauptfunktion
async function main() {
  // Sammle unnötige Bedingungen
  const unnecessaryConditionsMap = collectUnnecessaryConditions();
  
  if (unnecessaryConditionsMap.size === 0) {
    console.log('Keine unnötigen Bedingungen gefunden.');
    return;
  }
  
  console.log(`Gefunden: ${unnecessaryConditionsMap.size} Dateien mit unnötigen Bedingungen.`);
  
  // Verarbeite jede Datei
  let totalChanges = 0;
  
  for (const [filePath, conditions] of unnecessaryConditionsMap.entries()) {
    // Extrahiere den realen Dateipfad aus der ESLint-Ausgabe
    const cleanPath = filePath.replace(/^([^:]+).*$/, '$1').trim();
    
    const changes = processFile(cleanPath, conditions);
    totalChanges += changes;
  }
  
  console.log(`Gesamtänderungen: ${totalChanges} unnötige Bedingungen wurden behoben.`);
}

main().catch(error => {
  console.error('Fehler bei der Ausführung des Skripts:', error);
  process.exit(1);
});
