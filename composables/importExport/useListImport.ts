import { createLogger } from '~/utils/logger';

import type { ImportOptions, ExportedList, CreateListOptions } from '~/composables/types';
import type { ShoppingList, ShoppingItem } from '~/types/app-types';

// Logger initialisieren
const logger = createLogger('useListImport');

/**
 * Interface für die Import-Ergebnisse
 */
interface ImportResult {
  success: boolean;
  message: string;
  listId?: string;
  itemCount?: number;
  error?: Error;
}

/**
 * Interface für die Dienste, die für den Import benötigt werden
 */
interface ImportServices {
  createList: (name: string, options: CreateListOptions) => ShoppingList | null;
  addItem: (item: Partial<ShoppingItem>) => ShoppingItem | null;
  selectList: (listId: string) => boolean;
  updateList: (listData: Partial<ShoppingList> & { id: string }) => boolean;
}

/**
 * Composable für den Import von Einkaufslisten
 */
export function useListImport(): void {
  /**
   * Lädt eine Datei und zeigt Optionen an
   * @param callback - Callback für geladene Daten
   */
  const loadFileAndShowOptions = (callback: (data: ExportedList) => void): void => {
    // Erstelle einen temporären Datei-Input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Event-Handler für Dateiauswahl
    fileInput.onchange = event => {
      const target = event.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) {
        logger.info('Keine Datei ausgewählt');
        document.body.removeChild(fileInput);
        return;
      }

      const file = target.files[0];
      if (file.type !== 'application/json') {
        alert('Die Datei muss im JSON-Format sein');
        document.body.removeChild(fileInput);
        return;
      }

      const reader = new FileReader();

      reader.onload = readerEvent => {
        try {
          if (!readerEvent.target || typeof readerEvent.target.result !== 'string') {
            throw new Error('Fehler beim Lesen der Datei');
          }

          const parsedData = JSON.parse(readerEvent.target.result);

          // Validiere die Daten
          if (!parsedData.name || !Array.isArray(parsedData.items)) {
            alert('Ungültiges Dateiformat. Die Datei enthält keine gültige Einkaufsliste.');
            document.body.removeChild(fileInput);
            return;
          }

          // Prüfe, ob es ein gültiges Format ist
          const importData: ExportedList = {
            name: parsedData.name ?? '',
            items: Array.isArray(parsedData.items) ? parsedData.items : [],
            format: parsedData.format ?? 'shopping-list-app',
            version: parsedData.version ?? '1.0',
            exportedAt: parsedData.exportedAt ?? Date.now(),
            templateId: parsedData.templateId,
          };

          // Callback mit den Daten aufrufen
          callback(importData);
        } catch (error) {
          logger.error('Fehler beim Parsen der Datei:', error);
          alert(`Die Datei konnte nicht gelesen werden: ${(error as Error).message}`);
        } finally {
          document.body.removeChild(fileInput);
        }
      };

      reader.onerror = () => {
        alert('Fehler beim Lesen der Datei');
        document.body.removeChild(fileInput);
      };

      reader.readAsText(file);
    };

    // Datei-Dialog öffnen
    fileInput.click();
  };

  /**
   * Importiert eine Liste aus Daten mit Optionen
   * @param data - Die Importdaten
   * @param options - Die Importoptionen
   * @param services - Die benötigten Dienste
   * @returns Das Importergebnis
   */
  const importListWithOptions = (
    data: ExportedList,
    options: ImportOptions,
    services: ImportServices
  ): ImportResult => {
    try {
      if (!data.name || !Array.isArray(data.items)) {
        return {
          success: false,
          message: 'Ungültige Import-Daten',
        };
      }

      // Modi: 'create' (neue Liste), 'merge' (zu bestehender Liste hinzufügen), 'replace' (bestehende Liste ersetzen)
      switch (options.mode) {
        case 'create':
          return importAsNewList(data, services);

        case 'merge':
          if (!options.targetListId) {
            return {
              success: false,
              message: 'Keine Zielliste für den Merge-Modus angegeben',
            };
          }
          return mergeWithExistingList(
            data,
            options.targetListId,
            services,
            !!options.keepExistingItems
          );

        case 'replace':
          if (!options.targetListId) {
            return {
              success: false,
              message: 'Keine Zielliste für den Replace-Modus angegeben',
            };
          }
          return replaceExistingList(data, options.targetListId, services);

        default:
          return {
            success: false,
            message: 'Ungültiger Import-Modus',
          };
      }
    } catch (error) {
      logger.error('Fehler beim Import mit Optionen:', error);
      return {
        success: false,
        message: `Import fehlgeschlagen: ${(error as Error).message}`,
        error: error as Error,
      };
    }
  };

  /**
   * Importiert Daten als neue Liste
   * @param data - Die Importdaten
   * @param services - Die benötigten Dienste
   * @returns Das Importergebnis
   */
  const importAsNewList = (data: ExportedList, services: ImportServices): ImportResult => {
    // Erstelle eine neue Liste
    const newList = services.createList(data.name, {
      templateId: data.templateId ?? 'supermarket',
      isFavorite: false,
    });

    if (!newList) {
      return {
        success: false,
        message: 'Fehler beim Erstellen der Liste',
      };
    }

    // Füge alle Elemente hinzu
    if (Array.isArray(data.items) && data.items.length > 0) {
      let addedCount = 0;

      for (const item of data.items) {
        const itemData = {
          name: item.name,
          quantity: item.quantity ?? 1,
          category: item.category ?? 'Sonstiges',
          price: item.price ?? 0,
          checked: !!item.checked,
        };

        try {
          const addedItem = services.addItem(itemData);
          if (addedItem) {
            addedCount++;
          }
        } catch (itemError) {
          logger.error('Fehler beim Hinzufügen eines Elements:', itemError);
        }
      }

      if (addedCount !== data.items.length) {
        logger.warn(
          `Nicht alle Items konnten importiert werden (${addedCount}/${data.items.length})`
        );
      }

      // Aktualisiere die ID
      services.selectList(newList.id);

      return {
        success: true,
        message: `Liste "${data.name}" mit ${addedCount} Artikel importiert`,
        listId: newList.id,
        itemCount: addedCount,
      };
    } else {
      return {
        success: true,
        message: `Leere Liste "${data.name}" importiert`,
        listId: newList.id,
        itemCount: 0,
      };
    }
  };

  /**
   * Fügt Importdaten zu einer bestehenden Liste hinzu
   * @param data - Die Importdaten
   * @param targetListId - Die ID der Zielliste
   * @param services - Die benötigten Dienste
   * @param keepExisting - Ob bestehende Artikel beibehalten werden sollen
   * @returns Das Importergebnis
   */
  const mergeWithExistingList = (
    data: ExportedList,
    targetListId: string,
    services: ImportServices,
    _keepExisting: boolean
  ): ImportResult => {
    // Aktualisiere die Liste
    services.selectList(targetListId);

    // Füge nur die neuen Elemente hinzu
    if (Array.isArray(data.items) && data.items.length > 0) {
      let addedCount = 0;

      for (const item of data.items) {
        const itemData = {
          name: item.name,
          quantity: item.quantity ?? 1,
          category: item.category ?? 'Sonstiges',
          price: item.price ?? 0,
          checked: !!item.checked,
        };

        try {
          const addedItem = services.addItem(itemData);
          if (addedItem) {
            addedCount++;
          }
        } catch (itemError) {
          logger.error('Fehler beim Hinzufügen eines Elements:', itemError);
        }
      }

      return {
        success: true,
        message: `${addedCount} Artikel zur bestehenden Liste hinzugefügt`,
        listId: targetListId,
        itemCount: addedCount,
      };
    } else {
      return {
        success: true,
        message: 'Keine Artikel zum Hinzufügen in den Importdaten',
        listId: targetListId,
        itemCount: 0,
      };
    }
  };

  /**
   * Ersetzt eine bestehende Liste mit den Importdaten
   * @param data - Die Importdaten
   * @param targetListId - Die ID der Zielliste
   * @param services - Die benötigten Dienste
   * @returns Das Importergebnis
   */
  const replaceExistingList = (
    data: ExportedList,
    targetListId: string,
    services: ImportServices
  ): ImportResult => {
    // Aktualisiere die Liste mit neuen Daten
    const updateSuccess = services.updateList({
      id: targetListId,
      name: data.name,
      templateId: data.templateId ?? 'supermarket',
      items: data.items.map((item: ShoppingItem) => ({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        quantity: item.quantity ?? 1,
        category: item.category ?? 'Sonstiges',
        price: item.price ?? 0,
        checked: !!item.checked,
      })),
    });

    if (!updateSuccess) {
      return {
        success: false,
        message: 'Fehler beim Ersetzen der Listendaten',
      };
    }

    services.selectList(targetListId);

    return {
      success: true,
      message: `Liste ersetzt mit ${data.items.length} Artikeln`,
      listId: targetListId,
      itemCount: data.items.length,
    };
  };

  /**
   * Alte Importmethode für Abwärtskompatibilität
   * @param importData - Die Importdaten
   * @param createList - Funktion zum Erstellen einer Liste
   * @param addItem - Funktion zum Hinzufügen eines Artikels
   * @returns Das Importergebnis
   */
  const importList = (
    importData: ExportedList,
    createList: (name: string, options: CreateListOptions) => ShoppingList | null,
    addItem: (item: Partial<ShoppingItem>) => ShoppingItem | null
  ): ImportResult => {
    try {
      // Validiere die Daten
      if (!importData.name || !Array.isArray(importData.items)) {
        return {
          success: false,
          message: 'Ungültiges Dateiformat. Die Datei enthält keine gültige Einkaufsliste.',
        };
      }

      // Erstelle eine neue Liste
      const newList = createList(importData.name, {
        templateId: importData.templateId ?? 'supermarket',
        isFavorite: false,
      });

      if (!newList) {
        return {
          success: false,
          message: 'Fehler beim Erstellen der Liste',
        };
      }

      // Füge alle Elemente hinzu
      if (Array.isArray(importData.items) && importData.items.length > 0) {
        let addedCount = 0;

        for (const item of importData.items) {
          const itemData = {
            name: item.name,
            quantity: item.quantity ?? 1,
            category: item.category ?? 'Sonstiges',
            price: item.price ?? 0,
          };

          try {
            const addedItem = addItem(itemData);
            if (addedItem) {
              addedCount++;
            }
          } catch (itemError) {
            logger.error('Fehler beim Hinzufügen eines Elements:', itemError);
          }
        }

        return {
          success: true,
          message: `Liste importiert: ${importData.name}`,
          listId: newList.id,
          itemCount: addedCount,
        };
      } else {
        return {
          success: true,
          message: `Leere Liste importiert: ${importData.name}`,
          listId: newList.id,
          itemCount: 0,
        };
      }
    } catch (error) {
      logger.error('Fehler beim Importieren der Liste:', error);
      return {
        success: false,
        message: `Import fehlgeschlagen: ${(error as Error).message}`,
        error: error as Error,
      };
    }
  };

  return {
    loadFileAndShowOptions,
    importListWithOptions,
    importList,
  };
}
