#!/usr/bin/env node

/**
 * Executes all ESLint fixes for Phase 2
 *
 * This script runs all fix scripts in the phase2 directory
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const currentDir = path.resolve('scripts/fixes/phase2');

// Get all fix scripts (except this one)
const fixScripts = fs
  .readdirSync(currentDir)
  .filter(file => file !== 'run-all-fixes.mjs' && file.endsWith('.mjs'));

console.log('Starting Phase 2 ESLint fixes...\n');

for (const script of fixScripts) {
  console.log(`Running ${script}...`);
  try {
    execSync(`node ${path.join(currentDir, script)}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error running ${script}:`, error);
    process.exit(1);
  }
}

console.log('\nAll Phase 2 ESLint fixes completed successfully!');
console.log('Files fixed:');
console.log('- utils/logger.ts');
console.log('- stores/category/index.ts');
