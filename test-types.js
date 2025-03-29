// Test-Script für die migrierten Typen
// Führe dieses Skript mit dem Befehl "node test-types.js" aus

import { categoryTemplates, getAllTemplates, getTemplate } from './stores/category/templates.js';

// Teste, ob Templates geladen werden können
console.log('Verfügbare Templates:');
console.log(Object.keys(categoryTemplates));

// Teste, ob getAllTemplates funktioniert
const allTemplates = getAllTemplates();
console.log('Anzahl der Templates:', allTemplates.length);

// Teste, ob getTemplate funktioniert
const supermarktTemplate = getTemplate('supermarket');
console.log('Supermarkt Template Namen:', supermarktTemplate.name);
console.log('Anzahl der Kategorien:', supermarktTemplate.categories.length);

console.log('Test erfolgreich!');
