/**
 * Composable für die Interaktion mit dem localStorage
 * Bietet generische Funktionen zum Laden und Speichern von Daten
 */
export function useLocalStorage() {
  /**
   * Speichert Daten im localStorage
   * @param key - Der Schlüssel unter dem die Daten gespeichert werden
   * @param data - Die zu speichernden Daten
   * @returns - true bei Erfolg, false bei Fehler
   */
  const saveToStorage = <T>(key: string, data: T): boolean => {
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
   * @param key - Der Schlüssel unter dem die Daten gespeichert sind
   * @param defaultValue - Standardwert, falls keine Daten gefunden wurden
   * @returns - Die geladenen Daten oder der Standardwert
   */
  const loadFromStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Fehler beim Laden aus localStorage (${key}):`, error);
      return defaultValue;
    }
  };

  /**
   * Entfernt Daten aus dem localStorage
   * @param key - Der zu entfernende Schlüssel
   * @returns - true bei Erfolg, false bei Fehler
   */
  const removeFromStorage = (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Fehler beim Entfernen aus localStorage (${key}):`, error);
      return false;
    }
  };

  /**
   * Erstellt eine Kopie eines Objekts für Immutabilität
   * Effizienter als JSON.parse(JSON.stringify())
   * @param obj - Das zu kopierende Objekt
   * @returns - Eine neue Kopie des Objekts
   */
  const createImmutableCopy = <T>(obj: T): T => {
    // Dies ist eine performantere Alternative zu JSON.parse(JSON.stringify())
    // für einfache Objekte ohne zirkuläre Referenzen
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => createImmutableCopy(item)) as unknown as T;
    }
    
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(
        ([key, value]) => [key, createImmutableCopy(value)]
      )
    ) as T;
  };

  return {
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    createImmutableCopy
  };
}
