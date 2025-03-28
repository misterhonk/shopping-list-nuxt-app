#!/usr/bin/env node

/**
 * fix-unused-vars-prefix.mjs
 *
 * Dieses Script fügt allen ungenutzten Variablen ein _ Präfix hinzu, um ESLint-Warnungen zu vermeiden.
 * Es scannt die in unused-vars.txt aufgelisteten Probleme und korrigiert sie in den entsprechenden Dateien.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hauptfunktion
async function fixUnusedVarsPrefix() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');

  console.log(`Fixing unused variables in: ${projectRoot}`);

  // Die Liste der ungenutzten Variablen einlesen
  const unusedVarsFile = path.join(projectRoot, 'unused-vars.txt');
  let unusedVarsContent;

  try {
    unusedVarsContent = fs.readFileSync(unusedVarsFile, 'utf8');
  } catch (error) {
    console.error(`Error reading unused-vars.txt: ${error.message}`);
    return;
  }

  // Parsen der ungenutzten Variablen aus der Datei
  // Format: line:column error 'varName' is assigned a value but never used
  const unusedVarsPattern = /'([^']+)' is assigned a value but never used/g;
  let match;
  const uniqueVars = new Set();

  while ((match = unusedVarsPattern.exec(unusedVarsContent)) !== null) {
    const varName = match[1];
    // Nur Variablen hinzufügen, die noch kein Unterstrich-Präfix haben
    if (!varName.startsWith('_')) {
      uniqueVars.add(varName);
    }
  }

  console.log(`Found ${uniqueVars.size} unique unused variables to fix:`);
  uniqueVars.forEach(varName => console.log(`  - ${varName}`));

  // Alle .ts und .vue Dateien scannen
  const files = scanDir(projectRoot);
  console.log(`Scanning ${files.length} files for unused variables...`);

  let totalFixedVars = 0;

  // Für jede ungenutzte Variable
  for (const varName of uniqueVars) {
    // Nur wenn der Name nicht bereits mit _ beginnt
    if (varName.startsWith('_')) continue;

    const newVarName = `_${varName}`;
    console.log(`\nProcessing variable: ${varName} -> ${newVarName}`);

    // Für jede Datei
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Variablendeklarationen finden und ersetzen
      // Berücksichtigt verschiedene Deklarationsarten: let, const, var, Funktionsparameter
      const declarationPatterns = [
        // let/const/var Deklarationen
        new RegExp(`\\b(let|const|var)\\s+${varName}\\b`, 'g'),
        // Funktionsparameter
        new RegExp(`\\(([^)]*)\\b${varName}\\b([^)]*)\\)`, 'g'),
        // Destrukturierung in Objekten
        new RegExp(`\\{([^}]*)\\b${varName}\\b([^}]*)\\}`, 'g'),
      ];

      for (const pattern of declarationPatterns) {
        if (pattern.test(content)) {
          if (pattern.toString().includes('let|const|var')) {
            // Für normale Variablendeklarationen
            content = content.replace(
              new RegExp(`\\b(let|const|var)\\s+${varName}\\b`, 'g'),
              `$1 ${newVarName}`
            );
          } else if (pattern.toString().includes('\\(')) {
            // Für Funktionsparameter - komplexer, da wir den ganzen Parameter erhalten müssen
            const paramRegex = new RegExp(`(\\([^)]*?)\\b${varName}\\b([^)]*\\))`, 'g');
            content = content.replace(paramRegex, (match, before, after) => {
              // Sicherstellen, dass wir nicht bereits umbenannte Parameter erneut umbenennen
              return `${before}${newVarName}${after}`;
            });
          } else if (pattern.toString().includes('\\{')) {
            // Für Objektdestrukturierung - ebenfalls komplex
            const destructRegex = new RegExp(`(\\{[^}]*?)\\b${varName}\\b([^}]*\\})`, 'g');
            content = content.replace(destructRegex, (match, before, after) => {
              // Prüfen ob es sich um eine Alias-Destrukturierung handelt (z.B. { varName: aliasName })
              const aliasMatch = new RegExp(`\\b${varName}\\s*:\\s*([^,}]+)`, 'g').exec(match);
              if (aliasMatch) {
                // Hier handelt es sich um eine benannte Eigenschaft, die einen Alias erhält
                return match;
              }
              return `${before}${newVarName}${after}`;
            });
          }
          modified = true;
        }
      }

      // Wenn wir Änderungen vorgenommen haben, speichern wir die Datei
      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`  Modified in ${path.relative(projectRoot, file)}`);
        totalFixedVars++;
      }
    }
  }

  console.log(`\nFixed ${totalFixedVars} unused variables`);
}

// Helferfunktion zum rekursiven Scannen von Verzeichnissen
function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !filePath.includes('node_modules') &&
      !filePath.includes('.nuxt') &&
      !filePath.includes('.output')
    ) {
      scanDir(filePath, fileList);
    } else if ((file.endsWith('.ts') || file.endsWith('.vue')) && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

// Script ausführen
fixUnusedVarsPrefix().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
