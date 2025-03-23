#!/usr/bin/env node

/**
 * Unused Variables Fixer
 *
 * This script handles ESLint warnings related to unused variables.
 * It prefixes unused variables with an underscore which is the convention
 * ESLint uses to ignore them.
 *
 * Usage: node scripts/fix-unused-vars.js [--dry-run]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const srcDirs = [
  'components',
  'composables',
  'pages',
  'layouts',
  'plugins',
  'services',
  'stores',
  'utils',
];

// Stats
const stats = {
  totalFiles: 0,
  modifiedFiles: 0,
  fixedVars: 0,
};

/**
 * Run ESLint to find files with unused variable warnings
 */
function findFilesWithUnusedVars() {
  console.log('Running ESLint to identify files with unused variables...');

  try {
    // Run ESLint with specific format to get machine-readable output
    const cmd = 'npx eslint --ext .js,.ts,.vue --format json --ignore-path .eslintignore .';
    const result = execSync(cmd, { cwd: rootDir, encoding: 'utf8' });

    // Parse the JSON output
    const lintResults = JSON.parse(result);

    // Filter for files with unused variable warnings
    return lintResults
      .filter(file =>
        file.messages.some(
          msg =>
            msg.ruleId === '@typescript-eslint/no-unused-vars' ||
            msg.ruleId === 'unused-imports/no-unused-vars'
        )
      )
      .map(file => ({
        filePath: file.filePath,
        unusedVars: file.messages
          .filter(
            msg =>
              msg.ruleId === '@typescript-eslint/no-unused-vars' ||
              msg.ruleId === 'unused-imports/no-unused-vars'
          )
          .map(msg => ({
            name: msg.message.match(/'([^']+)'/)?.[1],
            line: msg.line,
            column: msg.column,
          }))
          .filter(v => v.name),
      }));
  } catch (error) {
    // If ESLint fails, it might be due to the JSON format output
    // containing errors. In this case, we'll fall back to scanning all files.
    console.error('Error running ESLint:', error.message);
    console.log('Falling back to scanning all source files...');
    return scanAllFiles();
  }
}

/**
 * Scan all source files if ESLint approach fails
 */
function scanAllFiles() {
  const files = [];
  srcDirs.forEach(dir => {
    const pattern = path.join(dir, '**/*.{js,ts,vue}');
    const foundFiles = glob.sync(pattern, { cwd: rootDir });
    foundFiles.forEach(file => {
      files.push({
        filePath: path.join(rootDir, file),
        unusedVars: [], // We'll detect unused vars during processing
      });
    });
  });
  return files;
}

/**
 * Fix unused variables in a file
 */
function fixUnusedVars(content, unusedVars) {
  let modified = content;
  let fixedCount = 0;

  // If we have specific vars from ESLint, use those
  if (unusedVars && unusedVars.length > 0) {
    // Sort by reverse line number to avoid position changes
    const sortedVars = [...unusedVars].sort((a, b) => b.line - a.line);

    for (const varInfo of sortedVars) {
      const { name } = varInfo;

      // Skip if it's already prefixed with underscore
      if (name.startsWith('_')) {
        continue;
      }

      // Replace declarations of this variable (careful with regex)
      const varDeclRegex = new RegExp(`(const|let|var)\\s+(${name})\\b`, 'g');
      const newContent = modified.replace(varDeclRegex, (match, declType, varName) => {
        fixedCount++;
        return `${declType} _${varName}`;
      });

      // Only update if there was a change to avoid unnecessary modifications
      if (newContent !== modified) {
        modified = newContent;
      }
    }
  } else {
    // Use a more general approach to detect unused vars
    // This is a more basic fallback and may have false positives
    const lines = content.split('\n');

    // Find variable declarations
    const varDeclRegex = /const\s+([a-zA-Z0-9_]+)\s*=/g;

    // For each var, check if it's used more than once
    let match;
    const potentialUnusedVars = [];

    const contentWithoutComments = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    while ((match = varDeclRegex.exec(content)) !== null) {
      const varName = match[1];

      // Skip if already has underscore prefix
      if (varName.startsWith('_')) {
        continue;
      }

      // Simple heuristic: count occurrences
      const occurrences = (contentWithoutComments.match(new RegExp(`\\b${varName}\\b`, 'g')) || [])
        .length;

      // If only declared once or twice (declaration + maybe type), it might be unused
      if (occurrences <= 2) {
        potentialUnusedVars.push(varName);
      }
    }

    // Rename each potential unused variable
    potentialUnusedVars.forEach(varName => {
      const unusedVarRegex = new RegExp(`(const|let|var)\\s+(${varName})\\b`, 'g');
      modified = modified.replace(unusedVarRegex, (match, declType, name) => {
        fixedCount++;
        return `${declType} _${name}`;
      });
    });
  }

  stats.fixedVars += fixedCount;
  return { content: modified, changed: fixedCount > 0 };
}

/**
 * Process a single file
 */
function processFile(fileInfo) {
  const { filePath, unusedVars } = fileInfo;

  // Skip node_modules and other non-project files
  if (
    filePath.includes('node_modules') ||
    filePath.includes('.nuxt') ||
    filePath.includes('.output')
  ) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  const result = fixUnusedVars(content, unusedVars);

  if (result.changed) {
    if (!dryRun) {
      fs.writeFileSync(filePath, result.content, 'utf8');
      console.log(`Fixed unused vars in: ${path.relative(rootDir, filePath)}`);
    } else {
      console.log(`Would fix unused vars in: ${path.relative(rootDir, filePath)}`);
    }
    stats.modifiedFiles++;
  }

  stats.totalFiles++;
}

/**
 * Main execution function
 */
function run() {
  console.log(`Unused Variables Fixer ${dryRun ? '[DRY RUN]' : ''}`);

  // Find files with unused vars
  const filesWithUnusedVars = findFilesWithUnusedVars();

  console.log(`Found ${filesWithUnusedVars.length} files to process.`);

  // Process all files
  filesWithUnusedVars.forEach(fileInfo => {
    processFile(fileInfo);
  });

  // Print statistics
  console.log('\nResults:');
  console.log(`- Total files processed: ${stats.totalFiles}`);
  console.log(`- Files modified: ${stats.modifiedFiles}`);
  console.log(`- Unused variables fixed: ${stats.fixedVars}`);

  if (dryRun) {
    console.log('\nThis was a dry run. No files were modified.');
    console.log('Run without --dry-run to apply changes.');
  }
}

// Execute the script
run();
