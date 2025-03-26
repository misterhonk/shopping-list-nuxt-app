#!/usr/bin/env node

/**
 * Fix ESLint warnings in services/updateService.ts
 * 
 * This script:
 * - Fixes syntax errors
 * - Fixes variable naming consistency
 * - Removes underscore prefixes from actually used variables
 */

import fs from 'fs';
import path from 'path';

// Path to the updateService.ts file
const servicePath = path.resolve('services/updateService.ts');

// Read the file
let content = fs.readFileSync(servicePath, 'utf8');

// 1. Fix the syntax error in checkForWaitingServiceWorker
let fixedContent = content.replace(
  /export function checkForWaitingServiceWorker\(callback: \(waiting: boolean\) => void\): void {\n  \/\/ Boolean-Wert für das Ergebnis\n  let waitingExists = false;\n  \n  if \('serviceWorker' in navigator\) {\n    \/\/ Asynchrone Prüfung mit Promise\n    navigator\.serviceWorker\.ready\n      \.then\((_registration) => {\n        \/\/ Setze waitingExists basierend auf _registration\.waiting\n        waitingExists = Boolean\(_registration\.waiting\);\n        \/\/ Rufe Callback mit dem Ergebnis auf\n        callback\(waitingExists\);\n      }\)\n      \.catch\(\(\) => {\n        \/\/ Bei Fehler Fallback auf false\n        callback\(waitingExists\);\n      }\);\n  } else {\n    \/\/ Kein Service Worker unterstützt\n    callback\(waitingExists\);\n  }\n}\)\n      \.catch\(\(\) => {\n        \/\/ Bei Fehler Fallback auf false\n        callback\(waitingExists\);\n      }\);\n  } else {\n    \/\/ Kein Service Worker unterstützt\n    callback\(waitingExists\);\n  }\n}/g,
  `export function checkForWaitingServiceWorker(callback: (waiting: boolean) => void): void {
  // Boolean-Wert für das Ergebnis
  let waitingExists = false;
  
  if ('serviceWorker' in navigator) {
    // Asynchrone Prüfung mit Promise
    navigator.serviceWorker.ready
      .then((registration) => {
        // Setze waitingExists basierend auf registration.waiting
        waitingExists = Boolean(registration.waiting);
        // Rufe Callback mit dem Ergebnis auf
        callback(waitingExists);
      })
      .catch(() => {
        // Bei Fehler Fallback auf false
        callback(waitingExists);
      });
  } else {
    // Kein Service Worker unterstützt
    callback(waitingExists);
  }
}`
);

// 2. Fix variable naming consistency - remove underscores from actively used variables
fixedContent = fixedContent.replace(/const _now = Date\.now\(\);/g, 'const now = Date.now();');
fixedContent = fixedContent.replace(/const _lastCheck = Number\(/g, 'const lastCheck = Number(');
fixedContent = fixedContent.replace(/if \(_now - _lastCheck > 24/g, 'if (now - lastCheck > 24');
fixedContent = fixedContent.replace(/localStorage\.setItem\(LAST_CHECK_KEY, _now\.toString\(\)\);/g, 'localStorage.setItem(LAST_CHECK_KEY, now.toString());');

// 3. Fix registration variable naming
fixedContent = fixedContent.replace(/navigator\.serviceWorker\.getRegistration\(\)\.then\(_reg => {/g, 'navigator.serviceWorker.getRegistration().then(reg => {');
fixedContent = fixedContent.replace(/if \(_reg\) {/g, 'if (reg) {');
fixedContent = fixedContent.replace(/_reg\.update\(\)\.catch\(_err => console\.error\(_err\)\);/g, 'reg.update().catch(err => console.error(err));');

// 4. Fix more registration variables
fixedContent = fixedContent.replace(/navigator\.serviceWorker\.getRegistration\(\)\.then\(_registration => {/g, 'navigator.serviceWorker.getRegistration().then(registration => {');
fixedContent = fixedContent.replace(/if \(_registration\) {/g, 'if (registration) {');
fixedContent = fixedContent.replace(/__registration\.update\(\)\.catch\(_err => {/g, 'registration.update().catch(err => {');
fixedContent = fixedContent.replace(/console\.error\('Fehler beim Update des Service Workers:', _err\);/g, "console.error('Fehler beim Update des Service Workers:', err);");

// 5. Fix other registration references
fixedContent = fixedContent.replace(/\.then\(_registration => {/g, '.then(registration => {');
fixedContent = fixedContent.replace(/if \(_registration\.waiting\) {/g, 'if (registration.waiting) {');
fixedContent = fixedContent.replace(/_registration\.waiting\.postMessage/g, 'registration.waiting.postMessage');
fixedContent = fixedContent.replace(/_registration\.unregister\(\)\.then\(\(\) => {/g, 'registration.unregister().then(() => {');

// 6. Fix error variables
fixedContent = fixedContent.replace(/\.catch\(_error => {/g, '.catch(error => {');
fixedContent = fixedContent.replace(/console\.error\('Fehler beim Aktualisieren des Service Workers:', _error\);/g, "console.error('Fehler beim Aktualisieren des Service Workers:', error);");
fixedContent = fixedContent.replace(/} catch \(_error\) {/g, '} catch (error) {');
fixedContent = fixedContent.replace(/console\.error\('Fehler beim Löschen der Caches:', _error\);/g, "console.error('Fehler beim Löschen der Caches:', error);");

// Write the fixed content back to the file
fs.writeFileSync(servicePath, fixedContent);

console.log('Fixed services/updateService.ts');
