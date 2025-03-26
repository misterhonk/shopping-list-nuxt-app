#!/usr/bin/env node

/**
 * Fix ESLint warnings in composables files
 * 
 * This script:
 * - Fixes return type declarations
 * - Removes duplicate JSDoc comments
 * - Makes variable naming consistent (removes underscore where not needed)
 * - Adds missing type declarations
 */

import fs from 'fs';
import path from 'path';

// Path to the first composable to fix
const composablePath = path.resolve('composables/useShoppingLists.ts');

// Read the file
let content = fs.readFileSync(composablePath, 'utf8');

// 1. Fix return type for useShoppingLists
content = content.replace(
  /export function useShoppingLists\(\): void {/,
  `export function useShoppingLists() {`
);

// 2. Remove duplicate JSDoc comments
content = content.replace(
  /\/\*\*\n \* Composable für die Verwaltung von Einkaufslisten\n \* Bietet Funktionen zum Erstellen, Aktualisieren, Löschen und Auswählen von Listen\n \*\/\n\/\*\*\n \* Aktiviert das Kategorien-Template im Store \(wenn möglich\)\n \* Lagert die Error-Handlung in eine separate Funktion aus\n \*\/\n/,
  `/**\n * Composable für die Verwaltung von Einkaufslisten\n * Bietet Funktionen zum Erstellen, Aktualisieren, Löschen und Auswählen von Listen\n */\n`
);

content = content.replace(
  /\/\*\*\n \* Composable für die Verwaltung von Einkaufslisten\n \* Bietet Funktionen zum Erstellen, Aktualisieren, Löschen und Auswählen von Listen\n \*\/\n\/\*\*\n \* Factory für einen sicheren Kategorie-Store Zugriff\n \*\/\n/,
  `/**\n * Factory für einen sicheren Kategorie-Store Zugriff\n */\n`
);

// 3. Fix incorrect return type for listManagementHelpers
content = content.replace(
  /const listManagementHelpers = \(\): void => {/,
  `const listManagementHelpers = () => {`
);

// 4. Remove underscore prefixes from actively used variables
content = content.replace(
  /const _currentListTemplateId = computed\(\{/g,
  'const currentListTemplateId = computed({'
);

content = content.replace(
  /const _getCheckedItemsCount = \(\): number =>/g,
  'const getCheckedItemsCount = (): number =>'
);

// 5. Update return statement to include renamed variables
content = content.replace(
  /_currentListTemplateId,/g,
  'currentListTemplateId,'
);

content = content.replace(
  /_getCheckedItemsCount,/g,
  'getCheckedItemsCount,'
);

// Write the file back
fs.writeFileSync(composablePath, content);

console.log('Fixed composables/useShoppingLists.ts');
