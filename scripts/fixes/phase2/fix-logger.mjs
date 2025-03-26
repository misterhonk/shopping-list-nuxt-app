#!/usr/bin/env node

/**
 * Fix ESLint warnings in utils/logger.ts
 * 
 * This script:
 * - Adds missing eslint-disable comments for console methods
 * - Fixes variable naming (removes underscore prefix where not needed)
 */

import fs from 'fs';
import path from 'path';

// Path to the logger.ts file
const loggerPath = path.resolve('utils/logger.ts');

// Read the file
let content = fs.readFileSync(loggerPath, 'utf8');

// 1. Fix variable naming - remove underscore for variables that are actually used
content = content.replace(
  /let _currentConfig = { ...defaultConfig };/,
  'let currentConfig = { ...defaultConfig };'
);

// Update all references to _currentConfig
content = content.replace(/_currentConfig\./g, 'currentConfig.');

// 2. Fix parameter naming - remove underscore from data parameter where it's actually used
content = content.replace(
  /\(message: string, \.\.\._data: unknown\[\]\) => void/g,
  '(message: string, ...data: unknown[]) => void'
);

content = content.replace(
  /debug\(message: string, \.\.\._data: unknown\[\]\): void {/g,
  'debug(message: string, ...data: unknown[]): void {'
);

content = content.replace(
  /info\(message: string, \.\.\._data: unknown\[\]\): void {/g,
  'info(message: string, ...data: unknown[]): void {'
);

content = content.replace(
  /warn\(message: string, \.\.\._data: unknown\[\]\): void {/g,
  'warn(message: string, ...data: unknown[]): void {'
);

content = content.replace(
  /error\(message: string, \.\.\._data: unknown\[\]\): void {/g,
  'error(message: string, ...data: unknown[]): void {'
);

content = content.replace(
  /log\(LogLevel\.DEBUG, module, message, _data\);/g,
  'log(LogLevel.DEBUG, module, message, data);'
);

content = content.replace(
  /log\(LogLevel\.INFO, module, message, _data\);/g,
  'log(LogLevel.INFO, module, message, data);'
);

content = content.replace(
  /log\(LogLevel\.WARN, module, message, _data\);/g,
  'log(LogLevel.WARN, module, message, data);'
);

content = content.replace(
  /log\(LogLevel\.ERROR, module, message, _data\);/g,
  'log(LogLevel.ERROR, module, message, data);'
);

content = content.replace(
  /function log\(level: LogLevel, module: string, message: string, _data: unknown\[\]\): void {/,
  'function log(level: LogLevel, module: string, message: string, data: unknown[]): void {'
);

// 3. Add eslint-disable comments for all console methods
content = content.replace(
  /console\.info\(/,
  '// eslint-disable-next-line no-console\n        console.info('
);

content = content.replace(
  /console\.warn\(/,
  '// eslint-disable-next-line no-console\n        console.warn('
);

content = content.replace(
  /console\.error\(/,
  '// eslint-disable-next-line no-console\n        console.error('
);

// 4. Update any other references to _data
content = content.replace(/\.\.\._data\)/g, '...data)');

// Write the file back
fs.writeFileSync(loggerPath, content);

console.log('Fixed utils/logger.ts');
