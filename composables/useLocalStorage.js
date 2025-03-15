/**
 * Composable für die Interaktion mit dem localStorage
 * Bietet generische Funktionen zum Laden und Speichern von Daten
 */
export function useLocalStorage() {
  /**
   * Speichert Daten im localStorage
   * @param {string} key - Der Schlüssel unter dem die Daten gespeichert werden
   * @param {any} data - Die zu speichernden Daten
   * @return {boolean} - true bei Erfolg, false bei Fehler
   */
  const saveToStorage = (key, data) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error(`Fehler beim Speichern in localStorage (${key}):`, error);
      return false;
    }
  };

  /**
   * Lädt Daten aus dem localStorage
   * @param {string} key - Der Schlüssel unter dem die Daten gespeichert sind
   * @param {any} defaultValue - Standardwert, falls keine Daten gefunden wurden
   * @return {any} - Die geladenen Daten oder der Standardwert
   */
  const loadFromStorage = (key, defaultValue = null) => {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData);
    } catch (error) {
      console.error(`Fehler beim Laden aus localStorage (${key}):`, error);
      return defaultValue;
    }
  };

  /**
   * Entfernt Daten aus dem localStorage
   * @param {string} key - Der zu entfernende Schlüssel
   * @return {boolean} - true bei Erfolg, false bei Fehler
   */
  const removeFromStorage = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Fehler beim Entfernen aus localStorage (${key}):`, error);
      return false;
    }
  };

  /**
   * Bereinigt ein Objekt für die sichere Speicherung im localStorage
   * @param {object} obj - Das zu bereinigende Objekt
   * @return {object} - Das bereinigte Objekt
   */
  const sanitizeForStorage = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  return {
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    sanitizeForStorage
  };
}
