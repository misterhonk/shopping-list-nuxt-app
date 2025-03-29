import type { Category } from '~/types/app-types';

/**
 * Typdefinitionen für die Migration
 */
interface ILegacyItem {
  id?: string;
  name?: string;
  quantity?: number;
  category?: string | Category;
  checked?: boolean;
  price?: number;
  note?: string;
  addedAt?: number;
  modifiedAt?: number;
}

interface ILegacyList {
  id?: string;
  name?: string;
  items?: IILegacyItem[];
  templateId?: string;
  isFavorite?: boolean;
  createdAt?: number;
  modifiedAt?: number;
}

/**
 * Migriert alte Kategorien-Strings zu Kategorie-Objekten
 * @param items - Die zu migrierenden Artikel
 * @param categoriesMap - Eine Map von Kategorienamen zu Kategorien-Objekten
 * @returns Die migrierten Artikel
 */
export const migrateCategoriesToObjects = (
  items: IIShoppingItem[],
  categoriesMap: Record<string, Category>
): IIShoppingItem[] =>
  items.map(item => {
    // Wenn die Kategorie bereits ein Objekt ist, behalten wir sie bei
    if (typeof item.category === 'object') {
      return item;
    }

    // Ansonsten konvertieren wir den String in ein Objekt
    const categoryName = item.category;
    const category = categoriesMap[categoryName] || {
      id: `category_${categoryName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      name: categoryName,
    };

    return {
      ...item,
      category,
    } as const;
  });

/**
 * Migriert alte ShoppingList-Objekte zu neuen
 * @param lists - Die zu migrierenden Listen
 * @returns Die migrierten Listen
 */
export const migrateShoppingLists = (lists: IILegacyList[]): IIShoppingList[] =>
  lists.map(list => ({
    id: list.id ?? `list_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: list.name ?? 'Unbenannte Liste',
    items: Array.isArray(list.items) ? list.items : [],
    templateId: list.templateId ?? 'supermarket',
    isFavorite: !!list.isFavorite,
    createdAt: list.createdAt ?? Date.now(),
    modifiedAt: list.modifiedAt ?? Date.now(),
  }));

/**
 * Prüft, ob ein String ein gültiges JSON enthält
 * @param str - Der zu prüfende String
 * @returns true, wenn der String ein gültiges JSON enthält, sonst false
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Migriert alte Listen-Formate zu neuen
 * @param lists - Die zu migrierenden Listen
 * @returns Die migrierten Listen
 */
export const migrateLists = (lists: IILegacyList[]): IIShoppingList[] => {
  if (!Array.isArray(lists)) {
    return [];
  }

  return lists.map(list => {
    // Stelle sicher, dass die Liste die notwendigen Eigenschaften hat
    const migratedList: IShoppingList = {
      id: list.id ?? `list_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: list.name ?? 'Unbenannte Liste',
      items: [],
      templateId: list.templateId ?? 'supermarket',
      isFavorite: !!list.isFavorite,
      createdAt: list.createdAt ?? Date.now(),
      modifiedAt: list.modifiedAt ?? Date.now(),
    };

    // Migriere die Items, falls vorhanden
    if (Array.isArray(list.items)) {
      migratedList.items = list.items.map((item: ILegacyItem) => ({
        id: item.id ?? `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: item.name ?? 'Unbenannter Artikel',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        category: item.category ?? 'Sonstiges',
        checked: !!item.checked,
        price: typeof item.price === 'number' ? item.price : 0,
        note: item.note ?? '',
        addedAt: item.addedAt ?? Date.now(),
        modifiedAt: item.modifiedAt ?? Date.now(),
      }));
    }

    return migratedList;
  });
};

/**
 * Überprüft, ob eine Liste dem erwarteten Format entspricht
 * @param list - Die zu prüfende Liste
 * @returns true, wenn die Liste gültig ist, sonst false
 */
export const validateList = (list: unknown): boolean => {
  if (!list || typeof list !== 'object') {
    return false;
  }

  // Type-Cast zu ILegacyList
  const typedList = list as ILegacyList;

  // Prüfe, ob die Liste die notwendigen Eigenschaften hat
  if (!typedList.id || typeof typedList.name !== 'string' || !Array.isArray(typedList.items)) {
    return false;
  }

  // Prüfe die Items
  for (const item of typedList.items ?? []) {
    if (!item.id || typeof item.name !== 'string' || typeof item.quantity !== 'number') {
      return false;
    }
  }

  return true;
};
