#!/usr/bin/env node

/**
 * Script zum Präfixieren ungenutzter Variablen mit Unterstrich
 *
 * Dieses Script sucht nach ESLint-Warnungen über unbenutzte Variablen
 * und fügt ein Unterstrich-Präfix zu diesen Variablen hinzu.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Hilfsfunktion für __dirname Äquivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ESLint ausführen, um alle ungenutzten Variablen zu finden
function findUnusedVariables() {
  try {
    console.log('Führe ESLint aus, um unbenutzte Variablen zu finden...');
    const eslintOutput = execSync('npx eslint --ext .ts,.vue --format json .', {
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..'),
    });

    // Parsen der JSON-Ausgabe
    const eslintResults = JSON.parse(eslintOutput);

    // Filtern nach ESLint-Regeln für unbenutzte Variablen
    const unusedVarsMessages = [];

    eslintResults.forEach(result => {
      result.messages.forEach(message => {
        if (
          message.ruleId === '@typescript-eslint/no-unused-vars' ||
          message.ruleId === 'unused-imports/no-unused-vars'
        ) {
          unusedVarsMessages.push({
            filePath: result.filePath,
            line: message.line,
            column: message.column,
            variableName: extractVariableNameFromMessage(message.message),
            message: message.message,
          });
        }
      });
    });

    return unusedVarsMessages;
  } catch (error) {
    // Fehlerhandling, falls die Ausgabe kein gültiges JSON ist
    console.error('Fehler beim Ausführen von ESLint:', error.message);

    // Versuchen wir es mit einer anderen Methode für Fehlerbehandlung
    try {
      const grepCmd = "npx eslint --ext .ts,.vue . | grep -E 'is assigned a value but never used'";
      const grepOutput = execSync(grepCmd, {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '..'),
      });

      // Manuelles Parsing der Ausgabe
      const lines = grepOutput.split('\n');
      const unusedVarsMessages = [];

      lines.forEach(line => {
        if (line.trim() === '') return;

        // Format: /path/to/file.vue:123:45: error: 'variableName' is assigned a value but never used
        const match = line.match(/([^:]+):(\d+):(\d+):.*'(\w+)'.+never used/);
        if (match) {
          unusedVarsMessages.push({
            filePath: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            variableName: match[4],
            message: line,
          });
        }
      });

      return unusedVarsMessages;
    } catch (grepError) {
      console.error('Fehler beim alternativen Ansatz:', grepError.message);
      return [];
    }
  }
}

// Hilfsfunktion zum Extrahieren des Variablennamens aus einer ESLint-Fehlermeldung
function extractVariableNameFromMessage(message) {
  const match = message.match(/'([^']+)'.+never used/);
  return match ? match[1] : '';
}

// Funktion zum Hinzufügen von Unterstrich-Präfixen zu Variablen
function addUnderscorePrefix(unusedVarsMessages) {
  const fileChanges = {};

  // Sammle Änderungen nach Datei
  unusedVarsMessages.forEach(({ filePath, line, variableName }) => {
    if (!variableName || variableName.startsWith('_')) return;

    if (!fileChanges[filePath]) {
      fileChanges[filePath] = [];
    }

    fileChanges[filePath].push({
      line,
      variableName,
      newName: `_${variableName}`,
    });
  });

  // Jetzt verarbeiten wir jede Datei
  for (const filePath in fileChanges) {
    try {
      console.log(`\nBearbeite ${filePath}...`);
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Sortiere Änderungen nach Zeile (absteigend), um Positionsänderungen zu vermeiden
      const changes = fileChanges[filePath].sort((a, b) => b.line - a.line);

      for (const change of changes) {
        const lineIndex = change.line - 1;
        const line = lines[lineIndex];

        // Suche nach 'const variableName' oder 'let variableName'
        const regex = new RegExp(`(const|let)\\s+(${change.variableName})\\b`, 'g');
        const updatedLine = line.replace(regex, `$1 ${change.newName}`);

        if (line !== updatedLine) {
          lines[lineIndex] = updatedLine;
          console.log(`  - Geändert: '${change.variableName}' zu '${change.newName}'`);
        } else {
          console.log(`  - Konnte '${change.variableName}' nicht finden oder ändern`);
        }
      }

      // Schreibe die aktualisierte Datei
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`  Änderungen in ${filePath} gespeichert.`);
    } catch (error) {
      console.error(`Fehler beim Bearbeiten von ${filePath}:`, error.message);
    }
  }
}

// Hauptfunktion
async function main() {
  console.log('Starte Skript zum Präfixieren ungenutzter Variablen...');

  const unusedVarsMessages = findUnusedVariables();

  if (unusedVarsMessages.length === 0) {
    console.log('Keine ungenutzten Variablen gefunden.');
    return;
  }

  console.log(`${unusedVarsMessages.length} unbenutzte Variablen gefunden.`);

  // Füge Präfixe hinzu
  addUnderscorePrefix(unusedVarsMessages);

  console.log('\nFix für unbenutzte Variablen abgeschlossen!');
}

main().catch(error => {
  console.error('Unerwarteter Fehler:', error);
  process.exit(1);
});
