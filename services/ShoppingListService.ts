/**
 * Service für die Verwaltung von Einkaufslisten
 *
 * Dieser Service enthält die Geschäftslogik für die Verwaltung von Einkaufslisten
 * und ist unabhängig von der Vue-spezifischen UI-Logik.
 */

import { isShoppingList, isShoppingListArray } from '~/utils/validation';

import { BaseService } from './base/BaseService';

import type { CreateListOptions } from '~/composables/types';
import type { IStorageRepository } from '~/repositories/StorageRepository';
import type { ShoppingList } from '~/types/app-types';

/**
 * Service für die Verwaltung von Einkaufslisten
 */
export class ShoppingListService extends BaseService {
  /**
   * Der Schlüssel für die Listen im Storage
   */
  private readonly STORAGE_KEY = 'shoppingLists';

  /**
   * Der Schlüssel für die aktuelle Listen-ID im Storage
   */
  private readonly CURRENT_LIST_KEY = 'currentListId';

  /**
   * Das Repository für den Datenzugriff
   */
  private readonly repository: IStorageRepository;

  /**
   * Erstellt eine neue Instanz des ShoppingListService
   * @param repository - Das Repository für den Datenzugriff
   */
  constructor(repository: IStorageRepository) {
    super('ShoppingListService');
    this.repository = repository;
  }

  /**
   * Lädt alle Listen aus dem Storage
   * @returns Array aller Listen oder leeres Array bei Fehler
   */
  public getAllLists(): ShoppingList[] {
    const lists = this.repository.getItem<ShoppingList[]>(this.STORAGE_KEY);

    if (!lists) {
      return [];
    }

    if (!isShoppingListArray(lists)) {
      this._logger.error('Ungültiges Format der gespeicherten Listen');
      return [];
    }

    return lists;
  }

  /**
   * Speichert alle Listen im Storage
   * @param lists - Die zu speichernden Listen
   * @returns true bei Erfolg, false bei Fehler
   */
  public saveLists(lists: ShoppingList[]): boolean {
    return (
      this.safeOperation(() => {
        if (!Array.isArray(lists)) {
          throw new TypeError('Listen müssen als Array übergeben werden');
        }

        // Validiere jede Liste
        for (const list of lists) {
          if (!isShoppingList(list)) {
            throw new Error(`Ungültige Liste: ${JSON.stringify(list)}`);
          }
        }

        return this.repository.setItem(this.STORAGE_KEY, lists);
      }, 'Fehler beim Speichern der Listen') ?? false
    );
  }

  /**
   * Findet eine Liste anhand ihrer ID
   * @param listId - Die ID der zu findenden Liste
   * @returns Die gefundene Liste oder null, wenn keine Liste gefunden wurde
   */
  public getListById(listId: string): ShoppingList | null {
    return this.safeOperation(() => {
      if (!listId) {
        throw new Error('ListId darf nicht leer sein');
      }

      const lists = this.getAllLists();
      return lists.find(list => list.id === listId) || null;
    }, `Fehler beim Suchen der Liste mit ID ${listId}`);
  }

  /**
   * Erstellt eine neue Liste
   * @param name - Der Name der neuen Liste
   * @param options - Optionen für die neue Liste
   * @returns Die erstellte Liste oder null bei Fehler
   */
  public createList(name: string, options: CreateListOptions = {}): ShoppingList | null {
    return this.safeOperation(() => {
      if (!name || name.trim() === '') {
        throw new Error('Listenname darf nicht leer sein');
      }

      const timestamp = Date.now();
      const newList: ShoppingList = {
        id: timestamp.toString(),
        name: name.trim(),
        items: options.items ?? [],
        templateId: options.templateId ?? 'supermarket',
        isFavorite: options.isFavorite ?? false,
        createdAt: timestamp,
        modifiedAt: timestamp,
      };

      const lists = this.getAllLists();
      const updatedLists = [...lists, newList];

      const success = this.saveLists(updatedLists);
      return success ? newList : null;
    }, `Fehler beim Erstellen der Liste ${name}`);
  }

  /**
   * Aktualisiert eine Liste
   * @param updatedList - Die aktualisierte Liste
   * @returns Die aktualisierte Liste oder null bei Fehler
   */
  public updateList(updatedList: ShoppingList): ShoppingList | null {
    return this.safeOperation(() => {
      if (!updatedList.id) {
        throw new Error('Ungültige Liste oder fehlende ID');
      }

      const lists = this.getAllLists();
      const listIndex = lists.findIndex(list => list.id === updatedList.id);

      if (listIndex === -1) {
        throw new Error(`Liste mit ID ${updatedList.id} nicht gefunden`);
      }

      // Zeitstempel aktualisieren
      const listWithTimestamp = {
        ...updatedList,
        modifiedAt: Date.now(),
      };

      // Neue Liste mit aktualisierter Liste erstellen
      const updatedLists = [
        ...lists.slice(0, listIndex),
        listWithTimestamp,
        ...lists.slice(listIndex + 1),
      ];

      const success = this.saveLists(updatedLists);
      return success ? listWithTimestamp : null;
    }, `Fehler beim Aktualisieren der Liste ${updatedList.id}`);
  }

  /**
   * Löscht eine Liste
   * @param listId - Die ID der zu löschenden Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  public deleteList(listId: string): boolean {
    return (
      this.safeOperation(() => {
        if (!listId) {
          throw new Error('ListId darf nicht leer sein');
        }

        const lists = this.getAllLists();

        if (lists.length <= 1) {
          throw new Error('Die letzte Liste kann nicht gelöscht werden');
        }

        const updatedLists = lists.filter(list => list.id !== listId);

        if (updatedLists.length === lists.length) {
          throw new Error(`Liste mit ID ${listId} nicht gefunden`);
        }

        // Aktuelle Liste prüfen und ggf. ändern
        const currentListId = this.getCurrentListId();
        if (currentListId === listId) {
          this.setCurrentListId(updatedLists[0].id);
        }

        return this.saveLists(updatedLists);
      }, `Fehler beim Löschen der Liste ${listId}`) ?? false
    );
  }

  /**
   * Gibt die ID der aktuell ausgewählten Liste zurück
   * @returns Die ID der aktuellen Liste oder null, wenn keine Liste ausgewählt ist
   */
  public getCurrentListId(): string | null {
    return this.safeOperation(() => {
      const currentId = this.repository.getItem<string>(this.CURRENT_LIST_KEY);

      if (!currentId) {
        const lists = this.getAllLists();
        return lists.length > 0 ? lists[0].id : null;
      }

      return currentId;
    }, 'Fehler beim Abrufen der aktuellen Listen-ID');
  }

  /**
   * Setzt die aktuelle Listen-ID
   * @param listId - Die neue aktuelle Listen-ID
   * @returns true bei Erfolg, false bei Fehler
   */
  public setCurrentListId(listId: string): boolean {
    return (
      this.safeOperation(() => {
        if (!listId) {
          throw new Error('ListId darf nicht leer sein');
        }

        // Prüfen, ob Liste existiert
        const lists = this.getAllLists();
        const listExists = lists.some(list => list.id === listId);

        if (!listExists) {
          throw new Error(`Liste mit ID ${listId} nicht gefunden`);
        }

        return this.repository.setItem(this.CURRENT_LIST_KEY, listId);
      }, `Fehler beim Setzen der aktuellen Listen-ID ${listId}`) ?? false
    );
  }

  /**
   * Normalisiert eine Liste (stellt sicher, dass alle Felder korrekt gesetzt sind)
   * @param list - Die zu normalisierende Liste
   * @returns Die normalisierte Liste
   */
  public normalizeList(list: Partial<ShoppingList>): ShoppingList {
    const timestamp = Date.now();

    return {
      id: list.id ?? timestamp.toString(),
      name: list.name ?? '',
      items: Array.isArray(list.items) ? list.items : [],
      templateId: list.templateId ?? 'supermarket',
      isFavorite: list.isFavorite ?? false,
      createdAt: list.createdAt ?? timestamp,
      modifiedAt: list.modifiedAt ?? timestamp,
    };
  }
}
