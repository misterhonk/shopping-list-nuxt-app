import { deepCopy, sanitizeTemplate } from './utils';
import { TemplateCollection } from '../../composables/types';

// Logger initialisieren
const logger = createLogger('storage');

/**
 * Interface für die gespeicherten Kategoriedaten
 */
interface StoredCategoryData {
  activeTemplateId: string;
  customTemplates: TemplateCollection;
}

/**
 * Speichert die Kategoriedaten im localStorage
 * @param activeTemplateId - Die aktive Template-ID
 * @param customTemplates - Die benutzerdefinierten Templates
 */
export const saveCategoryData = (
  activeTemplateId: string,
  customTemplates: TemplateCollection
): void => {
  try {
    // Sicherstellen, dass alle Templates korrekt formatiert sind
    const cleanCustomTemplates = Object.entries(customTemplates).reduce(
      (acc, [id, template]) => ({
        ...acc,
        [id]: sanitizeTemplate(template),
      }),
      {} as TemplateCollection
    );

    const dataToSave: StoredCategoryData = {
      activeTemplateId,
      customTemplates: cleanCustomTemplates,
    };

    // Tiefe Kopie erstellen, um Referenzprobleme zu vermeiden
    const cleanDataToSave = deepCopy(dataToSave);

    logger.info('Speichere in localStorage:', cleanDataToSave);
    localStorage.setItem('categoryTemplates', JSON.stringify(cleanDataToSave));
  } catch (error) {
    logger.error('Fehler beim Speichern der Kategorie-Vorlagen:', error);
  }
};

/**
 * Lädt die Kategoriedaten aus dem localStorage
 * @returns Die geladenen Kategoriedaten oder null bei Fehler
 */
export const loadCategoryData = (): StoredCategoryData | null => {
  try {
    logger.info('Lade aus localStorage');
    const data = localStorage.getItem('categoryTemplates');

    if (!data) {
      return null;
    }

    const parsedData = JSON.parse(data) as StoredCategoryData;
    logger.info('Geladene Daten:', parsedData);

    return {
      activeTemplateId: parsedData.activeTemplateId || '',
      customTemplates: parsedData.customTemplates || {},
    };
  } catch (error) {
    logger.error('Fehler beim Laden der Kategorie-Vorlagen:', error);
    return null;
  }
};
