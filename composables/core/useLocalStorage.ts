import { createLogger } from '~/utils/logger';

/**
 * Ein Composable für die Verwaltung des localStorage
 * Bietet Funktionen zum Speichern, Laden und Löschen von Daten
 */
export function useLocalStorage() {
  // Logger initialisieren
  const logger = createLogger('useLocalStorage');

  /**
   * Erstellt eine tiefe Kopie eines Objekts oder Arrays durch JSON-Parsing
   * Nützlich für immutable Updates von verschachtelten Datenstrukturen
   *
   * @param obj - Das zu kopierende Objekt oder Array
   * @returns Eine tiefe Kopie des Objekts oder Arrays
   */
  const createImmutableCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;
  /**
   * Speichert Daten im localStorage
   * @param key - Der Schlüssel, unter dem die Daten gespeichert werden
   * @param value - Die zu speichernden Daten
   */
  const saveToStorage = <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Fehler beim Speichern von ${key}:`, error);
    }
  };

  /**
   * Lädt Daten aus dem localStorage
   * @param key - Der Schlüssel, unter dem die Daten gespeichert sind
   * @param defaultValue - Ein Standardwert, der zurückgegeben wird, wenn keine Daten gefunden wurden
   * @return Die geladenen Daten oder der Standardwert
   */
  const loadFromStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue === null) {
        return defaultValue;
      }
      return JSON.parse(storedValue) as T;
    } catch (error) {
      logger.error(`Fehler beim Laden von ${key}:`, error);
      return defaultValue;
    }
  };

  /**
   * Löscht Daten aus dem localStorage
   * @param key - Der Schlüssel, unter dem die zu löschenden Daten gespeichert sind
   */
  const removeFromStorage = (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Fehler beim Löschen von ${key}:`, error);
    }
  };

  /**
   * Leert den gesamten localStorage
   */
  const clearStorage = (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error('Fehler beim Leeren des Speichers:', error);
    }
  };

  /**
   * Prüft, ob ein Schlüssel im localStorage existiert
   * @param key - Der zu prüfende Schlüssel
   * @return true, wenn der Schlüssel existiert, sonst false
   */
  const keyExists = (key: string): boolean => localStorage.getItem(key) !== null;

  return {
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    clearStorage,
    keyExists,
    createImmutableCopy,
  };
}
