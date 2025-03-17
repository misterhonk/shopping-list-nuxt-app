import { generateCategoryId, deepCopy, categoryExists, findCategoryById } from './utils';
import { Category, CategoryTemplate, TemplateCollection } from '~/composables/types';
import { createLogger } from '~/utils/logger';

// Logger initialisieren
const logger = createLogger('operations');

/**
 * Fügt eine neue Kategorie zu einem Template hinzu
 * @param templateId - Die ID des zu bearbeitenden Templates
 * @param categoryName - Der Name der neuen Kategorie
 * @param templates - Die vordefinierten Templates
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt
 */
export const addCategory = (
  templateId: string,
  categoryName: string,
  templates: TemplateCollection,
  customTemplates: TemplateCollection
): TemplateCollection => {
  if (!categoryName || categoryName.trim() === '') {
    return customTemplates;
  }

  // Erstelle ein neues Kategorie-Objekt
  const newCategory: Category = {
    id: generateCategoryId(categoryName),
    name: categoryName.trim(),
  };

  // Wähle das aktuelle Template
  const isStandardTemplate = templates[templateId] !== undefined;
  const currentTemplate = isStandardTemplate ? templates[templateId] : customTemplates[templateId];

  // Prüfe, ob die Kategorie bereits existiert
  if (categoryExists(currentTemplate, newCategory.name)) {
    logger.warn('Kategorie existiert bereits:', newCategory.name);
    return customTemplates;
  }

  // Erstelle eine Kopie der Kategorien und füge die neue hinzu
  if (isStandardTemplate) {
    // Bei Standardvorlagen erstellen wir eine Kopie als benutzerdefiniert
    const newTemplate = deepCopy({
      ...templates[templateId],
      id: templateId,
      categories: [...templates[templateId].categories, newCategory],
    });

    return {
      ...customTemplates,
      [templateId]: newTemplate,
    };
  } else {
    // Bei benutzerdefinierten Vorlagen fügen wir der bestehenden Liste hinzu
    const updatedTemplate = deepCopy({
      ...customTemplates[templateId],
      categories: [...customTemplates[templateId].categories, newCategory],
    });

    return {
      ...customTemplates,
      [templateId]: updatedTemplate,
    };
  }
};