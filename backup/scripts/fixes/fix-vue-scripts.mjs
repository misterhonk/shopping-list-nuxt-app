#!/usr/bin/env node

/**
 * fix-vue-scripts.mjs
 *
 * Korrigiert Fehler in Vue-Script-Setups, die nicht auf TypeScript umgestellt wurden,
 * aber TypeScript-Syntax enthalten.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hauptfunktion
async function fixVueScripts() {
  // Projektpfad ermitteln
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../..');

  console.log(`Fixing Vue script setup issues in: ${projectRoot}`);

  // Fix für app.vue
  const appVuePath = path.join(projectRoot, 'app.vue');
  if (fs.existsSync(appVuePath)) {
    console.log('Fixing app.vue...');
    let content = fs.readFileSync(appVuePath, 'utf8');

    // Alle <script setup> nach <script setup lang="ts"> ändern
    if (content.includes('<script setup>')) {
      content = content.replace('<script setup>', '<script setup lang="ts">');
      fs.writeFileSync(appVuePath, content, 'utf8');
      console.log('✓ Updated script setup in app.vue to use TypeScript');
    }
  }

  // Alle Vue-Dateien durchgehen, die TypeScript-Syntax im script-Setup haben, aber nicht lang="ts"
  const vueFiles = getAllVueFiles(projectRoot);
  console.log(`Checking ${vueFiles.length} Vue files for script setup issues...`);

  let fixedCount = 0;

  for (const filePath of vueFiles) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Prüfen, ob <script setup> ohne lang="ts" vorhanden ist, aber TypeScript-Syntax enthält
    if (content.includes('<script setup>') && !content.includes('<script setup lang="ts">')) {
      // Nach TypeScript-Typannotationen oder anderen TS-spezifischen Syntax suchen
      const hasTypeAnnotations =
        /:(\s*)[A-Z]|:\s*void|:\s*string|:\s*number|:\s*boolean|:\s*any|<[A-Z][a-zA-Z]*>/g.test(
          content
        );

      if (hasTypeAnnotations) {
        const updatedContent = content.replace('<script setup>', '<script setup lang="ts">');
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(
          `✓ Updated script setup in ${path.relative(projectRoot, filePath)} to use TypeScript`
        );
        fixedCount++;
      }
    }
  }

  console.log(`\nFixed TypeScript in ${fixedCount} Vue files`);
  console.log('Vue script fixes completed');
}

/**
 * Findet alle Vue-Dateien im Projektverzeichnis
 * @param {string} dir - Verzeichnis zum Durchsuchen
 * @returns {string[]} - Liste aller Vue-Dateien
 */
function getAllVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !filePath.includes('node_modules') &&
      !filePath.includes('.nuxt') &&
      !filePath.includes('.output')
    ) {
      getAllVueFiles(filePath, fileList);
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

// Script ausführen
fixVueScripts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
