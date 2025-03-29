/**
 * Service-Layer für die Shopping-List-App
 *
 * Diese Datei exportiert alle Service-Klassen und bietet
 * Hilfsfunktionen zur Initialisierung des Service-Layers.
 */

import { LocalStorageRepository } from '~/repositories/LocalStorageRepository';

import { CategoryService } from './CategoryService';
import { ItemService } from './ItemService';
import { ShoppingListService } from './ShoppingListService';

import type { IStorageRepository } from '~/repositories/StorageRepository';

// Service-Instanzen
let storageRepository: IStorageRepository | null = null;
let shoppingListService: ShoppingListService | null = null;
let itemService: ItemService | null = null;
let categoryService: CategoryService | null = null;

/**
 * Initialisiert alle Services mit den erforderlichen Abhängigkeiten
 * @returns Ein Objekt mit allen Service-Instanzen
 */
export function initializeServices(): {
  storageRepository: IStorageRepository;
  shoppingListService: ShoppingListService;
  itemService: ItemService;
  categoryService: CategoryService;
} {
  // Repository erstellen, falls nicht vorhanden
  if (!storageRepository) {
    storageRepository = new LocalStorageRepository();
  }

  // ShoppingListService erstellen, falls nicht vorhanden
  if (!shoppingListService) {
    shoppingListService = new ShoppingListService(storageRepository);
  }

  // ItemService erstellen, falls nicht vorhanden
  if (!itemService) {
    itemService = new ItemService(shoppingListService);
  }

  // CategoryService erstellen, falls nicht vorhanden
  if (!categoryService) {
    categoryService = new CategoryService(storageRepository);
  }

  return {
    storageRepository,
    shoppingListService,
    itemService,
    categoryService,
  };
}

// Re-Export aller Services
export { ShoppingListService } from './ShoppingListService';
export { ItemService } from './ItemService';
export { CategoryService } from './CategoryService';
export { BaseService } from './base/BaseService';
