#!/usr/bin/env node

/**
 * ESLint Auto-Fix Script
 *
 * This script automatically fixes common ESLint issues in the shopping-list-app codebase:
 * 1. Replaces relative parent imports with Nuxt alias imports (~/...)
 * 2. Adds return types to functions missing them
 * 3. Replaces logical OR (||) with nullish coalescing (??) where appropriate
 * 4. Fixes unnecessary conditions
 * 5. Renames unused variables to have _ prefix
 *
 * Usage: node scripts/eslint-fix.js [options]
 * Options:
 *   --dry-run  Only show what would be changed without making actual changes
 *   --pattern  Specify a glob pattern to target specific files (default: all applicable files)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import glob from 'glob';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const patternIndex = args.indexOf('--pattern');
const pattern =
  patternIndex !== -1 && patternIndex + 1 < args.length
    ? args[patternIndex + 1]
    : '**/*.{vue,js,ts}';

// Configuration
const rootDir = path.resolve(__dirname, '..');
const srcPaths = [
  'components',
  'composables',
  'layouts',
  'pages',
  'plugins',
  'services',
  'stores',
  'utils',
];

// Counters for statistics
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  relativeImportsFixed: 0,
  returnTypesAdded: 0,
  nullishCoalescingFixed: 0,
  unnecessaryConditionsFixed: 0,
  unusedVarsFixed: 0,
};

/**
 * Fix relative parent imports by replacing them with Nuxt aliases
 */
function fixRelativeParentImports(content) {
  let modified = content;
  let count = 0;

  // Match imports with ../ in them
  const importRegex = /import\s+(?:(?:{[^}]*})|(?:[^{}\s]+))\s+from\s+['"](\.\.[^'"]*)['"]/g;
  modified = modified.replace(importRegex, (match, importPath) => {
    // Skip if already using Nuxt alias
    if (importPath.startsWith('~/')) {
      return match;
    }

    // Count nested levels of parent directories
    const segments = importPath.split('/');
    const parentCount = segments.filter(s => s === '..').length;

    // Only transform if it's a relative parent import
    if (parentCount === 0) {
      return match;
    }

    // Remove the parent directories and add Nuxt alias
    const pathWithoutParents = segments.slice(parentCount).join('/');
    const nuxtAliasPath = `~/${pathWithoutParents}`;

    const result = match.replace(importPath, nuxtAliasPath);
    count++;
    return result;
  });

  stats.relativeImportsFixed += count;
  return { content: modified, changed: count > 0 };
}

/**
 * Add return types to functions that don't have them
 */
function fixMissingReturnTypes(content) {
  let modified = content;
  let count = 0;

  // Handle arrow functions without return types
  // Match arrow functions with missing return types
  const arrowFnRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*(\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*{/g;
  modified = modified.replace(arrowFnRegex, (match, fnName, params) => {
    // Skip if already has a return type
    if (match.includes('):')) {
      return match;
    }

    // Add void return type as a safe default
    const newMatch = `const ${fnName} = ${params}: void => {`;
    count++;
    return newMatch;
  });

  // Handle function declarations
  const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/g;
  modified = modified.replace(functionRegex, (match, fnName, params) => {
    // Skip if already has a return type
    if (match.includes('): ')) {
      return match;
    }

    // Add void return type as a safe default
    const newMatch = `function ${fnName}(${params}): void {`;
    count++;
    return newMatch;
  });

  stats.returnTypesAdded += count;
  return { content: modified, changed: count > 0 };
}

/**
 * Replace logical OR (||) with nullish coalescing (??) where appropriate
 */
function fixNullishCoalescing(content) {
  let modified = content;
  let count = 0;

  // Match patterns like: something || 'default'
  const orRegex = /(\w+(?:\.\w+)*)\s*\|\|\s*(['"])?((?:(?!\2).)*)\2?/g;
  modified = modified.replace(orRegex, (match, variable, quote, defaultValue) => {
    // Skip certain cases where || may be more appropriate
    if (['true', 'false', '0', '1'].includes(defaultValue)) {
      return match;
    }

    // Replace with nullish coalescing
    const q = quote || '';
    const newMatch = `${variable} ?? ${q}${defaultValue}${q}`;
    count++;
    return newMatch;
  });

  stats.nullishCoalescingFixed += count;
  return { content: modified, changed: count > 0 };
}

/**
 * Fix unnecessary conditions
 */
function fixUnnecessaryConditions(content) {
  let modified = content;
  let count = 0;

  // For specific simple patterns, we can attempt fixes
  modified = modified.replace(/if\s*\(\s*arr\s*&&\s*arr\.length\s*>\s*0\s*\)/g, match => {
    const newMatch = match.replace('arr && arr.length > 0', 'arr?.length > 0');
    count++;
    return newMatch;
  });

  // Convert obj && obj.prop to obj?.prop
  modified = modified.replace(/(\w+)\s*&&\s*\1\.([\w.]+)/g, (match, obj, prop) => {
    const newMatch = `${obj}?.${prop}`;
    count++;
    return newMatch;
  });

  stats.unnecessaryConditionsFixed += count;
  return { content: modified, changed: count > 0 };
}

/**
 * Fix unused variables by adding underscore prefix
 */
function fixUnusedVars(content) {
  let modified = content;
  let count = 0;

  // Find potential unused variables (this is a very basic approach)
  // For a more robust solution, you'd need to parse the code
  const varRegex = /const\s+([a-zA-Z0-9_]+)\s*=/g;
  let match;
  const potentialUnusedVars = [];

  while ((match = varRegex.exec(content)) !== null) {
    const varName = match[1];
    if (!varName.startsWith('_') && content.split(varName).length <= 2) {
      potentialUnusedVars.push(varName);
    }
  }

  // Rename each potential unused variable
  potentialUnusedVars.forEach(varName => {
    const unusedVarRegex = new RegExp(`const\\s+${varName}\\s*=`, 'g');
    modified = modified.replace(unusedVarRegex, `const _${varName} =`);
    count++;
  });

  stats.unusedVarsFixed += count;
  return { content: modified, changed: count > 0 };
}

/**
 * Process a single file by applying all fixes
 */
function processFile(filePath) {
  const fullPath = path.join(rootDir, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');

  let modified = content;
  let fileChanged = false;

  // Apply each fix and track if file was changed
  const relativeImportsFix = fixRelativeParentImports(modified);
  modified = relativeImportsFix.content;
  fileChanged = fileChanged || relativeImportsFix.changed;

  const returnTypesFix = fixMissingReturnTypes(modified);
  modified = returnTypesFix.content;
  fileChanged = fileChanged || returnTypesFix.changed;

  const nullishCoalescingFix = fixNullishCoalescing(modified);
  modified = nullishCoalescingFix.content;
  fileChanged = fileChanged || nullishCoalescingFix.changed;

  const unnecessaryConditionsFix = fixUnnecessaryConditions(modified);
  modified = unnecessaryConditionsFix.content;
  fileChanged = fileChanged || unnecessaryConditionsFix.changed;

  const unusedVarsFix = fixUnusedVars(modified);
  modified = unusedVarsFix.content;
  fileChanged = fileChanged || unusedVarsFix.changed;

  // Save changes if file was modified
  if (fileChanged && !dryRun) {
    fs.writeFileSync(fullPath, modified, 'utf8');
    stats.modifiedFiles++;
  } else if (fileChanged) {
    console.log(`Would modify: ${filePath}`);
    stats.modifiedFiles++;
  }

  stats.totalFiles++;
  return fileChanged;
}

/**
 * Main execution function
 */
function run() {
  console.log(`ESLint Auto-Fix Script ${dryRun ? '[DRY RUN]' : ''}`);
  console.log('Searching for files...');

  // Find all applicable files in specified dirs
  let files = [];
  srcPaths.forEach(dir => {
    const dirPattern = path.join(dir, pattern);
    const foundFiles = glob.sync(dirPattern, { cwd: rootDir, ignore: 'node_modules/**' });
    files = [...files, ...foundFiles];
  });

  console.log(`Found ${files.length} files to process.`);

  // Process all files
  files.forEach((file, index) => {
    const changed = processFile(file);
    // Progress indicator every 10 files
    if (index % 10 === 0) {
      process.stdout.write('.');
    }
  });

  console.log('\nFixing complete!');

  // Run prettier on modified files if not in dry run
  if (!dryRun && stats.modifiedFiles > 0) {
    console.log('Running prettier on modified files...');
    try {
      execSync('npm run format', { cwd: rootDir, stdio: 'inherit' });
    } catch (error) {
      console.error('Error running prettier:', error.message);
    }
  }

  // Print statistics
  console.log('\nStatistics:');
  console.log(`- Total files processed: ${stats.totalFiles}`);
  console.log(`- Files modified: ${stats.modifiedFiles}`);
  console.log(`- Relative imports fixed: ${stats.relativeImportsFixed}`);
  console.log(`- Return types added: ${stats.returnTypesAdded}`);
  console.log(`- Nullish coalescing operators fixed: ${stats.nullishCoalescingFixed}`);
  console.log(`- Unnecessary conditions fixed: ${stats.unnecessaryConditionsFixed}`);
  console.log(`- Unused variables fixed: ${stats.unusedVarsFixed}`);

  console.log('\nNext steps:');
  console.log('1. Run npm run lint to check for remaining ESLint issues');
  console.log('2. For more complex issues, manual fixes may be required');
  console.log('3. Consider adding ESLint auto-fix to your pre-commit hook');
}

// Execute the script
run();
