/**
 * Interface für einheitlichen Datenzugriff
 *
 * Dieses Interface definiert die Schnittstelle für Storage-Repositories und
 * ermöglicht die Abstraktion der konkreten Speichermethode (localStorage, IndexedDB, etc.).
 */

/**
 * Interface für Storage-Repositories
 */
export interface StorageRepository {
  /**
   * Lädt ein Element aus dem Speicher
   * @param key - Schlüssel des Elements
   * @returns Das geladene Element oder null bei Fehler oder nicht vorhandenem Element
   */
  getItem: <T>(key: string) => T | null;

  /**
   * Speichert ein Element im Speicher
   * @param key - Schlüssel des Elements
   * @param value - Das zu speichernde Element
   * @returns true bei Erfolg, false bei Fehler
   */
  setItem: <T>(key: string, value: T) => boolean;

  /**
   * Entfernt ein Element aus dem Speicher
   * @param key - Schlüssel des Elements
   * @returns true bei Erfolg, false bei Fehler
   */
  removeItem: (key: string) => boolean;

  /**
   * Prüft, ob ein Element im Speicher existiert
   * @param key - Schlüssel des Elements
   * @returns true, wenn das Element existiert, sonst false
   */
  hasItem: (key: string) => boolean;

  /**
   * Löscht alle Elemente aus dem Speicher
   * @returns true bei Erfolg, false bei Fehler
   */
  clear: () => boolean;

  /**
   * Gibt alle Schlüssel im Speicher zurück
   * @returns Array aller Schlüssel oder leeres Array bei Fehler
   */
  keys: () => string[];
}
