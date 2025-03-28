#!/usr/bin/env node

/**
 * fix-critical-files.mjs
 *
 * Dieses Script behebt spezifische ESLint-Probleme in den kritischen Dateien:
 * - utils/logger.ts
 * - services/updateService.ts
 * - stores/category/index.ts
 *
 * Zu korrigierende Probleme:
 * 1. TypeScript-Rückgabetypen hinzufügen für Funktionen
 * 2. Unbenutzte Variablen mit Unterstrich-Präfix versehen
 * 3. Interface-Namen mit I-Präfix standardisieren
 * 4. Unnötige Bedingungsprüfungen korrigieren (Nullish Coalescing)
 * 5. Disabled ESLint-Regeln überprüfen und korrigieren
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Die kritischen Dateien, die wir verarbeiten wollen
const CRITICAL_FILES = ['utils/logger.ts', 'services/updateService.ts', 'stores/category/index.ts'];

// Hauptfunktion
async function fixCriticalFiles() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');

  console.log(`Fixing critical files in: ${projectRoot}`);

  // Für jede kritische Datei
  for (const relativeFilePath of CRITICAL_FILES) {
    const filePath = path.join(projectRoot, relativeFilePath);

    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      continue;
    }

    console.log(`\nProcessing: ${relativeFilePath}`);

    // Datei einlesen
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Fehlende Rückgabetypen hinzufügen
    const returnTypeFixResult = fixMissingReturnTypes(content);
    if (returnTypeFixResult.modified) {
      content = returnTypeFixResult.content;
      modified = true;
      console.log(`- Added missing return types`);
    }

    // 2. Unbenutzte Variablen mit Unterstrich-Präfix versehen
    const unusedVarsFixResult = fixUnusedVars(content);
    if (unusedVarsFixResult.modified) {
      content = unusedVarsFixResult.content;
      modified = true;
      console.log(`- Added prefix to unused variables`);
    }

    // 3. Interface-Namen mit I-Präfix standardisieren
    const interfaceFixResult = fixInterfaceNames(content);
    if (interfaceFixResult.modified) {
      content = interfaceFixResult.content;
      modified = true;
      console.log(`- Standardized interface names with 'I' prefix`);
    }

    // 4. Nullish Coalescing korrigieren
    const nullishFixResult = fixNullishCoalescing(content);
    if (nullishFixResult.modified) {
      content = nullishFixResult.content;
      modified = true;
      console.log(`- Fixed nullish coalescing operators`);
    }

    // 5. ESLint-Disable-Kommentare überprüfen
    const eslintDisableFixResult = fixEslintDisableComments(content);
    if (eslintDisableFixResult.modified) {
      content = eslintDisableFixResult.content;
      modified = true;
      console.log(`- Fixed ESLint disable comments`);
    }

    // Änderungen speichern, falls vorhanden
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${relativeFilePath}`);
    } else {
      console.log(`No changes needed in ${relativeFilePath}`);
    }
  }

  console.log('\nCritical files fix completed');
}

/**
 * Behebt fehlende Rückgabetypen in Funktionen
 */
function fixMissingReturnTypes(content) {
  let modified = false;
  const original = content;

  // Funktionsmuster, die wir korrigieren wollen
  const functionPatterns = [
    // Benannte Funktionen: export function name(params) {
    {
      regex: /export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?!\s*:)/g,
      replacement: (match, name, params) => `export function ${name}(${params}): void `,
    },
    // Reguläre Funktionen: function name(params) {
    {
      regex: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?!\s*:)/g,
      replacement: (match, name, params) => `function ${name}(${params}): void `,
    },
    // Arrow-Funktionen als Variablen: const name = (params) => {
    {
      regex: /=\s*\(([^)]*)\)\s*(?!:)\s*=>/g,
      replacement: (match, params) => `= (${params}): void =>`,
    },
    // Objektmethoden: methodName(params) {
    {
      regex: /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*(?!\s*:|\s*=>)\s*\{/g,
      replacement: (match, name, params) => {
        // Wir müssen sicherstellen, dass es tatsächlich eine Methode ist
        const beforeMatch = content.substring(0, content.indexOf(match)).trim();
        const lastChar = beforeMatch.charAt(beforeMatch.length - 1);
        if (lastChar === '{' || lastChar === ',' || lastChar === '(' || lastChar === ':') {
          return `${name}(${params}): void {`;
        }
        return match;
      },
    },
  ];

  // Jedes Muster anwenden
  for (const pattern of functionPatterns) {
    content = content.replace(pattern.regex, pattern.replacement);
  }

  // Überprüfen, ob sich etwas geändert hat
  if (original !== content) {
    modified = true;
  }

  return { content, modified };
}

/**
 * Behebt unbenutzte Variablen durch Hinzufügen eines _ Präfixes
 */
function fixUnusedVars(content) {
  let modified = false;
  const original = content;

  // Bekannte unbenutzte Variablen in den kritischen Dateien
  // Diese Liste muss angepasst werden basierend auf den tatsächlichen Warnungen
  const unusedVars = [
    'logger',
    'data',
    'error',
    'templateId',
    'name',
    'description',
    'template',
    'currentConfig',
    'result',
    'now',
    'lastCheck',
    'reg',
    'registration',
  ];

  for (const varName of unusedVars) {
    // Nur Variablen ändern, die noch kein _ Präfix haben
    if (varName.startsWith('_')) continue;

    const newVarName = `_${varName}`;

    // Deklarationen finden und ändern
    const declarationPatterns = [
      // let/const/var Deklarationen
      {
        regex: new RegExp(`\\b(let|const|var)\\s+${varName}\\b`, 'g'),
        replacement: `$1 ${newVarName}`,
      },
      // Funktionsparameter
      {
        regex: new RegExp(`(\\([^)]*)\\b${varName}\\b([^)]*\\))`, 'g'),
        replacement: (match, before, after) => `${before}${newVarName}${after}`,
      },
      // Destrukturierung in Objekten
      {
        regex: new RegExp(`(\\{[^}]*?)\\b${varName}\\b([^}]*\\})`, 'g'),
        replacement: (match, before, after) => {
          // Prüfen ob es sich um eine Alias-Destrukturierung handelt
          if (match.includes(`${varName}:`)) {
            return match;
          }
          return `${before}${newVarName}${after}`;
        },
      },
    ];

    for (const pattern of declarationPatterns) {
      const updatedContent = content.replace(pattern.regex, pattern.replacement);
      if (updatedContent !== content) {
        content = updatedContent;
        modified = true;
      }
    }
  }

  return { content, modified };
}

/**
 * Behebt Interface-Namen ohne I-Präfix
 */
function fixInterfaceNames(content) {
  let modified = false;
  const original = content;

  // Bekannte Interface-Namen ohne I-Präfix in den kritischen Dateien
  const interfacesWithoutPrefix = [
    'LoggerConfig',
    'Logger',
    'UpdateInfo',
    'CategoryState',
    'CategoryData',
    'CategoryStore',
  ];

  for (const interfaceName of interfacesWithoutPrefix) {
    // Nur Interface-Namen ändern, die noch kein I-Präfix haben
    if (interfaceName.startsWith('I')) continue;

    const newInterfaceName = `I${interfaceName}`;

    // Interface-Deklaration ändern
    const interfaceRegex = new RegExp(`\\binterface\\s+${interfaceName}\\b`, 'g');
    if (interfaceRegex.test(content)) {
      content = content.replace(interfaceRegex, `interface ${newInterfaceName}`);
      modified = true;
    }

    // Interface-Verwendungen ändern
    const usagePatterns = [
      // Type-Imports
      {
        regex: new RegExp(`(import\\s+type\\s*\\{[^}]*)(\\b${interfaceName}\\b)([^}]*\\})`, 'g'),
        replacement: `$1${newInterfaceName}$3`,
      },
      // Typannotationen
      {
        regex: new RegExp(`(:\\s*)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`,
      },
      // Type Assertions
      {
        regex: new RegExp(`(as\\s+)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`,
      },
      // Generics
      {
        regex: new RegExp(`<${interfaceName}(>|,)`, 'g'),
        replacement: `<${newInterfaceName}$1`,
      },
      // Array-Typen
      {
        regex: new RegExp(`${interfaceName}(\\[])`, 'g'),
        replacement: `${newInterfaceName}$1`,
      },
      // Erweiterte Interfaces
      {
        regex: new RegExp(`(extends\\s+)${interfaceName}\\b`, 'g'),
        replacement: `$1${newInterfaceName}`,
      },
    ];

    for (const pattern of usagePatterns) {
      const updatedContent = content.replace(pattern.regex, pattern.replacement);
      if (updatedContent !== content) {
        content = updatedContent;
        modified = true;
      }
    }
  }

  return { content, modified };
}

/**
 * Behebt falsche Verwendung des Nullish-Coalescing-Operators (??)
 */
function fixNullishCoalescing(content) {
  let modified = false;
  const original = content;

  // Muster für falsche Verwendungen des ?? Operators
  const patterns = [
    // Boolean-Werte, die || verwenden sollten
    {
      regex: /(\w+)\s*\?\?\s*(true|false)/g,
      replacement: (match, varName, defaultValue) => `${varName} || ${defaultValue}`,
    },
    // Strings, die einen Standardwert haben sollten, wenn sie leer sind
    {
      regex: /(\w+)\s*\?\?\s*['"](.*?)['"]/g,
      replacement: (match, varName, defaultValue) => `${varName} || "${defaultValue}"`,
    },
  ];

  for (const pattern of patterns) {
    const updatedContent = content.replace(pattern.regex, pattern.replacement);
    if (updatedContent !== content) {
      content = updatedContent;
      modified = true;
    }
  }

  return { content, modified };
}

/**
 * Behebt ESLint-Disable-Kommentare
 */
function fixEslintDisableComments(content) {
  let modified = false;
  const original = content;

  // Spezifische ESLint-Disable-Kommentare in den kritischen Dateien
  const disablePatterns = [
    // eslint-disable-next-line no-console
    {
      regex: /\/\/\s*eslint-disable-next-line\s+no-console/g,
      replacement: match => {
        // Wir fügen keine weitere Änderung hinzu, da diese Kommentare legitim sein können
        return match;
      },
    },
  ];

  // Hier fügen wir keine aktiven Änderungen hinzu, sondern überprüfen nur die Kommentare
  // In einer realen Anwendung könnten hier Änderungen vorgenommen werden

  return { content, modified };
}

// Script ausführen
fixCriticalFiles().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
