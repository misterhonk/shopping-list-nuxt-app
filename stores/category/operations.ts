import { createLogger } from '~/utils/logger';

import { generateCategoryId, deepCopy, categoryExists, findCategoryById } from './utils';

import type { ICategory, ICategoryTemplate, ITemplateCollection } from '~/types/app-types';

// Logger initialisieren
const _logger = createLogger('operations');

/**
 * Fügt eine neue Kategorie zu einem Template hinzu
 * @param template - Das Template, das die Kategorie enthält
 * @param name - Der Name der neuen Kategorie
 * @returns Das aktualisierte Template oder undefined bei Fehler
 */
export const addCategory = (
  template: ICategoryTemplate,
  name: string
): ICategoryTemplate | undefined => {
  if (!name.trim() || !template) {
    return undefined;
  }

  // Prüfe, ob die Kategorie bereits existiert
  if (categoryExists(template, name.trim())) {
    _logger.warn('Kategorie existiert bereits:', name.trim());
    return undefined;
  }

  // Erstelle ein neues Kategorie-Objekt
  const newCategory: ICategory = {
    id: generateCategoryId(name),
    name: name.trim(),
  };

  // Aktualisiere die Kategorien
  return {
    ...template,
    categories: [...template.categories, newCategory],
  };
};

/**
 * Bearbeitet eine Kategorie in einem Template
 * @param template - Das Template, das die Kategorie enthält
 * @param category - Die zu bearbeitende Kategorie
 * @param newName - Der neue Name für die Kategorie
 * @returns Das aktualisierte Template oder undefined bei Fehler
 */
export const updateCategory = (
  template: ICategoryTemplate,
  category: ICategory,
  newName: string
): ICategoryTemplate | undefined => {
  if (!newName || newName.trim() === '' || !template || !category) {
    return undefined;
  }

  // Prüfen, ob die Kategorie existiert
  const existingCategory = findCategoryById(template, category.id);
  if (!existingCategory) {
    _logger.error('Kategorie nicht gefunden:', category.id);
    return undefined;
  }

  // Erstelle eine Kopie der Kategorien und aktualisiere den Namen
  const updatedCategories = template.categories.map(cat => {
    if (cat.id === category.id) {
      return { ...cat, name: newName.trim() };
    }
    return cat;
  });

  // Aktualisiere das Template
  return {
    ...template,
    categories: updatedCategories,
  };
};

/**
 * Löscht eine Kategorie aus einem Template
 * @param template - Das Template, das die Kategorie enthält
 * @param category - Die zu löschende Kategorie
 * @returns Das aktualisierte Template oder undefined bei Fehler
 */
export const deleteCategory = (
  template: ICategoryTemplate,
  category: ICategory
): ICategoryTemplate | undefined => {
  if (!template || !category) {
    return undefined;
  }

  // Prüfen, ob die Kategorie existiert
  const existingCategory = findCategoryById(template, category.id);
  if (!existingCategory) {
    _logger.error('Kategorie zum Löschen nicht gefunden:', category.id);
    return undefined;
  }

  // Kategorien ohne die zu löschende Kategorie erstellen
  const updatedCategories = template.categories.filter(cat => cat.id !== category.id);

  // Template aktualisieren
  return {
    ...template,
    categories: updatedCategories,
  };
};

/**
 * Erstellt ein neues benutzerdefiniertes Template
 * @param name - Der Name des neuen Templates
 * @param description - Die Beschreibung des Templates
 * @param baseTemplate - Das Basis-Template für Kategorien (optional)
 * @returns Das neue Template
 */
export const createTemplate = (
  name: string,
  description: string = '',
  baseTemplate: ICategoryTemplate | null = null
): ICategoryTemplate => {
  // Template-ID aus dem Namen generieren
  const id = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

  // Kategorien aus einem Basis-Template übernehmen oder leer starten
  let categories: ICategory[] = [];
  if (baseTemplate) {
    categories = deepCopy(baseTemplate.categories);
  }

  // Neues Template erstellen
  return {
    id,
    name,
    description,
    categories,
  };
};

/**
 * Aktualisiert ein Template
 * @param template - Das zu aktualiserende Template
 * @returns Das aktualisierte Template
 */
export const updateTemplate = (template: ICategoryTemplate): ICategoryTemplate => template;

/**
 * Löscht ein benutzerdefiniertes Template
 * @param templateId - Die ID des zu löschenden Templates
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt
 */
export const deleteTemplate = (
  templateId: string,
  customTemplates: ITemplateCollection
): ITemplateCollection => {
  if (!customTemplates[templateId]) {
    return customTemplates;
  }

  const newCustomTemplates = { ...customTemplates };
  delete newCustomTemplates[templateId];

  return newCustomTemplates;
};
