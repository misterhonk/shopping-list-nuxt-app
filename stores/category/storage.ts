import { useLocalStorage } from '~/composables/core/useLocalStorage';
import { createLogger } from '~/utils/logger';

import { sanitizeTemplate } from './utils';

import type { TemplateCollection } from '~/composables/types';

// Logger initialisieren
const logger = createLogger('storage');

// LocalStorage-Funktionen
const { saveToStorage, loadFromStorage, createImmutableCopy } = useLocalStorage();

// Key für den LocalStorage
const STORAGE_KEY = 'categoryTemplates';

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
    const cleanDataToSave = createImmutableCopy(dataToSave);

    logger.info('Speichere in localStorage:', cleanDataToSave);
    saveToStorage(STORAGE_KEY, cleanDataToSave);
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
    const parsedData = loadFromStorage<StoredCategoryData>(STORAGE_KEY);

    if (!parsedData) {
      return null;
    }

    logger.info('Geladene Daten:', parsedData);

    return {
      activeTemplateId: parsedData.activeTemplateId ?? '',
      customTemplates: parsedData.customTemplates ?? {},
    };
  } catch (error) {
    logger.error('Fehler beim Laden der Kategorie-Vorlagen:', error);
    return null;
  }
};
