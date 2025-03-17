// Importieren der Typen über die #imports-Syntax von Nuxt
import type { Category, CategoryTemplate, TemplateCollection } from '#imports';

/**
 * Hilfsfunktion zum Generieren einer eindeutigen Kategorie-ID
 * @param name - Der Name der Kategorie
 * @returns Eine eindeutige ID für die Kategorie
 */
export const generateCategoryId = (name: string): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/[äöüß]/g, match => {
      switch (match) {
        case 'ä':
          return 'ae';
        case 'ö':
          return 'oe';
        case 'ü':
          return 'ue';
        case 'ß':
          return 'ss';
        default:
          return match;
      }
    })
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  const timestamp = Date.now().toString().slice(-6);

  return `${cleanName}_${timestamp}`;
};

/**
 * Führt eine tiefe Kopie eines Objekts durch
 * @param obj - Das zu kopierende Objekt
 * @returns Eine tiefe Kopie des Objekts
 */
export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Prüft, ob eine Kategorie bereits in einem Template existiert
 * @param template - Das zu prüfende Template
 * @param categoryName - Der Name der zu prüfenden Kategorie
 * @returns true, wenn die Kategorie bereits existiert, sonst false
 */
export const categoryExists = (template: CategoryTemplate, categoryName: string): boolean =>
  template.categories.some(cat => cat.name === categoryName);

/**
 * Findet eine Kategorie in einem Template anhand der ID
 * @param template - Das zu durchsuchende Template
 * @param categoryId - Die ID der gesuchten Kategorie
 * @returns Die gefundene Kategorie oder undefined
 */
export const findCategoryById = (
  template: CategoryTemplate,
  categoryId: string
): Category | undefined => template.categories.find(cat => cat.id === categoryId);

/**
 * Aktualisiert ein Template in einer Template-Sammlung
 * @param templates - Die Template-Sammlung
 * @param templateId - Die ID des zu aktualisierenden Templates
 * @param updatedTemplate - Das aktualisierte Template
 * @returns Die aktualisierte Template-Sammlung
 */
export const updateTemplateInCollection = (
  templates: TemplateCollection,
  templateId: string,
  updatedTemplate: CategoryTemplate
): TemplateCollection => ({
  ...templates,
  [templateId]: updatedTemplate,
});

/**
 * Überprüft und korrigiert ein Template, um sicherzustellen, dass es alle erforderlichen Eigenschaften hat
 * @param template - Das zu prüfende Template
 * @returns Das korrigierte Template
 */
export const sanitizeTemplate = (template: Partial<CategoryTemplate>): CategoryTemplate => ({
  id: template.id || `template_${Date.now()}`,
  name: template.name || 'Unbenanntes Template',
  description: template.description || '',
  categories: Array.isArray(template.categories) ? template.categories : [],
});