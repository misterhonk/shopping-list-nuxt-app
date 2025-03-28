/**
 * Behebt prettier/prettier-Fehler
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES Modules-Unterstützung
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hilfsfunktion zum Ausführen von Befehlen
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Fehler beim Ausführen von Befehl: ${command}`);
    console.error(error.message);
    return '';
  }
}

// Führe prettier auf dem gesamten Projekt aus
async function main() {
  console.log('Starte Prettier-Fix für das gesamte Projekt...');

  // Führe Prettier auf allen relevanten Dateien aus
  const result = runCommand(
    'cd /Users/martinmelcher/Dev/shopping-list-app && npx prettier --write "**/*.{ts,js,vue,json,md}" --ignore-path .eslintignore'
  );

  console.log('Prettier abgeschlossen.');
  console.log('\nNach dem Prettier-Fix sollten die meisten Formatierungsprobleme behoben sein.');
  console.log('Führen Sie anschließend ESLint erneut aus, um die Ergebnisse zu überprüfen.');
}

main().catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
