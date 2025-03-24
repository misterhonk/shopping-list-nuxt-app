#!/usr/bin/env node

/**
 * Skript zur automatischen Korrektur von Interface-Namen ohne I-Präfix
 * 
 * Liest die Datei interface-issues.txt und korrigiert alle aufgelisteten Interface-Namen
 * in den entsprechenden Dateien, indem es das I-Präfix hinzufügt.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hilfsfunktion für __dirname Äquivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Projektbasis-Verzeichnis
const baseDir = path.resolve(__dirname, '..');

// Liest die issues-Datei
const issuesFilePath = path.join(baseDir, 'interface-issues.txt');
if (!fs.existsSync(issuesFilePath)) {
  console.error(`Die Datei ${issuesFilePath} wurde nicht gefunden.`);
  process.exit(1);
}

const issuesContent = fs.readFileSync(issuesFilePath, 'utf8');

// Findet Interface-Namen, die mit dem I-Präfix versehen werden müssen
const interfaceIssueRegex = /Interface name `([^`]+)` must have one of the following prefixes: I/g;
let match;
const interfacesToFix = [];

while ((match = interfaceIssueRegex.exec(issuesContent)) !== null) {
  interfacesToFix.push(match[1]);
}

// Eindeutige Liste von Interface-Namen
const uniqueInterfacesToFix = [...new Set(interfacesToFix)];

console.log(`Gefundene Interface-Namen ohne I-Präfix: ${uniqueInterfacesToFix.length}`);
console.log(uniqueInterfacesToFix);

// Suche nach Dateien im Projekt, die TypeScript-Code enthalten könnten
const dirsToSearch = [
  'components',
  'composables',
  'pages',
  'stores',
  'services',
  'utils',
  'types',
  'plugins'
];

// Verarbeite jede Datei
async function processFiles() {
  let totalChanges = 0;

  for (const dir of dirsToSearch) {
    const dirPath = path.join(baseDir, dir);
    
    if (!fs.existsSync(dirPath)) {
      continue;
    }
    
    await processDirectory(dirPath);
  }

  console.log(`Insgesamt wurden ${totalChanges} Änderungen vorgenommen.`);
  
  // Hilfsfunktion zum rekursiven Durchsuchen von Verzeichnissen
  async function processDirectory(directoryPath) {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);
      
      if (entry.isDirectory()) {
        // Rekursiv Unterverzeichnisse durchsuchen
        if (entry.name !== 'node_modules' && entry.name !== '.nuxt' && entry.name !== 'dist') {
          await processDirectory(fullPath);
        }
      } else if (entry.isFile() && 
                (entry.name.endsWith('.ts') || 
                 entry.name.endsWith('.vue'))) {
        
        // Verarbeite die Datei
        const changes = await processFile(fullPath);
        totalChanges += changes;
      }
    }
  }
  
  // Hilfsfunktion zur Verarbeitung einer Datei
  async function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    
    // Für jedes zu fixende Interface
    for (const interfaceName of uniqueInterfacesToFix) {
      // Ersetzt "interface InterfaceName {" mit "interface IInterfaceName {"
      const interfaceRegex = new RegExp(`interface\\s+${interfaceName}\\s*\\{`, 'g');
      
      // Zähle Vorkommen
      const matches = content.match(interfaceRegex);
      if (matches && matches.length > 0) {
        changes += matches.length;
        
        // Ersetze alle Vorkommen
        content = content.replace(interfaceRegex, `interface I${interfaceName} {`);
        
        // Auch alle Referenzen zum Interface aktualisieren
        const referenceRegex = new RegExp(`(\\W)${interfaceName}([\\s:\\)<,])`, 'g');
        content = content.replace(referenceRegex, `$1I${interfaceName}$2`);
      }
    }
    
    // Schreibe die Datei nur, wenn Änderungen vorgenommen wurden
    if (changes > 0) {
      console.log(`${changes} Änderungen in ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    return changes;
  }
}

processFiles().catch(error => {
  console.error('Fehler bei der Verarbeitung der Dateien:', error);
  process.exit(1);
});
