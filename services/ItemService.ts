/**
 * Service für die Verwaltung von Einkaufsartikeln
 * 
 * Dieser Service enthält die Geschäftslogik für die Verwaltung von Einkaufsartikeln
 * und ist unabhängig von der Vue-spezifischen UI-Logik.
 */

import { BaseService } from './base/BaseService';
import { isShoppingItem } from '~/utils/validation';
import type { ShoppingList, ShoppingItem } from '~/composables/types';
import type { ShoppingListService } from './ShoppingListService';

/**
 * Service für die Verwaltung von Einkaufsartikeln
 */
export class ItemService extends BaseService {
  /**
   * Der ShoppingListService für den Zugriff auf Listen
   */
  private listService: ShoppingListService;

  /**
   * Erstellt eine neue Instanz des ItemService
   * @param listService - Der ShoppingListService
   */
  constructor(listService: ShoppingListService) {
    super('ItemService');
    this.listService = listService;
  }

  /**
   * Gibt alle Artikel einer Liste zurück
   * @param listId - ID der Liste
   * @returns Array aller Artikel oder leeres Array bei Fehler
   */
  public getItemsByListId(listId: string): ShoppingItem[] {
    return this.safeOperation(() => {
      if (!listId) {
        throw new Error('ListId darf nicht leer sein');
      }
      
      const list = this.listService.getListById(listId);
      
      if (!list) {
        throw new Error(`Liste mit ID ${listId} nicht gefunden`);
      }
      
      // Stelle sicher, dass jedes Item die listId hat
      const items = Array.isArray(list.items) ? [...list.items] : [];
      return items.map(item => ({
        ...item,
        listId: listId // Stelle sicher, dass jedes Item die listId hat
      }));
    }, `Fehler beim Abrufen der Artikel für Liste ${listId}`) ?? [];
  }

  /**
   * Gibt einen Artikel anhand seiner ID zurück
   * @param listId - ID der Liste
   * @param itemId - ID des Artikels
   * @returns Der gefundene Artikel oder null bei Fehler
   */
  public getItemById(listId: string, itemId: string): ShoppingItem | null {
    return this.safeOperation(() => {
      if (!listId || !itemId) {
        throw new Error('ListId und ItemId dürfen nicht leer sein');
      }
      
      const items = this.getItemsByListId(listId);
      return items.find(item => item.id === itemId) || null;
    }, `Fehler beim Abrufen des Artikels mit ID ${itemId} aus Liste ${listId}`);
  }

  /**
   * Fügt einen Artikel zu einer Liste hinzu
   * @param listId - ID der Liste
   * @param item - Der hinzuzufügende Artikel
   * @returns Der hinzugefügte Artikel oder null bei Fehler
   */
  public addItem(listId: string, item: Partial<ShoppingItem>): ShoppingItem | null {
    return this.safeOperation(() => {
      if (!listId) {
        throw new Error('ListId darf nicht leer sein');
      }
      
      if (!item || !item.name || item.name.trim() === '') {
        throw new Error('Artikel muss einen Namen haben');
      }
      
      const list = this.listService.getListById(listId);
      
      if (!list) {
        throw new Error(`Liste mit ID ${listId} nicht gefunden`);
      }
      
      // Neues Item erstellen
      const timestamp = Date.now();
      const newItem: ShoppingItem = {
        id: item.id || timestamp.toString(),
        name: item.name.trim(),
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
        category: item.category || 'Sonstiges',
        checked: item.checked || false,
        price: item.price || 0,
        addedAt: timestamp,
        modifiedAt: timestamp,
        listId: listId // Wichtig: Setze die ListId für das neue Item
      };
      
      // Liste aktualisieren
      const updatedList: ShoppingList = {
        ...list,
        items: [...list.items, newItem],
        modifiedAt: timestamp,
      };
      
      // Liste speichern
      const result = this.listService.updateList(updatedList);
      
      return result ? newItem : null;
    }, `Fehler beim Hinzufügen eines Artikels zur Liste ${listId}`);
  }

  /**
   * Aktualisiert einen Artikel
   * @param listId - ID der Liste
   * @param itemId - ID des Artikels
   * @param updates - Die zu aktualisierenden Felder
   * @returns Der aktualisierte Artikel oder null bei Fehler
   */
  public updateItem(
    listId: string,
    itemId: string,
    updates: Partial<ShoppingItem>
  ): ShoppingItem | null {
    return this.safeOperation(() => {
      if (!listId || !itemId) {
        throw new Error('ListId und ItemId dürfen nicht leer sein');
      }
      
      const list = this.listService.getListById(listId);
      
      if (!list) {
        throw new Error(`Liste mit ID ${listId} nicht gefunden`);
      }
      
      const itemIndex = list.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        throw new Error(`Artikel mit ID ${itemId} nicht gefunden`);
      }
      
      // Item aktualisieren
      const currentItem = list.items[itemIndex];
      const updatedItem: ShoppingItem = {
        ...currentItem,
        ...updates,
        id: itemId, // ID darf nicht überschrieben werden
        listId: listId, // Stelle sicher, dass die ListId gesetzt ist
        modifiedAt: Date.now(),
      };
      
      // Liste aktualisieren
      const updatedItems = [
        ...list.items.slice(0, itemIndex),
        updatedItem,
        ...list.items.slice(itemIndex + 1),
      ];
      
      const updatedList: ShoppingList = {
        ...list,
        items: updatedItems,
        modifiedAt: Date.now(),
      };
      
      // Liste speichern
      const result = this.listService.updateList(updatedList);
      
      return result ? updatedItem : null;
    }, `Fehler beim Aktualisieren des Artikels mit ID ${itemId} in Liste ${listId}`);
  }

  /**
   * Entfernt einen Artikel aus einer Liste
   * @param listId - ID der Liste
   * @param itemId - ID des Artikels
   * @returns true bei Erfolg, false bei Fehler
   */
  public removeItem(listId: string, itemId: string): boolean {
    return this.safeOperation(() => {
      if (!listId || !itemId) {
        throw new Error('ListId und ItemId dürfen nicht leer sein');
      }
      
      const list = this.listService.getListById(listId);
      
      if (!list) {
        throw new Error(`Liste mit ID ${listId} nicht gefunden`);
      }
      
      // Prüfen, ob Item existiert
      const itemExists = list.items.some(item => item.id === itemId);
      
      if (!itemExists) {
        throw new Error(`Artikel mit ID ${itemId} nicht gefunden`);
      }
      
      // Liste aktualisieren
      const updatedList: ShoppingList = {
        ...list,
        items: list.items.filter(item => item.id !== itemId),
        modifiedAt: Date.now(),
      };
      
      // Liste speichern
      return this.listService.updateList(updatedList) !== null;
    }, `Fehler beim Entfernen des Artikels mit ID ${itemId} aus Liste ${listId}`) ?? false;
  }

  /**
   * Ändert den Erledigtstatus eines Artikels
   * @param listId - ID der Liste
   * @param itemId - ID des Artikels
   * @returns Der aktualisierte Artikel oder null bei Fehler
   */
  public toggleItemChecked(listId: string, itemId: string): ShoppingItem | null {
    return this.safeOperation(() => {
      const item = this.getItemById(listId, itemId);
      
      if (!item) {
        throw new Error(`Artikel mit ID ${itemId} nicht gefunden`);
      }
      
      return this.updateItem(listId, itemId, {
        checked: !item.checked,
      });
    }, `Fehler beim Ändern des Erledigtstatus des Artikels mit ID ${itemId} in Liste ${listId}`);
  }

  /**
   * Entfernt alle erledigten Artikel aus einer Liste
   * @param listId - ID der Liste
   * @returns true bei Erfolg, false bei Fehler
   */
  public clearCheckedItems(listId: string): boolean {
    return this.safeOperation(() => {
      if (!listId) {
        throw new Error('ListId darf nicht leer sein');
      }
      
      const list = this.listService.getListById(listId);
      
      if (!list) {
        throw new Error(`Liste mit ID ${listId} nicht gefunden`);
      }
      
      // Liste aktualisieren
      const updatedList: ShoppingList = {
        ...list,
        items: list.items.filter(item => !item.checked),
        modifiedAt: Date.now(),
      };
      
      // Liste speichern
      return this.listService.updateList(updatedList) !== null;
    }, `Fehler beim Entfernen der erledigten Artikel aus Liste ${listId}`) ?? false;
  }

  /**
   * Berechnet den Gesamtpreis aller Artikel in einer Liste
   * @param listId - ID der Liste
   * @returns Der Gesamtpreis oder 0 bei Fehler
   */
  public calculateTotalPrice(listId: string): number {
    return this.safeOperation(() => {
      const items = this.getItemsByListId(listId);
      
      return items.reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        return total + itemPrice * itemQuantity;
      }, 0);
    }, `Fehler beim Berechnen des Gesamtpreises für Liste ${listId}`) ?? 0;
  }

  /**
   * Berechnet den Preis für eine bestimmte Kategorie in einer Liste
   * @param listId - ID der Liste
   * @param categoryId - ID der Kategorie
   * @returns Der Kategoriepreis oder 0 bei Fehler
   */
  public calculateCategoryPrice(listId: string, categoryId: string): number {
    return this.safeOperation(() => {
      const items = this.getItemsByListId(listId);
      
      return items
        .filter(item => {
          // Kategorie kann ein String oder ein Objekt sein
          if (typeof item.category === 'string') {
            return item.category === categoryId;
          } else if (typeof item.category === 'object' && item.category !== null) {
            return item.category.id === categoryId;
          }
          return false;
        })
        .reduce((total, item) => {
          const itemPrice = item.price || 0;
          const itemQuantity = item.quantity || 1;
          return total + itemPrice * itemQuantity;
        }, 0);
    }, `Fehler beim Berechnen des Preises für Kategorie ${categoryId} in Liste ${listId}`) ?? 0;
  }

  /**
   * Gruppiert Artikel nach Kategorien
   * @param listId - ID der Liste
   * @param categoryNames - Array von Kategorienamen
   * @returns Ein Objekt mit Kategorienamen als Schlüssel und Arrays von Artikeln als Werte
   */
  public groupItemsByCategory(
    listId: string,
    categoryNames: string[]
  ): Record<string, ShoppingItem[]> {
    return this.safeOperation(() => {
      const items = this.getItemsByListId(listId);
      const result: Record<string, ShoppingItem[]> = {};
      
      // Für jede Kategorie ein leeres Array erstellen
      categoryNames.forEach(categoryName => {
        result[categoryName] = [];
      });
      
      // Artikel in die entsprechenden Kategorien einsortieren
      items.forEach(item => {
        const categoryName = typeof item.category === 'object' && item.category
          ? item.category.name
          : String(item.category);
        
        if (result[categoryName]) {
          result[categoryName].push(item);
        } else {
          // Fallback für unbekannte Kategorien
          if (!result.Sonstiges) {
            result.Sonstiges = [];
          }
          result.Sonstiges.push(item);
        }
      });
      
      return result;
    }, `Fehler beim Gruppieren der Artikel nach Kategorien für Liste ${listId}`) ?? {};
  }
}