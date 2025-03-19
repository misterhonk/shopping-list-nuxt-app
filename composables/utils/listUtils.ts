import { createLogger } from '~/utils/logger';

import type { ShoppingList, CategoryTemplate } from '../types';

// Logger initialisieren
const logger = createLogger('listUtils');

/**
 * Sortiert eine Liste von Einkaufslisten, so dass Favoriten zuerst erscheinen
 * @param lists - Die zu sortierenden Listen
 * @returns Die sortierten Listen
 */
export const sortListsByFavorites = (lists: ShoppingList[]): ShoppingList[] => {
  return [...lists].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) {
      return -1;
    }
    if (!a.isFavorite && b.isFavorite) {
      return 1;
    }
    return 0;
  });
};

/**
 * Ermittelt die passende Template-ID basierend auf dem Listennamen
 * Analysiert den Listennamen auf Schlüsselwörter und weist eine passende Template-ID zu.
 * @param name - Der zu analysierende Listenname
 * @param defaultTemplateId - Die Standard-Template-ID, falls keine Schlüsselwörter erkannt werden
 * @returns Die ermittelte Template-ID oder die defaultTemplateId als Fallback
 */
export const determineTemplateId = (name: string, defaultTemplateId = 'supermarket'): string => {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes('drogerie') ||
    lowerName.includes('apotheke') ||
    lowerName.includes('kosmetik')
  ) {
    return 'drugstore';
  }

  if (
    lowerName.includes('baumarkt') ||
    lowerName.includes('werkzeug') ||
    lowerName.includes('bau')
  ) {
    return 'hardware';
  }

  if (
    lowerName.includes('elektronik') ||
    lowerName.includes('technik') ||
    lowerName.includes('computer')
  ) {
    return 'electronics';
  }

  return defaultTemplateId;
};

/**
 * Interface für den Kategorie-Store
 */
interface CategoryStore {
  activateTemplate: (templateId: string) => void;
}

/**
 * Aktiviert eine Kategorie-Vorlage im Store, mit Fehlerbehandlung
 * @param store - Der Kategorie-Store oder null
 * @param templateId - Die zu aktivierende Template-ID
 */
export const activateTemplateInStore = (store: CategoryStore | null, templateId: string): void => {
  if (!store) {
    return;
  }

  try {
    store.activateTemplate(templateId);
  } catch (e) {
    logger.error('Fehler beim Aktivieren der Template:', e);
  }
};

/**
 * Gibt die Anzahl der Artikel in einer Liste zurück
 * @param list - Die zu prüfende Liste
 * @returns Die Anzahl der Artikel
 */
export const getItemsCount = (list: ShoppingList): number =>
  Array.isArray(list?.items) ? list.items.length : 0;

/**
 * Gibt die Anzahl der erledigten Artikel in einer Liste zurück
 * @param list - Die zu prüfende Liste
 * @returns Die Anzahl der erledigten Artikel
 */
export const getCheckedItemsCount = (list: ShoppingList): number =>
  Array.isArray(list?.items) ? list.items.filter(item => item.checked).length : 0;
