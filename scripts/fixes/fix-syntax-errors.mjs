#!/usr/bin/env node

/**
 * fix-syntax-errors.mjs
 * 
 * Dieses Script behebt spezifische Syntaxfehler in bestimmten Dateien,
 * die durch die vorherigen Skripte nicht erfasst wurden.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hauptfunktion
async function fixSyntaxErrors() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');
  
  console.log(`Fixing specific syntax errors in: ${projectRoot}`);
  
  // Fix für useItemForm.ts
  const useItemFormPath = path.join(projectRoot, 'composables/shoppingItems/useItemForm.ts');
  if (fs.existsSync(useItemFormPath)) {
    console.log('Fixing useItemForm.ts...');
    let content = fs.readFileSync(useItemFormPath, 'utf8');
    
    // Fix für das "as const" Problem
    const badSyntax = /}\s*as\s+const\s*}/g;
    if (badSyntax.test(content)) {
      content = content.replace(badSyntax, '}\n    },');
      fs.writeFileSync(useItemFormPath, content, 'utf8');
      console.log('✓ Fixed as const syntax in useItemForm.ts');
    }
  }
  
  // Fix für formValidation.ts
  const formValidationPath = path.join(projectRoot, 'utils/validation/formValidation.ts');
  if (fs.existsSync(formValidationPath)) {
    console.log('Fixing formValidation.ts...');
    let content = fs.readFileSync(formValidationPath, 'utf8');
    
    // Nach dem spezifischen Problem suchen und beheben
    if (content.includes('Expression expected')) {
      // Wir müssen die Zeile mit dem Problem finden
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('validateNewItemForm') && lines[i].includes(': boolean =>')) {
          // Korrigieren des Rückgabetyps
          lines[i] = lines[i].replace(': boolean =>', '): boolean =>');
          console.log(`✓ Fixed return type syntax in line ${i+1}`);
        }
      }
      fs.writeFileSync(formValidationPath, lines.join('\n'), 'utf8');
    }
  }

  // Fix für useShoppingItems.ts
  const useShoppingItemsPath = path.join(projectRoot, 'composables/useShoppingItems.ts');
  if (fs.existsSync(useShoppingItemsPath)) {
    console.log('Fixing useShoppingItems.ts...');
    let content = fs.readFileSync(useShoppingItemsPath, 'utf8');
    
    // Nach dem spezifischen Problem suchen
    if (content.includes('Expression expected')) {
      // Spezifische Fehlermuster ersetzen
      const badSyntax = /\(\):\s*void\s*=>\s*{\s*return\s*/g;
      if (badSyntax.test(content)) {
        content = content.replace(badSyntax, '() => {\n      return ');
        fs.writeFileSync(useShoppingItemsPath, content, 'utf8');
        console.log('✓ Fixed return syntax in useShoppingItems.ts');
      }
    }
  }

  // Weitere spezifische Dateien können hier hinzugefügt werden
  
  console.log('Syntax error fixes completed');
}

// Script ausführen
fixSyntaxErrors().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
