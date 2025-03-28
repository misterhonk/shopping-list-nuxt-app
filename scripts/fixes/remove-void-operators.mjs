/**
 * Entfernt unnötige void-Operatoren, die zu ESLint-Fehlern führen
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules-Unterstützung
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'components/items/ItemCreationForm.vue',
  'components/items/ItemList.vue',
  'components/lists/ImportOptionsModal.vue',
  'composables/shoppingItems/useItemForm.ts',
  'composables/shoppingList/useListManagement.ts',
  'composables/utils/itemUtils.ts',
  'scripts/eslint-fix.js',
  'scripts/fix-unused-vars.js',
  'stores/category/index.ts'
];

/**
 * Entfernt void-Operatoren aus einer Datei
 */
function removeVoidOperators(filePath) {
  console.log(`Verarbeite Datei: ${filePath}`);
  
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let newContent = content;
    
    // Verschiedene Muster für void-Operatoren
    const voidPatterns = [
      /void\s+(_[a-zA-Z0-9_]+);/g,       // void _variableName;
      /;\s*void\s+(_[a-zA-Z0-9_]+);/g,   // ; void _variableName;
      /}\s*void\s+(_[a-zA-Z0-9_]+);/g    // } void _variableName;
    ];
    
    // Ersetze jeden void-Operator mit leerem String oder dem entsprechenden Ersatztext
    for (const pattern of voidPatterns) {
      newContent = newContent.replace(pattern, (match, varName) => {
        console.log(`  - Entferne void-Operator für ${varName}`);
        // Wenn der Text mit einem Semikolon beginnt, behalte es bei
        if (match.trim().startsWith(';')) {
          return ';';
        }
        // Wenn der Text mit einer schließenden Klammer beginnt, behalte sie bei
        if (match.trim().startsWith('}')) {
          return '}';
        }
        // Ansonsten ersetze den gesamten Ausdruck durch nichts
        return '';
      });
    }
    
    // Entferne spezielle void-Ausdrücke mit computed()-Werten oder .value
    newContent = newContent.replace(
      /void\s+_[a-zA-Z0-9_]+\.value;/g,
      match => {
        console.log('  - Entferne void-Operator mit .value');
        return '';
      }
    );
    
    // Schreibe die Datei nur, wenn Änderungen vorgenommen wurden
    if (newContent !== content) {
      fs.writeFileSync(fullPath, newContent);
      console.log(`  ✅ Datei ${filePath} aktualisiert`);
      return true;
    }
    
    console.log(`  - Keine Änderungen in ${filePath}`);
    return false;
  } catch (err) {
    console.error(`  ❌ Fehler bei Datei ${filePath}:`, err);
    return false;
  }
}

/**
 * Hauptfunktion
 */
async function main() {
  console.log('Entferne unnötige void-Operatoren...');
  
  let totalChanges = 0;
  
  for (const filePath of files) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const changed = removeVoidOperators(filePath);
      if (changed) {
        totalChanges++;
      }
    } else {
      console.log(`⚠️ Datei nicht gefunden: ${fullPath}`);
    }
  }
  
  console.log(`\nFertig! ${totalChanges} Dateien wurden aktualisiert.`);
}

main().catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
