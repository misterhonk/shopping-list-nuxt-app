import { generateCategoryId, deepCopy } from './utils';
import { CategoryTemplate, TemplateCollection, Category } from '../../composables/types';
import { createLogger } from '../../utils/logger';

// Logger initialisieren
const logger = createLogger('migration');

/**
 * Migration alter String-Kategorien zu Objekt-Kategorien
 * @param customTemplates - Die zu migrierenden benutzerdefinierten Templates
 * @returns Die migrierten Templates
 */
export const migrateCategories = (customTemplates: TemplateCollection): TemplateCollection => {
  logger.info('Starte Migration von String-Kategorien zu Objekten');

  // Tiefe Kopie erstellen
  const migratedTemplates = deepCopy(customTemplates);

  // Für jedes Template die Kategorien migrieren
  for (const templateId in migratedTemplates) {
    const template = migratedTemplates[templateId];
    if (template.categories && Array.isArray(template.categories)) {
      // Kategorien in Objekte konvertieren
      const newCategories = template.categories.map(category => {
        if (typeof category === 'string') {
          return {
            id: generateCategoryId(category),
            name: category,
          };
        }
        return category; // Falls es bereits ein Objekt ist
      });
      template.categories = newCategories;
    }
  }

  logger.info('Migration abgeschlossen, neue customTemplates:', migratedTemplates);
  return migratedTemplates;
};

/**
 * Prüft, ob Templates eine Migration benötigen
 * @param customTemplates - Die zu prüfenden Templates
 * @returns true, wenn eine Migration notwendig ist, sonst false
 */
export const needsMigration = (customTemplates: TemplateCollection): boolean => {
  for (const templateId in customTemplates) {
    const template = customTemplates[templateId];
    if (template.categories && template.categories.length > 0) {
      // Prüfen, ob Kategorien als Strings oder als Objekte vorliegen
      if (typeof template.categories[0] === 'string') {
        return true;
      }
    }
  }
  return false;
};
