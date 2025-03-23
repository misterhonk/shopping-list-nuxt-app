#!/usr/bin/env node

/**
 * Default Props Fixer
 *
 * This script specifically targets Vue components to fix missing default props,
 * which is one of the more critical ESLint errors in the codebase.
 *
 * Usage: node scripts/fix-props.mjs [--dry-run]
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

// Configuration
const componentsDir = path.join(rootDir, 'components');

// Stats
const stats = {
  totalComponents: 0,
  modifiedComponents: 0,
  fixedProps: 0,
};

/**
 * Fixes missing default props in Vue components
 */
function fixDefaultProps(content) {
  let modified = content;
  let fixedCount = 0;

  // Target defineProps declarations
  const propsRegex = /const\s+(?:props\s*=\s*)?defineProps\(\s*\{([^}]*)\}\s*\)/gs;
  modified = modified.replace(propsRegex, (fullMatch, propsContent) => {
    let newPropsContent = propsContent;

    // Find props that don't have default values
    const propDefinitions = propsContent.split(',');
    const updatedProps = propDefinitions.map(propDef => {
      propDef = propDef.trim();
      if (!propDef) return propDef;

      // Skip if already has a default value or is required
      if (propDef.includes('default:') || propDef.includes('required:')) {
        return propDef;
      }

      // Handle simple type declarations
      if (propDef.includes(':') && !propDef.includes('{')) {
        const [name, type] = propDef.split(':').map(part => part.trim());

        // Add appropriate default based on type
        if (type === 'String') {
          fixedCount++;
          return `${name}: { type: String, default: '' }`;
        } else if (type === 'Number') {
          fixedCount++;
          return `${name}: { type: Number, default: 0 }`;
        } else if (type === 'Boolean') {
          fixedCount++;
          return `${name}: { type: Boolean, default: false }`;
        } else if (type === 'Array') {
          fixedCount++;
          return `${name}: { type: Array, default: () => [] }`;
        } else if (type === 'Object') {
          fixedCount++;
          return `${name}: { type: Object, default: () => ({}) }`;
        } else if (type === 'Function') {
          fixedCount++;
          return `${name}: { type: Function, default: () => {} }`;
        }
      }

      return propDef;
    });

    newPropsContent = updatedProps.join(',\n  ');
    return `const props = defineProps({\n  ${newPropsContent}\n})`;
  });

  stats.fixedProps += fixedCount;
  return { content: modified, changed: fixedCount > 0 };
}

/**
 * Process a single Vue component
 */
function processComponent(filePath) {
  const fullPath = path.join(rootDir, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');

  const result = fixDefaultProps(content);

  if (result.changed) {
    if (!dryRun) {
      fs.writeFileSync(fullPath, result.content, 'utf8');
      console.log(`Fixed props in: ${filePath}`);
    } else {
      console.log(`Would fix props in: ${filePath}`);
    }
    stats.modifiedComponents++;
  }

  stats.totalComponents++;
}

/**
 * Main execution function
 */
function run() {
  console.log(`Default Props Fixer ${dryRun ? '[DRY RUN]' : ''}`);
  console.log('Searching for Vue components...');

  // Find all Vue components
  const pattern = '**/*.vue';
  const files = globSync(pattern, { cwd: componentsDir });

  console.log(`Found ${files.length} Vue components.`);

  // Process all components
  files.forEach(file => {
    const relativePath = path.join('components', file);
    processComponent(relativePath);
  });

  // Print statistics
  console.log('\nResults:');
  console.log(`- Total components processed: ${stats.totalComponents}`);
  console.log(`- Components modified: ${stats.modifiedComponents}`);
  console.log(`- Props fixed: ${stats.fixedProps}`);

  if (dryRun) {
    console.log('\nThis was a dry run. No files were modified.');
    console.log('Run without --dry-run to apply changes.');
  }
}

// Execute the script
run();
