#!/usr/bin/env node

/**
 * Dieses Skript durchsucht alle Vue-Komponenten und prüft,
 * welche noch nicht auf TypeScript umgestellt wurden
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// ESM-kompatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Argumente parsen
const args = process.argv.slice(2);
const showAll = args.includes('--all');
const showDetails = args.includes('--details');

// Verzeichnisse für Vue-Dateien
const srcPaths = ['components', 'layouts', 'pages'];

// Statistik
const stats = {
  totalFiles: 0,
  tsFiles: 0,
  nonTsFiles: 0,
};

/**
 * Prüft, ob eine Vue-Datei TypeScript verwendet
 */
function isTypeScriptComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Prüft, ob die Komponente <script setup lang="ts"> oder <script lang="ts"> verwendet
  return content.includes('<script setup lang="ts">') || content.includes('<script lang="ts">');
}

/**
 * Sammelt Informationen zu einer Vue-Datei
 */
function analyzeVueFile(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  const isTS = isTypeScriptComponent(filePath);

  stats.totalFiles++;
  if (isTS) {
    stats.tsFiles++;
  } else {
    stats.nonTsFiles++;
  }

  return {
    path: relativePath,
    isTypeScript: isTS,
  };
}

/**
 * Hauptfunktion
 */
function run() {
  console.log(`Vue-Komponenten TypeScript-Prüfung`);

  // Alle Vue-Dateien sammeln
  let files = [];

  srcPaths.forEach(dir => {
    const dirPattern = path.join(dir, '**/*.vue');
    const foundFiles = globSync(dirPattern, { cwd: rootDir, ignore: 'node_modules/**' });
    files = [...files, ...foundFiles.map(f => path.join(rootDir, f))];
  });

  console.log(`Gefunden: ${files.length} Vue-Dateien\n`);

  // Alle Dateien analysieren
  const fileInfos = files.map(analyzeVueFile);

  // Nach nicht-TypeScript-Dateien filtern und sortieren
  const nonTsFiles = fileInfos
    .filter(info => !info.isTypeScript)
    .sort((a, b) => {
      // Sortierung nach Pfadtiefe (einfachere Komponenten zuerst)
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;

      if (aDepth === bDepth) {
        return a.path.localeCompare(b.path);
      }

      return aDepth - bDepth;
    });

  // Ausgabe
  if (showAll) {
    console.log('Alle Vue-Komponenten:');
    fileInfos.forEach(info => {
      const statusSymbol = info.isTypeScript ? '✅' : '❌';
      console.log(`${statusSymbol} ${info.path}`);
    });
  } else {
    console.log('Noch zu konvertierende Komponenten:');

    if (nonTsFiles.length === 0) {
      console.log('Alle Komponenten sind bereits auf TypeScript umgestellt! 🎉');
    } else {
      nonTsFiles.forEach((info, index) => {
        console.log(`${index + 1}. ${info.path}`);

        if (showDetails) {
          // Mehr Details über die Komponente anzeigen
          const filePath = path.join(rootDir, info.path);
          const content = fs.readFileSync(filePath, 'utf8');

          // Einfache Analyse
          const hasProps = content.includes('defineProps(') || content.includes('props:');
          const hasEmits = content.includes('defineEmits(') || content.includes('emits:');
          const hasRefs = content.includes('ref(') || content.includes('reactive(');

          console.log(`   - Props: ${hasProps ? 'Ja' : 'Nein'}`);
          console.log(`   - Emits: ${hasEmits ? 'Ja' : 'Nein'}`);
          console.log(`   - Refs/Reactive: ${hasRefs ? 'Ja' : 'Nein'}`);
          console.log('');
        }
      });
    }
  }

  // Statistik
  console.log('\nStatistik:');
  console.log(`- Gesamtanzahl Vue-Dateien: ${stats.totalFiles}`);
  console.log(
    `- Mit TypeScript: ${stats.tsFiles} (${Math.round((stats.tsFiles / stats.totalFiles) * 100)}%)`
  );
  console.log(
    `- Ohne TypeScript: ${stats.nonTsFiles} (${Math.round((stats.nonTsFiles / stats.totalFiles) * 100)}%)`
  );

  console.log(`\nEmpfehlung für die nächste Konvertierung: ${nonTsFiles[0]?.path || 'Keine'}`);
  console.log('\nVerwendung:');
  console.log(
    '- node scripts/find-non-ts-components.mjs          # Zeigt nicht konvertierte Komponenten'
  );
  console.log('- node scripts/find-non-ts-components.mjs --all    # Zeigt alle Komponenten');
  console.log(
    '- node scripts/find-non-ts-components.mjs --details # Zeigt Details zu den Komponenten'
  );
}

// Skript ausführen
run();
