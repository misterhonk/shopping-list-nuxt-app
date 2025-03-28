#!/usr/bin/env node

/**
 * fix-arrow-functions.mjs
 *
 * Dieses Script behebt spezifische Probleme mit Pfeilfunktionen (=> expected)
 * in den Dateien, die durch unsere vorherigen Skripte nicht behoben wurden.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Bekannte Dateien mit Pfeilfunktionsfehlern
const PROBLEMATIC_FILES = [
  'composables/importExport/index.ts',
  'composables/importExport/useListImport.ts',
  'composables/shoppingItems/debug-helpers.ts',
  'composables/utils/operations/listOperations.ts',
  'composables/useShoppingItems.ts',
  'stores/category/migration.ts',
  'utils/validation/formValidation.ts',
];

// Hauptfunktion
async function fixArrowFunctions() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');

  console.log(`Fixing arrow function problems in: ${projectRoot}`);

  // Für jede Datei
  for (const relativeFilePath of PROBLEMATIC_FILES) {
    const filePath = path.join(projectRoot, relativeFilePath);

    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      continue;
    }

    console.log(`\nProcessing: ${relativeFilePath}`);

    // Datei einlesen
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Pfeilfunktionstypen im Parameter korrigieren
    // z.B. (param: ReturnType): void => ReturnType in (param) => ReturnType
    const arrowParamReturnTypeRegex = /\(([^)]*)\)\s*:\s*(\w+(?:<[^>]+>)?(?:\[\])?)\s*=>/g;
    const updatedContent1 = content.replace(
      arrowParamReturnTypeRegex,
      (match, params, returnType) => {
        console.log(`  - Fixed arrow function parameter return type in line: ${match}`);
        return `(${params}) => ${returnType}`;
      }
    );

    if (updatedContent1 !== content) {
      content = updatedContent1;
      modified = true;
    }

    // 2. Falsche Callbacktypen korrigieren
    const callbackTypeRegex = /(\w+)\s*\(([^)]*)\)\s*:\s*([^=]+)\s*=>\s*([^{;]+)/g;
    const updatedContent2 = content.replace(
      callbackTypeRegex,
      (match, name, params, returnType, callback) => {
        console.log(`  - Fixed callback type declaration in line: ${match}`);
        return `${name}(${params}): ${callback} => ${returnType}`;
      }
    );

    if (updatedContent2 !== content) {
      content = updatedContent2;
      modified = true;
    }

    // 3. Pfeilfunktionen in Funktionssignaturen korrigieren
    // z.B. function(param: Type): void => ResultType in function(param: Type): ResultType
    const functionReturnArrowRegex =
      /function\s*\(([^)]*)\)\s*:\s*void\s*=>\s*(\w+(?:<[^>]+>)?(?:\[\])?)/g;
    const updatedContent3 = content.replace(
      functionReturnArrowRegex,
      (match, params, returnType) => {
        console.log(`  - Fixed function return arrow in line: ${match}`);
        return `function(${params}): ${returnType}`;
      }
    );

    if (updatedContent3 !== content) {
      content = updatedContent3;
      modified = true;
    }

    // 4. Manueller Fix für specific file useItemForm.ts (line 84)
    if (relativeFilePath === 'composables/shoppingItems/useItemForm.ts') {
      const specificRegex = /const\s+setFormField\s*=\s*<T>\s*\(field:/;
      if (specificRegex.test(content)) {
        content = content.replace(
          specificRegex,
          'const setFormField = <T extends keyof IItemFormState>(field:'
        );
        console.log('  - Fixed generic type parameter in useItemForm.ts');
        modified = true;
      }
    }

    // 5. Andere spezifische Probleme
    // Manchmal gibt es spezifische Probleme, die individuell behandelt werden müssen

    // Wenn geändert, Datei speichern
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${relativeFilePath}`);
    } else {
      console.log(`No changes needed in ${relativeFilePath}`);
    }
  }

  console.log('\nArrow function fixes completed');
}

// Script ausführen
fixArrowFunctions().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
