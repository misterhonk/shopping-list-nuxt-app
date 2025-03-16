import { categoryTemplates, defaultTemplateId } from './templates';
import { generateCategoryId, deepCopy, categoryExists, findCategoryById } from './utils';
import { Category, CategoryTemplate, TemplateCollection } from '../../composables/types';
import { createLogger } from '../../utils/logger';

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

/**
 * Bearbeitet eine Kategorie in einem Template
 * @param templateId - Die ID des zu bearbeitenden Templates
 * @param categoryId - Die ID der zu bearbeitenden Kategorie
 * @param newName - Der neue Name für die Kategorie
 * @param templates - Die vordefinierten Templates
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt
 */
export const editCategory = (
  templateId: string,
  categoryId: string,
  newName: string,
  templates: TemplateCollection,
  customTemplates: TemplateCollection
): TemplateCollection => {
  if (!newName || newName.trim() === '') {
    return customTemplates;
  }

  // Wähle das aktuelle Template
  const isStandardTemplate = templates[templateId] !== undefined;
  const currentTemplate = isStandardTemplate ? templates[templateId] : customTemplates[templateId];

  // Prüfen, ob die Kategorie existiert
  const existingCategory = findCategoryById(currentTemplate, categoryId);
  if (!existingCategory) {
    logger.error('Kategorie nicht gefunden:', categoryId);
    return customTemplates;
  }

  // Erstelle eine Kopie der Kategorien und aktualisiere den Namen
  const updatedCategories = currentTemplate.categories.map(cat => {
    if (cat.id === categoryId) {
      return { ...cat, name: newName.trim() };
    }
    return cat;
  });

  if (isStandardTemplate) {
    // Erstelle ein neues Template basierend auf dem Standard-Template
    return {
      ...customTemplates,
      [templateId]: {
        ...templates[templateId],
        id: templateId,
        categories: updatedCategories,
      },
    };
  } else {
    // Aktualisiere das bestehende benutzerdefinierte Template
    return {
      ...customTemplates,
      [templateId]: {
        ...customTemplates[templateId],
        categories: updatedCategories,
      },
    };
  }
};

/**
 * Löscht eine Kategorie aus einem Template
 * @param templateId - Die ID des zu bearbeitenden Templates
 * @param categoryId - Die ID der zu löschenden Kategorie
 * @param templates - Die vordefinierten Templates
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt
 */
export const deleteCategory = (
  templateId: string,
  categoryId: string,
  templates: TemplateCollection,
  customTemplates: TemplateCollection
): TemplateCollection => {
  // Wähle das aktuelle Template
  const isStandardTemplate = templates[templateId] !== undefined;
  const currentTemplate = isStandardTemplate ? templates[templateId] : customTemplates[templateId];

  // Prüfen, ob die Kategorie existiert
  const existingCategory = findCategoryById(currentTemplate, categoryId);
  if (!existingCategory) {
    logger.error('Kategorie zum Löschen nicht gefunden:', categoryId);
    return customTemplates;
  }

  // Erstelle eine Kopie der Kategorien und entferne die zu löschende Kategorie
  const updatedCategories = currentTemplate.categories.filter(cat => cat.id !== categoryId);

  if (isStandardTemplate) {
    // Bei Standardvorlagen erstellen wir eine Kopie als benutzerdefiniert
    return {
      ...customTemplates,
      [templateId]: {
        ...templates[templateId],
        id: templateId,
        categories: updatedCategories,
      },
    };
  } else {
    // Bei benutzerdefinierten Vorlagen aktualisieren wir die bestehende
    return {
      ...customTemplates,
      [templateId]: {
        ...customTemplates[templateId],
        categories: updatedCategories,
      },
    };
  }
};

/**
 * Erstellt ein neues benutzerdefiniertes Template
 * @param name - Der Name des neuen Templates
 * @param description - Die Beschreibung des Templates
 * @param baseTemplateId - Die ID eines Basis-Templates für Kategorien
 * @param templates - Die vordefinierten Templates
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt und die ID des neuen Templates
 */
export const createTemplate = (
  name: string,
  description: string = '',
  baseTemplateId: string | null = null,
  templates: TemplateCollection,
  customTemplates: TemplateCollection
): { customTemplates: TemplateCollection; newTemplateId: string | null } => {
  if (!name || name.trim() === '') {
    return { customTemplates, newTemplateId: null };
  }

  // Template-ID aus dem Namen generieren
  const id = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

  // Kategorien aus einem Basis-Template übernehmen oder leer starten
  let categories: Category[] = [];
  if (baseTemplateId) {
    const baseTemplate = templates[baseTemplateId] || customTemplates[baseTemplateId];
    if (baseTemplate) {
      categories = deepCopy(baseTemplate.categories);
    }
  }

  // Neues Template erstellen
  const newTemplate: CategoryTemplate = {
    id,
    name,
    description,
    categories,
  };

  // Template speichern
  return {
    customTemplates: {
      ...customTemplates,
      [id]: newTemplate,
    },
    newTemplateId: id,
  };
};

/**
 * Löscht ein benutzerdefiniertes Template
 * @param templateId - Die ID des zu löschenden Templates
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt
 */
export const deleteTemplate = (
  templateId: string,
  customTemplates: TemplateCollection
): TemplateCollection => {
  if (!customTemplates[templateId]) {
    return customTemplates;
  }

  const newCustomTemplates = { ...customTemplates };
  delete newCustomTemplates[templateId];

  return newCustomTemplates;
};

/**
 * Aktualisiert ein bestehendes benutzerdefiniertes Template
 * @param templateId - Die ID des zu aktualisierenden Templates
 * @param name - Der neue Name (optional)
 * @param description - Die neue Beschreibung (optional)
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt
 */
export const updateTemplate = (
  templateId: string,
  name: string | undefined,
  description: string | undefined,
  customTemplates: TemplateCollection
): TemplateCollection => {
  if (!customTemplates[templateId]) {
    return customTemplates;
  }

  return {
    ...customTemplates,
    [templateId]: {
      ...customTemplates[templateId],
      name: name || customTemplates[templateId].name,
      description: description || customTemplates[templateId].description,
    },
  };
};

/**
 * Aktualisiert die Reihenfolge der Kategorien in einem Template
 * @param templateId - Die ID des zu aktualisierenden Templates
 * @param newOrder - Die neue Reihenfolge der Kategorien
 * @param templates - Die vordefinierten Templates
 * @param customTemplates - Die benutzerdefinierten Templates
 * @returns Das aktualisierte customTemplates-Objekt
 */
export const updateCategoryOrder = (
  templateId: string,
  newOrder: Category[],
  templates: TemplateCollection,
  customTemplates: TemplateCollection
): TemplateCollection => {
  if (!Array.isArray(newOrder) || newOrder.length === 0) {
    return customTemplates;
  }

  // Wähle das aktuelle Template
  const isStandardTemplate = templates[templateId] !== undefined;

  if (isStandardTemplate) {
    // Erstelle eine Kopie als benutzerdefiniertes Template
    return {
      ...customTemplates,
      [templateId]: {
        ...templates[templateId],
        id: templateId,
        categories: newOrder,
      },
    };
  } else {
    // Verwende das bestehende benutzerdefinierte Template
    return {
      ...customTemplates,
      [templateId]: {
        ...customTemplates[templateId],
        categories: newOrder,
      },
    };
  }
};
