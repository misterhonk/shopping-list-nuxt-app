#!/usr/bin/env node

/**
 * Fix ESLint warnings in stores/category/index.ts
 *
 * This script:
 * - Fixes logger._error to logger.error (typo)
 * - Handles setTimeout return type issues
 * - Improves variable naming consistency (underscore prefixes)
 */

import fs from 'fs';
import path from 'path';

// Path to the category store file
const storePath = path.resolve('stores/category/index.ts');

// Read the file
let content = fs.readFileSync(storePath, 'utf8');

// 1. Fix the logger._error typo
content = content.replace(
  /_logger\._error\('Fehler beim Laden der Kategorie-Vorlagen:', _error\);/,
  "_logger.error('Fehler beim Laden der Kategorie-Vorlagen:', _error);"
);

// 2. Fix the setTimeout issue by adding proper type and return value
content = content.replace(/setTimeout\(\(\) => {/g, 'const _timer = setTimeout(() => {');

// 3. Fix variable naming consistency
// 3.1 Keep prefixes for template properties that match the API
// Intentionally keep _name, _description, etc. as they are part of the API

// 3.2 Improve variable naming consistency in functions
content = content.replace(
  /const _result = createTemplateOperation/,
  'const result = createTemplateOperation'
);

content = content.replace(/if \(_result\.newTemplateId\) {/, 'if (result.newTemplateId) {');

content = content.replace(
  /this\.customTemplates = _result\.customTemplates;/,
  'this.customTemplates = result.customTemplates;'
);

content = content.replace(
  /this\.activeTemplateId = _result\.newTemplateId;/,
  'this.activeTemplateId = result.newTemplateId;'
);

content = content.replace(
  /if \(baseTemplateId && this\.sortConfigs\[baseTemplateId\]\) {/,
  'if (baseTemplateId && this.sortConfigs[baseTemplateId]) {'
);

content = content.replace(
  /this\.sortConfigs\[_result\.newTemplateId\] = {/,
  'this.sortConfigs[result.newTemplateId] = {'
);

content = content.replace(
  /this\.sortConfigs\[baseTemplateId\],/,
  'this.sortConfigs[baseTemplateId],'
);

content = content.replace(
  /_templateId: _result\.newTemplateId,/,
  '_templateId: result.newTemplateId,'
);

content = content.replace(/return _result\.newTemplateId;/, 'return result.newTemplateId;');

// 3.3 Consistent naming in sorting functions
content = content.replace(
  /const _currentConfig = getSortConfigForTemplate\(/g,
  'const currentConfig = getSortConfigForTemplate('
);

content = content.replace(
  /const updatedConfig = {\.\.\._currentConfig,/g,
  'const updatedConfig = {...currentConfig,'
);

// 3.4 Fix template variable naming
content = content.replace(
  /const _template = this\.allTemplates\[this\.activeTemplateId\];/g,
  'const template = this.allTemplates[this.activeTemplateId];'
);

content = content.replace(
  /if \(_template\.defaultCategoryOrder\) {/g,
  'if (template.defaultCategoryOrder) {'
);

content = content.replace(
  /updatedConfig\.customOrder = \[\.\.\._template\.defaultCategoryOrder\];/g,
  'updatedConfig.customOrder = [...template.defaultCategoryOrder];'
);

// 3.5 Fix data in local storage functions
content = content.replace(
  /const _data = loadCategoryData\(\);/,
  'const data = loadCategoryData();'
);

content = content.replace(/if \(_data\) {/, 'if (data) {');

content = content.replace(/if \(_data\.customTemplates\) {/, 'if (data.customTemplates) {');

content = content.replace(
  /if \(needsMigration\(_data\.customTemplates\)\) {/,
  'if (needsMigration(data.customTemplates)) {'
);

content = content.replace(
  /this\.customTemplates = migrateCategories\(_data\.customTemplates\);/,
  'this.customTemplates = migrateCategories(data.customTemplates);'
);

content = content.replace(
  /this\.customTemplates = _data\.customTemplates;/,
  'this.customTemplates = data.customTemplates;'
);

content = content.replace(
  /if \(\s+_data\.activeTemplateId &&\s+\(this\.templates\[_data\.activeTemplateId\] \|\| this\.customTemplates\[_data\.activeTemplateId\]\)\s+\) {/,
  'if (\n            data.activeTemplateId &&\n            (this.templates[data.activeTemplateId] || this.customTemplates[data.activeTemplateId])\n          ) {'
);

content = content.replace(
  /this\.activeTemplateId = _data\.activeTemplateId;/,
  'this.activeTemplateId = data.activeTemplateId;'
);

// Write the file back
fs.writeFileSync(storePath, content);

console.log('Fixed stores/category/index.ts');
