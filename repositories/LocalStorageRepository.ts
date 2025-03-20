/**
 * LocalStorage-Repository für die Shopping-List-App
 * 
 * Dieses Repository implementiert das StorageRepository-Interface mit
 * localStorage als Speichermethode.
 */

import { createLogger } from '~/utils/logger';
import { isShoppingListArray } from '~/utils/validation';
import type { StorageRepository } from './StorageRepository';

/**
 * LocalStorage-basierte Implementierung des StorageRepository
 */
export class LocalStorageRepository implements StorageRepository {
  /**
   * Der Logger für das Repository
   */
  private logger;

  /**
   * Erstellt eine neue Instanz des LocalStorageRepository
   */
  constructor() {
    this.logger = createLogger('LocalStorageRepository');
  }

  /**
   * Lädt ein Element aus dem localStorage
   * @param key - Schlüssel des Elements
   * @returns Das geladene Element oder null bei Fehler oder nicht vorhandenem Element
   */
  public getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      
      if (!value) {
        return null;
      }
      
      const parsedValue = JSON.parse(value) as T;
      
      // Validierung für bekannte Datentypen
      if (key === 'shoppingLists' && !isShoppingListArray(parsedValue)) {
        this.logger.error('Ungültiges Format der gespeicherten Listen');
        return null;
      }
      
      return parsedValue;
    } catch (error) {
      this.logger.error(`Fehler beim Laden aus dem localStorage (Schlüssel: ${key}):`, error);
      return null;
    }
  }

  /**
   * Speichert ein Element im localStorage
   * @param key - Schlüssel des Elements
   * @param value - Das zu speichernde Element
   * @returns true bei Erfolg, false bei Fehler
   */
  public setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Fehler beim Speichern im localStorage (Schlüssel: ${key}):`, error);
      return false;
    }
  }

  /**
   * Entfernt ein Element aus dem localStorage
   * @param key - Schlüssel des Elements
   * @returns true bei Erfolg, false bei Fehler
   */
  public removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      this.logger.error(`Fehler beim Entfernen aus dem localStorage (Schlüssel: ${key}):`, error);
      return false;
    }
  }

  /**
   * Prüft, ob ein Element im localStorage existiert
   * @param key - Schlüssel des Elements
   * @returns true, wenn das Element existiert, sonst false
   */
  public hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      this.logger.error(`Fehler beim Prüfen auf Existenz im localStorage (Schlüssel: ${key}):`, error);
      return false;
    }
  }

  /**
   * Löscht alle Elemente aus dem localStorage
   * @returns true bei Erfolg, false bei Fehler
   */
  public clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      this.logger.error('Fehler beim Leeren des localStorage:', error);
      return false;
    }
  }

  /**
   * Gibt alle Schlüssel im localStorage zurück
   * @returns Array aller Schlüssel oder leeres Array bei Fehler
   */
  public keys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      this.logger.error('Fehler beim Abrufen der localStorage-Schlüssel:', error);
      return [];
    }
  }
}
