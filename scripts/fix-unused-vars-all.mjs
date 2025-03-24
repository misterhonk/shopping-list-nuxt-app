#!/usr/bin/env node

/**
 * Skript zur automatischen Korrektur ungenutzter Variablen
 *
 * Findet alle Variablen, die mit "is assigned a value but never used" Warnungen
 * markiert sind und fügt ein Unterstrich-Präfix hinzu.
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
function collectUnusedVariables() {
  console.log('Sammle ungenutzte Variablen mit ESLint...');

  let eslintOutput;
  try {
    eslintOutput = execSync('npx eslint --ext .js,.ts,.vue --ignore-path .eslintignore .', {
      cwd: baseDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    // ESLint gibt einen Fehler zurück, wenn es Probleme findet, also nehmen wir die Ausgabe
    eslintOutput = error.stdout;
  }

  // Extrahiere Variablennamen aus den "@typescript-eslint/no-unused-vars" Warnungen
  const unusedVarsRegex = /'([^']+)' is assigned a value but never used/g;
  const unusedVars = new Map(); // Map, um Datei -> Array von Variablennamen zu speichern

  let match;
  let currentFile = null;

  // Durch die ESLint-Ausgabe zeilenweise gehen
  const lines = eslintOutput.split('\n');
  for (const line of lines) {
    // Neue Datei gefunden
    if (line.includes('/Users/martinmelcher/Dev/shopping-list-app/')) {
      currentFile = line.trim();
      continue;
    }

    // Wenn wir in einer Datei sind und eine no-unused-vars Warnung finden
    if (
      currentFile &&
      (line.includes('@typescript-eslint/no-unused-vars') ||
        line.includes('unused-imports/no-unused-vars'))
    ) {
      // Extrahiere den Variablennamen
      const warningMatch = line.match(/'([^']+)' is assigned a value but never used/);
      if (warningMatch && warningMatch[1]) {
        const varName = warningMatch[1];

        // Füge zur Map hinzu, wenn die Variable nicht schon mit einem Unterstrich beginnt
        if (!varName.startsWith('_')) {
          if (!unusedVars.has(currentFile)) {
            unusedVars.set(currentFile, []);
          }
          unusedVars.get(currentFile).push(varName);
        }
      }
    }
  }

  return unusedVars;
}

// Verarbeite die Datei und präfixe die ungenutzten Variablen
function processFile(filePath, variablesToFix) {
  if (!fs.existsSync(filePath)) {
    console.error(`Datei nicht gefunden: ${filePath}`);
    return 0;
  }

  console.log(`Verarbeite Datei: ${filePath}`);
  console.log(`Zu fixende Variablen: ${variablesToFix.join(', ')}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  for (const varName of variablesToFix) {
    // Verschiedene Deklarationspatterns matchen
    const patterns = [
      // const name = ...
      new RegExp(`(const|let|var)\\s+${varName}\\s*=`, 'g'),
      // function params (name) or function name(name)
      new RegExp(`(function\\s*\\w*\\s*\\([^)]*?)(\\b${varName}\\b)([^)]*\\))`, 'g'),
      // In defineProps<{}>() Patterns
      new RegExp(`(defineProps<\\{[^}]*?)\\b${varName}\\b([^}]*\\}>\\(\\))`, 'g'),
      // In component setup function parameter lists
      new RegExp(`(setup\\s*\\([^)]*?)(\\b${varName}\\b)([^)]*\\))`, 'g'),
      // In arrow functions
      new RegExp(`(\\([^)]*?)(\\b${varName}\\b)([^)]*\\)\\s*=>)`, 'g'),
    ];

    for (const pattern of patterns) {
      // Zähle die Vorkommen
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        if (pattern.source.includes('defineProps')) {
          // Spezialfall: In defineProps ändern wir den Parameter nicht
          continue;
        }

        if (pattern.source.includes('const|let|var')) {
          // Für Variablendeklarationen
          content = content.replace(pattern, `$1 _${varName} =`);
        } else if (pattern.source.includes('function')) {
          // Für Funktionsparameter
          content = content.replace(pattern, `$1_${varName}$3`);
        } else if (pattern.source.includes('setup')) {
          // Für setup Parameter
          content = content.replace(pattern, `$1_${varName}$3`);
        } else if (pattern.source.includes('\\(\\[')) {
          // Für arrow functions
          content = content.replace(pattern, `$1_${varName}$3`);
        }

        changes += matches.length;
        console.log(`  ${matches.length} Vorkommen von "${varName}" zu "_${varName}" geändert`);
      }
    }
  }

  // Schreibe die Datei nur, wenn Änderungen vorgenommen wurden
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Gesamt: ${changes} Änderungen in der Datei`);
  } else {
    console.log(`  Keine Änderungen in der Datei vorgenommen`);
  }

  return changes;
}

// Hauptfunktion
async function main() {
  // Sammle ungenutzte Variablen
  const unusedVarsMap = collectUnusedVariables();

  if (unusedVarsMap.size === 0) {
    console.log('Keine ungenutzten Variablen gefunden.');
    return;
  }

  console.log(`Gefunden: ${unusedVarsMap.size} Dateien mit ungenutzten Variablen.`);

  // Verarbeite jede Datei
  let totalChanges = 0;

  for (const [filePath, variables] of unusedVarsMap.entries()) {
    // Extrahiere den realen Dateipfad aus der ESLint-Ausgabe
    const cleanPath = filePath.replace(/^([^:]+).*$/, '$1').trim();

    const changes = processFile(cleanPath, variables);
    totalChanges += changes;
  }

  console.log(`Gesamtänderungen: ${totalChanges} Variablen wurden mit Unterstrich präfixiert.`);
}

main().catch(error => {
  console.error('Fehler bei der Ausführung des Skripts:', error);
  process.exit(1);
});
