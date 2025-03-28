/**
 * Behebt vue/no-ref-as-operand-Fehler
 * 
 * Dieser Fehler tritt auf, wenn computed()-Werte direkt ohne .value verwendet werden.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules-Unterstützung
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  'components/items/ItemList.vue',
  'composables/shoppingItems/useItemForm.ts'
];

/**
 * Korrigiert ref-as-operand-Probleme in einer Datei
 */
function fixRefAsOperand(filePath) {
  console.log(`Verarbeite Datei: ${filePath}`);
  
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    let newContent = content;
    
    // Muster für computed-Werte ohne .value im void-Operator
    const refPattern = /(_[a-zA-Z0-9_]+)(?!\.value)/g;
    
    // Finde alle Vorkommen von computed-Referenzen in void-Ausdrücken
    const matches = [...content.matchAll(/void\s+(_[a-zA-Z0-9_]+)(?!\.value)/g)];
    
    // Verarbeite jedes Vorkommen (in umgekehrter Reihenfolge, um Indexverschiebungen zu vermeiden)
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const refName = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      
      // Ersetze den void-Ausdruck durch einen leeren String (da wir void-Operatoren bereits entfernt haben)
      newContent = newContent.substring(0, startIndex) + '' + newContent.substring(endIndex);
      console.log(`  - Entferne void-Operator für computed-Wert ${refName}`);
    }
    
    // Finde alle Stellen, an denen computed-Werte ohne .value verwendet werden (außerhalb von void)
    const computedMatches = [...content.matchAll(/([^\.a-zA-Z0-9_])(_[a-zA-Z0-9_]+)(?!\.value)(?![a-zA-Z0-9_])/g)];
    
    // Verarbeite jedes Vorkommen (in umgekehrter Reihenfolge)
    for (let i = computedMatches.length - 1; i >= 0; i--) {
      const match = computedMatches[i];
      const prefix = match[1];
      const refName = match[2];
      
      // Überprüfe, ob es sich um eine Variable handelt, die ein computed-Wert sein könnte
      if (refName.startsWith('_') && !match[0].includes('void') && !match[0].includes('=')) {
        const startIndex = match.index + prefix.length;
        const endIndex = startIndex + refName.length;
        
        // Füge .value hinzu
        newContent = newContent.substring(0, startIndex) + refName + '.value' + newContent.substring(endIndex);
        console.log(`  - Füge .value zu ${refName} hinzu`);
      }
    }
    
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
  console.log('Behebe vue/no-ref-as-operand-Fehler...');
  
  let totalChanges = 0;
  
  for (const filePath of files) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const changed = fixRefAsOperand(filePath);
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
