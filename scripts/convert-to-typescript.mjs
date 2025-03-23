#!/usr/bin/env node

/**
 * TypeScript Converter Script
 * 
 * Dieses Skript wandelt Vue-Dateien mit <script setup> zu TypeScript um:
 * - Ändert <script setup> zu <script setup lang="ts">
 * - Konvertiert defineProps und defineEmits zu TypeScript-Versionen
 * - Fügt Typannotationen für Funktionen und Variablen hinzu
 * 
 * Usage: node scripts/convert-to-typescript.mjs [--dry-run] [--file path/to/component.vue]
 * Options:
 *   --dry-run  Nur Änderungen anzeigen, nicht anwenden
 *   --file     Bestimmte Datei konvertieren (sonst werden alle bearbeitet)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fileArgIndex = args.indexOf('--file');
const specificFile = fileArgIndex !== -1 && fileArgIndex + 1 < args.length 
    ? args[fileArgIndex + 1] 
    : null;

// Verzeichnisse für Vue-Dateien
const srcPaths = [
    'components',
    'layouts',
    'pages'
];

// Statistik
const stats = {
    totalFiles: 0,
    modifiedFiles: 0,
    scriptTagsUpdated: 0,
    propsConverted: 0,
    emitsConverted: 0,
    typesAdded: 0
};

/**
 * Hauptfunktion zur Konvertierung einer Vue-Datei
 */
function convertVueFileToTypeScript(filePath) {
    const fullPath = path.join(rootDir, filePath);
    console.log(`Verarbeite: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // 1. <script setup> zu <script setup lang="ts"> ändern
    if (content.includes('<script setup>')) {
        content = content.replace('<script setup>', '<script setup lang="ts">');
        stats.scriptTagsUpdated++;
        modified = true;
        console.log('  - <script setup lang="ts"> hinzugefügt');
    }
    
    // 2. defineProps und defineEmits konvertieren
    const definePropsRegex = /const\s+props\s*=\s*defineProps\(\s*\{([^}]*)\}\s*\)/gs;
    content = content.replace(definePropsRegex, (match, propsContent) => {
        // Prüfen, ob es bereits TypeScript-Syntax ist
        if (match.includes('defineProps<{')) {
            return match;
        }
        
        // Props in TypeScript-Syntax umwandeln
        const propLines = propsContent.split(',').map(line => line.trim()).filter(Boolean);
        const tsProps = propLines.map(line => {
            const [propName, propDef] = line.split(':').map(p => p.trim());
            
            if (!propName || !propDef) return null;
            
            // Einfache Typen direkt umwandeln
            if (propDef === 'String' || propDef.includes('type: String')) {
                return `${propName}: string`;
            } else if (propDef === 'Number' || propDef.includes('type: Number')) {
                return `${propName}: number`;
            } else if (propDef === 'Boolean' || propDef.includes('type: Boolean')) {
                return `${propName}: boolean`;
            } else if (propDef === 'Array' || propDef.includes('type: Array')) {
                return `${propName}: any[]`;
            } else if (propDef === 'Object' || propDef.includes('type: Object')) {
                return `${propName}: Record<string, any>`;
            } else if (propDef === 'Function' || propDef.includes('type: Function')) {
                return `${propName}: (...args: any[]) => any`;
            } else if (propDef.includes('default:')) {
                // Default-Werte erfordern mehr Analyse
                if (propDef.includes('type: String')) {
                    return `${propName}: string`;
                } else if (propDef.includes('type: Number')) {
                    return `${propName}: number`;
                } else if (propDef.includes('type: Boolean')) {
                    return `${propName}: boolean`;
                } else if (propDef.includes('type: Array')) {
                    return `${propName}: any[]`;
                } else if (propDef.includes('type: Object')) {
                    return `${propName}: Record<string, any>`;
                } else {
                    return `${propName}: any`;
                }
            }
            
            return `${propName}: any`;
        }).filter(Boolean);
        
        stats.propsConverted++;
        modified = true;
        console.log('  - defineProps zu TypeScript-Version konvertiert');
        
        return `const props = defineProps<{
  ${tsProps.join(';\n  ')}
}>()`;
    });
    
    // 3. defineEmits zu TypeScript-Version konvertieren
    const defineEmitsRegex = /const\s+emit\s*=\s*defineEmits\(\s*\[(.*?)\]\s*\)/gs;
    content = content.replace(defineEmitsRegex, (match, emitsContent) => {
        // Prüfen, ob bereits TypeScript-Syntax
        if (match.includes('defineEmits<{')) {
            return match;
        }
        
        // Emits extrahieren
        const emits = emitsContent.split(',')
            .map(e => e.trim())
            .filter(Boolean)
            .map(e => e.replace(/['"]/g, ''));
        
        // Einfache Variante: Namen als (event: string) => void
        const tsEmits = emits.map(emit => `(e: '${emit}', ...args: any[]): void`);
        
        stats.emitsConverted++;
        modified = true;
        console.log('  - defineEmits zu TypeScript-Version konvertiert');
        
        return `const emit = defineEmits<{
  ${tsEmits.join(';\n  ')}
}>()`;
    });
    
    // 4. Funktionen mit Rückgabetypen versehen
    const arrowFunctionRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*{/g;
    content = content.replace(arrowFunctionRegex, (match, fnName, params) => {
        // Nur ändernm wenn noch kein Rückgabetyp vorhanden
        if (match.includes('):')) {
            return match;
        }
        
        stats.typesAdded++;
        return `const ${fnName} = ${params}: void => {`;
    });
    
    // Datei speichern, wenn geändert
    if (modified && !dryRun) {
        fs.writeFileSync(fullPath, content, 'utf8');
        stats.modifiedFiles++;
        console.log(`  ✅ Datei aktualisiert: ${filePath}`);
    } else if (modified) {
        console.log(`  ✅ [DRY RUN] Würde Datei aktualisieren: ${filePath}`);
        stats.modifiedFiles++;
    } else {
        console.log(`  ✓ Keine Änderungen nötig für: ${filePath}`);
    }
    
    stats.totalFiles++;
    return modified;
}

/**
 * Zentrale Ausführungsfunktion
 */
function run() {
    console.log(`TypeScript Converter ${dryRun ? '[DRY RUN]' : ''}`);
    
    // Bestimmte Datei oder alle durchsuchen
    let files = [];
    
    if (specificFile) {
        files = [specificFile];
    } else {
        srcPaths.forEach(dir => {
            const dirPattern = path.join(dir, '**/*.vue');
            const foundFiles = globSync(dirPattern, { cwd: rootDir, ignore: 'node_modules/**' });
            files = [...files, ...foundFiles];
        });
    }
    
    console.log(`Gefunden: ${files.length} Vue-Dateien\n`);
    
    // Alle Dateien verarbeiten
    files.forEach(file => {
        convertVueFileToTypeScript(file);
    });
    
    // Statistik anzeigen
    console.log('\nStatistik:');
    console.log(`- Verarbeitete Dateien: ${stats.totalFiles}`);
    console.log(`- Geänderte Dateien: ${stats.modifiedFiles}`);
    console.log(`- <script setup lang="ts"> hinzugefügt: ${stats.scriptTagsUpdated}`);
    console.log(`- defineProps konvertiert: ${stats.propsConverted}`);
    console.log(`- defineEmits konvertiert: ${stats.emitsConverted}`);
    console.log(`- Typannotationen hinzugefügt: ${stats.typesAdded}`);
    
    if (dryRun) {
        console.log('\nDies war ein Testlauf. Keine Dateien wurden geändert.');
        console.log('Führe ohne --dry-run aus, um Änderungen zu übernehmen.');
    }
    
    console.log('\nNächste Schritte:');
    console.log('1. Prüfe den Build mit `npm run typecheck` und `npm run build`');
    console.log('2. Behebe aufgetretene Typfehler manuell');
    console.log('3. Führe ESLint-Prüfungen durch: `npm run lint`');
}

// Skript ausführen
run();
