import { createLogger } from '~/utils/logger';

import type { ShoppingItem } from '~/types/app-types';

// Logger initialisieren
const _logger = createLogger('useListExport');

/**
 * Interface für die Export-Daten
 */
interface IExportData {
  name: string;
  items: ShoppingItem[];
  templateId?: string;
  exportDate: string;
  exportVersion: string;
}

/**
 * Composable für den Export von Einkaufslisten
 */
export function useListExport(): void {
  /**
   * Exportiert eine Liste als JSON-Datei
   * @param exportData - Basisdaten für den Export
   * @param items - Artikel der Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  const exportList = (
    exportData: { name: string; templateId?: string },
    items: ShoppingItem[]
  ): boolean => {
    try {
      _logger.info('Starte Export für Liste:', exportData.name);

      // Bereite die Daten für den Export vor
      const fullExportData: IExportData = {
        name: exportData.name,
        items: items || [],
        templateId: exportData.templateId,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0.0',
      };

      logger.info('Export-Daten vorbereitet:', fullExportData);

      // Konvertiere zu JSON
      const jsonData = JSON.stringify(fullExportData, null, 2);

      // Direkter Download mit Browser-API
      const fileName = `${fullExportData.name.replace(/\s+/g, '_')}_${Date.now()}.json`;

      // Erstelle einen Blob und einen Download-Link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      logger.info('Blob erstellt, URL:', url);

      // Erstelle einen unsichtbaren Link zum Herunterladen
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      // Füge den Link zum DOM hinzu, klicke ihn und entferne ihn wieder
      document.body.appendChild(link);

      logger.info('Link erstellt, starte Download:', fileName);
      link.click();

      // Kurze Verzögerung vor dem Entfernen des Links
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        _logger.info('Download-Link entfernt, URL freigegeben');
      }, 100);

      return true;
    } catch (error) {
      _logger.error('Fehler beim Exportieren der Liste:', error);
      return false;
    }
  };

  return {
    exportList,
  };
}
