/**
 * Korrigiert Code-Duplikate in bedingten Verzweigungen
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules-Unterstützung
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Korrigiert duplizierte Branches in useShoppingItems.ts
 */
function fixDuplicatedBranches() {
  console.log('Korrigiere doppelte Code-Blöcke in useShoppingItems.ts...');
  
  try {
    const filePath = path.resolve(process.cwd(), 'composables/useShoppingItems.ts');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Findung der betroffenen Zeilen (etwa 350-355)
    const lines = content.split('\n');
    let startLine = 0;
    let endLine = 0;
    
    // Suche nach if-else-Block mit duplizierten Code
    for (let i = 350; i < 360; i++) {
      if (lines[i] && lines[i].includes('item.category === \'object\'')) {
        startLine = i - 5;
        break;
      }
    }
    
    if (startLine > 0) {
      // Finde das Ende des Blocks
      let braceCount = 0;
      for (let i = startLine; i < lines.length; i++) {
        if (lines[i].includes('{')) braceCount++;
        if (lines[i].includes('}')) braceCount--;
        
        if (braceCount === 0 && i > startLine + 10) {
          endLine = i;
          break;
        }
      }
      
      if (endLine > 0) {
        console.log(`  - Doppelten if-else-Block gefunden (Zeilen ${startLine}-${endLine})`);
        
        // Extrahiere Bedingung und Block
        const dupBlock = lines.slice(startLine, endLine + 1).join('\n');
        
        // Ersetze durch vereinfachte Version
        const newCode = `        // Prüfen, ob das Item diese Kategorie verwendet
        let needsUpdate = false;

        if (typeof item.category === 'object' && item.category && item.category.id === categoryId) {
          needsUpdate = true;
        } else if (typeof item.category === 'string' && item.category === categoryId) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          // Item aktualisieren
          itemService.updateItem(list.id, item.id, {
            category: {
              id: categoryId,
              name: newName,
            },
          });
          hasChanges = true;
        }`;
        
        // Ersetze den Code
        lines.splice(startLine, endLine - startLine + 1, ...newCode.split('\n'));
        const newContent = lines.join('\n');
        
        fs.writeFileSync(filePath, newContent);
        console.log('  ✅ Duplizierten Code-Block in useShoppingItems.ts korrigiert');
        return true;
      }
    }
    
    console.log('  ❓ Konnte keinen duplizierten Code-Block finden');
    return false;
  } catch (err) {
    console.error('  ❌ Fehler beim Korrigieren von useShoppingItems.ts:', err);
    return false;
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  console.log('Korrigiere duplizierte Code-Blöcke...');
  
  const changed = fixDuplicatedBranches();
  
  if (changed) {
    console.log('\nDuplizierte Code-Blöcke wurden korrigiert.');
  } else {
    console.log('\nKeine Änderungen vorgenommen.');
  }
}

main().catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
