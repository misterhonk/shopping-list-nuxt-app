#!/usr/bin/env node

/**
 * Verbessertes Script zur Korrektur von Interface-Namen
 *
 * Dieses Script sucht nach ESLint-Warnungen bezüglich Interface-Namen ohne I-Präfix
 * und fügt dieses Präfix hinzu. Es findet auch Referenzen auf diese Interfaces und aktualisiert sie.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Hilfsfunktion für __dirname Äquivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ESLint ausführen, um alle Interface-Namen ohne I-Präfix zu finden
function findInterfaceNamingIssues() {
  try {
    console.log('Führe ESLint aus, um Interface-Namenskonventionsprobleme zu finden...');
    const eslintOutput = execSync('npx eslint --ext .ts,.vue --format json .', {
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..'),
    });

    // Parsen der JSON-Ausgabe
    const eslintResults = JSON.parse(eslintOutput);

    // Filtern nach ESLint-Regeln für Interface-Namenskonventionen
    const interfaceNameMessages = [];

    eslintResults.forEach(result => {
      result.messages.forEach(message => {
        if (
          message.ruleId === '@typescript-eslint/naming-convention' &&
          message.message.includes('Interface name')
        ) {
          interfaceNameMessages.push({
            filePath: result.filePath,
            line: message.line,
            column: message.column,
            interfaceName: extractInterfaceNameFromMessage(message.message),
            message: message.message,
          });
        }
      });
    });

    return interfaceNameMessages;
  } catch (error) {
    // Fehlerhandling, falls die Ausgabe kein gültiges JSON ist
    console.error('Fehler beim Ausführen von ESLint:', error.message);

    // Versuchen wir es mit einer anderen Methode für Fehlerbehandlung
    try {
      const grepCmd =
        "npx eslint --ext .ts,.vue . | grep -E 'Interface name.*must have one of the following prefixes: I'";
      const grepOutput = execSync(grepCmd, {
        encoding: 'utf8',
        cwd: path.resolve(__dirname, '..'),
      });

      // Manuelles Parsing der Ausgabe
      const lines = grepOutput.split('\n');
      const interfaceNameMessages = [];

      lines.forEach(line => {
        if (line.trim() === '') return;

        // Format: /path/to/file.vue:123:45: warning: Interface name 'InterfaceName' must have one of the following prefixes: I
        const match = line.match(/([^:]+):(\d+):(\d+):.+Interface name '(\w+)'.+prefixes: I/);
        if (match) {
          interfaceNameMessages.push({
            filePath: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            interfaceName: match[4],
            message: line,
          });
        }
      });

      return interfaceNameMessages;
    } catch (grepError) {
      console.error('Fehler beim alternativen Ansatz:', grepError.message);
      return [];
    }
  }
}

// Hilfsfunktion zum Extrahieren des Interface-Namens aus einer ESLint-Fehlermeldung
function extractInterfaceNameFromMessage(message) {
  const match = message.match(/Interface name ['"]([\w]+)['"]/);
  return match ? match[1] : '';
}

// Funktion zum Hinzufügen von I-Präfixen zu Interface-Namen und ihren Referenzen
function addIPrefixToInterfaces(interfaceNameMessages) {
  const fileInterfaceMap = {};

  // Gruppiere nach Datei für bessere Performance
  interfaceNameMessages.forEach(({ filePath, interfaceName }) => {
    if (!interfaceName || interfaceName.startsWith('I')) return;

    if (!fileInterfaceMap[filePath]) {
      fileInterfaceMap[filePath] = new Set();
    }

    fileInterfaceMap[filePath].add(interfaceName);
  });

  // Aktualisiere Interface-Namen in jeder Datei
  for (const filePath in fileInterfaceMap) {
    try {
      console.log(`\nBearbeite ${filePath}...`);
      let content = fs.readFileSync(filePath, 'utf8');

      const interfaceNames = Array.from(fileInterfaceMap[filePath]);

      for (const interfaceName of interfaceNames) {
        const newName = `I${interfaceName}`;

        // Suche und ersetze Interface-Definition
        const interfacePattern = new RegExp(`interface\\s+${interfaceName}\\b`, 'g');
        content = content.replace(interfacePattern, `interface ${newName}`);

        // Suche und ersetze Typ-Referenzen
        const typePattern = new RegExp(`:\\s*${interfaceName}\\b`, 'g');
        content = content.replace(typePattern, `: ${newName}`);

        // Suche und ersetze Generic-Typ-Referenzen
        const genericPattern = new RegExp(`<\\s*${interfaceName}\\b`, 'g');
        content = content.replace(genericPattern, `<${newName}`);

        // Suche und ersetze Typumwandlungen
        const castPattern = new RegExp(`as\\s+${interfaceName}\\b`, 'g');
        content = content.replace(castPattern, `as ${newName}`);

        // Suche und ersetze vereinfachte Propertytypen
        const propertyTypePattern = new RegExp(`${interfaceName}\\s*;`, 'g');
        content = content.replace(propertyTypePattern, `${newName};`);

        // Suche und ersetze Import/Export-Deklarationen
        const importExportPattern = new RegExp(
          `([import|export]\\s+{[^}]*?)\\b${interfaceName}\\b`,
          'g'
        );
        content = content.replace(importExportPattern, `$1${newName}`);

        console.log(`  - Interface '${interfaceName}' zu '${newName}' geändert`);
      }

      // Schreibe die aktualisierte Datei
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  Änderungen in ${filePath} gespeichert.`);
    } catch (error) {
      console.error(`Fehler beim Bearbeiten von ${filePath}:`, error.message);
    }
  }

  // Jetzt suchen wir nach Referenzen in anderen Dateien
  console.log('\nSuche nach Referenzen in anderen Dateien...');

  // Sammle alle zu ändernden Interface-Namen
  const allInterfaceNames = new Set();
  for (const interfaces of Object.values(fileInterfaceMap)) {
    for (const name of interfaces) {
      allInterfaceNames.add(name);
    }
  }

  // Liste aller relevanten Dateien
  const filesToSearch = new Set();
  Object.keys(fileInterfaceMap).forEach(filePath => filesToSearch.add(filePath));

  // Rekursives Suchen von relevanten Dateien, die TypeScript- oder Vue-Dateien sind
  function findRelevantFiles(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findRelevantFiles(filePath);
      } else if (
        stat.isFile() &&
        (file.endsWith('.ts') || file.endsWith('.vue')) &&
        !filesToSearch.has(filePath)
      ) {
        filesToSearch.add(filePath);
      }
    }
  }

  // Starte die Suche im Projektverzeichnis
  findRelevantFiles(path.resolve(__dirname, '..'));

  // Durchsuche alle Dateien nach Referenzen auf die Interface-Namen
  for (const filePath of filesToSearch) {
    try {
      if (fileInterfaceMap[filePath]) continue; // Überspringe bereits verarbeitete Dateien

      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;

      for (const interfaceName of allInterfaceNames) {
        const newName = `I${interfaceName}`;

        // Prüfe, ob die Datei Referenzen auf den Interface-Namen enthält
        if (content.includes(interfaceName)) {
          // Typ-Referenzen
          const typePattern = new RegExp(`:\\s*${interfaceName}\\b`, 'g');
          const contentBefore = content;
          content = content.replace(typePattern, `: ${newName}`);

          // Generic-Typ-Referenzen
          const genericPattern = new RegExp(`<\\s*${interfaceName}\\b`, 'g');
          content = content.replace(genericPattern, `<${newName}`);

          // Typumwandlungen
          const castPattern = new RegExp(`as\\s+${interfaceName}\\b`, 'g');
          content = content.replace(castPattern, `as ${newName}`);

          // Import-Deklarationen
          const importPattern = new RegExp(`import\\s+{[^}]*?\\b${interfaceName}\\b`, 'g');
          content = content.replace(importPattern, match => match.replace(interfaceName, newName));

          if (content !== contentBefore) {
            hasChanges = true;
            console.log(`  - In ${filePath}: Referenz '${interfaceName}' zu '${newName}' geändert`);
          }
        }
      }

      // Schreibe die aktualisierte Datei nur, wenn es Änderungen gab
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Änderungen in ${filePath} gespeichert.`);
      }
    } catch (error) {
      console.error(`Fehler beim Bearbeiten von ${filePath}:`, error.message);
    }
  }
}

// Hauptfunktion
async function main() {
  console.log('Starte Skript zur Korrektur von Interface-Namen...');

  const interfaceNameMessages = findInterfaceNamingIssues();

  if (interfaceNameMessages.length === 0) {
    console.log('Keine Interface-Namenskonventionsprobleme gefunden.');
    return;
  }

  console.log(`${interfaceNameMessages.length} Interface-Namenskonventionsprobleme gefunden.`);

  // Führe die Korrekturen durch
  addIPrefixToInterfaces(interfaceNameMessages);

  console.log('\nInterface-Namenskorrekturen abgeschlossen!');
}

main().catch(error => {
  console.error('Unerwarteter Fehler:', error);
  process.exit(1);
});
