#!/usr/bin/env node

/**
 * fix-remaining-interfaces.mjs
 * 
 * Dieses Script korrigiert die verbleibenden Interface-Namen, die noch nicht das Präfix 'I' haben.
 * Es scannt alle .ts und .vue Dateien und ersetzt alle Interface-Deklarationen, bei denen der Name
 * nicht mit 'I' beginnt, auch an allen Stellen, wo sie verwendet werden.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Die verbleibenden Interface-Namen, die noch korrigiert werden müssen
const remainingInterfaces = [
  'NewTemplate',
  'EditTemplate',
  'CategoryData',
  'CategoryUsage',
  'GroupedCategory',
  'NewItem',
  'TextPart',
  'Props',
  'ExportData',
  'CategoryStoreService',
  'ListManagementComposable',
  'ListPropertiesComposable',
  'ListUpdateComposable',
  'CategoryStore',
  'LegacyItem',
  'LegacyList',
  'CategoryExpense',
  'ShoppingHistoryItem',
  'StorageRepository',
  'CategoryState',
  'StoredCategoryData'
];

// Helferfunktion zum rekursiven Scannen von Verzeichnissen
function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.nuxt') && !filePath.includes('.output')) {
      scanDir(filePath, fileList);
    } else if ((file.endsWith('.ts') || file.endsWith('.vue')) && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Hauptfunktion
async function fixRemainingInterfaces() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');
  
  console.log(`Scanning project directory: ${projectRoot}`);
  
  // Alle relevanten Dateien scannen
  const files = scanDir(projectRoot);
  console.log(`Found ${files.length} files to process`);
  
  // Für jeden Interface-Namen, der korrigiert werden muss
  for (const interfaceName of remainingInterfaces) {
    const newInterfaceName = `I${interfaceName}`;
    console.log(`Processing interface: ${interfaceName} -> ${newInterfaceName}`);
    
    // Für jede Datei
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Die Interface-Deklaration ersetzen
      const interfaceRegex = new RegExp(`\\binterface\\s+${interfaceName}\\b`, 'g');
      if (interfaceRegex.test(content)) {
        content = content.replace(interfaceRegex, `interface ${newInterfaceName}`);
        modified = true;
        console.log(`  Modified interface declaration in ${path.relative(projectRoot, file)}`);
      }
      
      // Alle Verwendungen des Interface-Namens ersetzen
      // Berücksichtigen von Typreferenzen, generischen Typen, etc.
      const usagePatterns = [
        // Type imports
        new RegExp(`\\bimport\\s+type\\s*\\{[^}]*\\b${interfaceName}\\b[^}]*\\}`, 'g'),
        // Type annotations
        new RegExp(`:\\s*${interfaceName}\\b`, 'g'),
        // Type assertion
        new RegExp(`as\\s+${interfaceName}\\b`, 'g'),
        // Generics
        new RegExp(`<${interfaceName}(>|,)`, 'g'),
        // Array type
        new RegExp(`${interfaceName}\\[]`, 'g'),
        // Extended interfaces
        new RegExp(`extends\\s+${interfaceName}\\b`, 'g'),
        // Type alias references
        new RegExp(`type[^=]*=\\s*${interfaceName}\\b`, 'g')
      ];
      
      for (const pattern of usagePatterns) {
        if (pattern.test(content)) {
          // Für jedes Muster müssen wir unterschiedlich ersetzen
          if (pattern.toString().includes('import')) {
            // Für Imports müssen wir genauer sein
            const importRegex = new RegExp(`(import\\s+type\\s*\\{[^}]*)(\\b${interfaceName}\\b)([^}]*\\})`, 'g');
            content = content.replace(importRegex, `$1${newInterfaceName}$3`);
          } else if (pattern.toString().includes(':')) {
            // Für Typannotationen
            content = content.replace(new RegExp(`(:\\s*)${interfaceName}\\b`, 'g'), `$1${newInterfaceName}`);
          } else if (pattern.toString().includes('as')) {
            // Für Type Assertions
            content = content.replace(new RegExp(`(as\\s+)${interfaceName}\\b`, 'g'), `$1${newInterfaceName}`);
          } else if (pattern.toString().includes('<')) {
            // Für Generics
            content = content.replace(new RegExp(`<${interfaceName}(>|,)`, 'g'), `<${newInterfaceName}$1`);
          } else if (pattern.toString().includes('[]')) {
            // Für Array-Typen
            content = content.replace(new RegExp(`${interfaceName}(\\[])`, 'g'), `${newInterfaceName}$1`);
          } else if (pattern.toString().includes('extends')) {
            // Für erweiterte Interfaces
            content = content.replace(new RegExp(`(extends\\s+)${interfaceName}\\b`, 'g'), `$1${newInterfaceName}`);
          } else if (pattern.toString().includes('type')) {
            // Für Type-Aliase
            content = content.replace(new RegExp(`(type[^=]*=\\s*)${interfaceName}\\b`, 'g'), `$1${newInterfaceName}`);
          }
          modified = true;
          console.log(`  Modified usage in ${path.relative(projectRoot, file)}`);
        }
      }
      
      // Datei speichern, wenn sie geändert wurde
      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
      }
    }
  }
  
  console.log('Interface renaming completed');
}

// Script ausführen
fixRemainingInterfaces().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
