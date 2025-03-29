/**
 * Basisservice für die Shopping-List-App
 *
 * Diese Klasse dient als Basis für alle Service-Klassen und stellt
 * grundlegende Funktionalitäten wie Logging bereit.
 */

import { createLogger } from '~/utils/logger';

/**
 * Basisklasse für alle Services der Anwendung
 */
export abstract class BaseService {
  /**
   * Der Logger für den Service
   */
  protected _logger;

  /**
   * Erstellt eine neue Instanz der BaseService-Klasse
   * @param serviceName - Der Name des Services (für Logging)
   */
  constructor(serviceName: string) {
    this.logger = createLogger(serviceName);
  }

  /**
   * Führt eine Operation mit Fehlerbehandlung aus
   * @param operation - Die auszuführende Operation
   * @param errorMessage - Die Fehlermeldung, die protokolliert werden soll
   * @returns Das Ergebnis der Operation oder null bei einem Fehler
   */
  protected safeOperation<T>(operation: () => T, errorMessage: string): T | null {
    try {
      return operation();
    } catch (error) {
      this._logger.error(errorMessage, error);
      return null;
    }
  }

  /**
   * Führt eine asynchrone Operation mit Fehlerbehandlung aus
   * @param operation - Die auszuführende asynchrone Operation
   * @param errorMessage - Die Fehlermeldung, die protokolliert werden soll
   * @returns Das Ergebnis der Operation oder null bei einem Fehler
   */
  protected async safeAsyncOperation<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this._logger.error(errorMessage, error);
      return null;
    }
  }
}
