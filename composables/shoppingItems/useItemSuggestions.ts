import { ref, computed, watch } from 'vue';

import { createLogger } from '~/utils/logger';

import type { Ref, ComputedRef } from 'vue';
import type { ShoppingList, ShoppingItem } from '~/types/app-types';

// Logger initialisieren
const _logger = createLogger('useItemSuggestions');

interface ItemHistoryEntry {
  count: number;
  lastUsed: string | null;
  categories: Record<string, number>;
  prices: { price: number; date: string }[];
}

interface ItemSuggestion {
  text: string;
  subtext?: string;
  count?: number;
  lastUsed?: string;
  mostCommonCategory?: string;
  avgPrice?: number;
}

// Definieren der Return-Type für useItemSuggestions
interface ItemSuggestionsComposable {
  itemHistory: Ref<Record<string, ItemHistoryEntry>>;
  getSuggestions: (term?: string) => IItemSuggestion[];
  addToHistory: (item: IShoppingItem) => void;
  initializeHistory: () => void;
  historyStats: ComputedRef<{ uniqueItems: number; totalEntries: number; averageUsage: number }>;
}

/**
 * Composable für Artikelvorschläge basierend auf vergangenen Einkäufen
 */
export function useItemSuggestions(listRef: { value: IIShoppingList[] }): ItemSuggestionsComposable {
  // Lokaler Speicher für die Artikelhistorie
  const getItem = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      _logger.error(`Fehler beim Lesen von ${key}:`, error);
      return null;
    }
  };

  const setItem = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      _logger.error(`Fehler beim Speichern von ${key}:`, error);
    }
  };

  // Artikelhistorie aus dem lokalen Speicher laden
  const loadItemHistory = (): Record<string, ItemHistoryEntry> => {
    try {
      const storedHistory = getItem('itemHistory');
      return storedHistory ? JSON.parse(storedHistory) : {};
    } catch (error) {
      _logger.error('Fehler beim Laden der Artikelhistorie:', error);
      return {} as const;
    }
  };

  // Artikelhistorie im lokalen Speicher speichern
  const saveItemHistory = (history: Record<string, ItemHistoryEntry>): void => {
    try {
      setItem('itemHistory', JSON.stringify(history));
    } catch (error) {
      _logger.error('Fehler beim Speichern der Artikelhistorie:', error);
    }
  };

  // Artikelhistorie initialisieren
  const itemHistory = ref<Record<string, ItemHistoryEntry>>(loadItemHistory());

  // Artikel zur Historie hinzufügen
  const addToHistory = (item: IShoppingItem): void => {
    if (!item.name) {
      return;
    }

    const normalizedName = item.name.toLowerCase().trim();
    const now = new Date().toISOString();

    // Existierende Daten für diesen Artikel aktualisieren oder neuen Eintrag erstellen
    const existingItem = itemHistory.value[normalizedName] || {
      count: 0,
      lastUsed: null,
      categories: {},
      prices: [],
    };

    // Daten aktualisieren
    existingItem.count += 1;
    existingItem.lastUsed = now;

    // Kategorie zählen
    let categoryId: string = 'sonstiges';

    if (item.category) {
      if (typeof item.category === 'string') {
        categoryId = item.category;
      } else if (typeof item.category === 'object' && item.category.id) {
        categoryId = item.category.id;
      }
    }
    existingItem.categories[categoryId] = (existingItem.categories[categoryId] || 0) + 1;

    // Preis hinzufügen, wenn vorhanden
    if (item.price && item.price > 0) {
      existingItem.prices.push({
        price: item.price,
        date: now,
      });

      // Maximal 10 Preise pro Artikel speichern
      if (existingItem.prices.length > 10) {
        existingItem.prices = existingItem.prices.slice(-10);
      }
    }

    // Aktualisierte Daten speichern
    itemHistory.value[normalizedName] = existingItem;
    saveItemHistory(itemHistory.value);
  };

  /**
   * Ermittelt die häufigste Kategorie für einen Artikel
   */
  const getMostCommonCategory = (categories: Record<string, number>): string | null => {
    let mostCommonCategory: string | null = null;
    let maxCount = 0;

    for (const [categoryId, count] of Object.entries(categories)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonCategory = categoryId;
      }
    }

    return mostCommonCategory;
  };

  /**
   * Berechnet den Durchschnittspreis eines Artikels
   */
  const calculateAveragePrice = (prices: { price: number; date: string }[]): number => {
    if (!prices || prices.length === 0) {
      return 0;
    }

    const sum = prices.reduce((acc, curr) => acc + curr.price, 0);
    return sum / prices.length;
  };

  // Vorschläge basierend auf der Historie generieren
  const getSuggestions = (term = ''): IIItemSuggestion[] => {
    if (!term) {
      return [];
    }

    const normalizedTerm = term.toLowerCase().trim();
    const results: IIItemSuggestion[] = [];

    // Durch die Historie iterieren und passende Einträge finden
    for (const [itemName, data] of Object.entries(itemHistory.value)) {
      if (itemName.includes(normalizedTerm)) {
        // Häufigste Kategorie und Durchschnittspreis ermitteln
        const mostCommonCategory = getMostCommonCategory(data.categories);
        const avgPrice = calculateAveragePrice(data.prices);

        // Ergebnis hinzufügen
        results.push({
          text: itemName,
          subtext: avgPrice > 0 ? `~${avgPrice.toFixed(2)} €` : '',
          count: data.count,
          lastUsed: data.lastUsed,
          mostCommonCategory: mostCommonCategory ?? undefined,
          avgPrice,
        });
      }
    }

    // Nach Häufigkeit und letzter Verwendung sortieren
    return results.sort((a, b) => {
      // Primär nach Häufigkeit
      if (b.count !== a.count) {
        return (b.count ?? 0) - (a.count ?? 0);
      }
      // Sekundär nach letzter Verwendung
      if (a.lastUsed && b.lastUsed) {
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      }
      return 0;
    });
  };

  // Aktualisierte Artikel zur Historie hinzufügen
  const updateHistoryFromLists = (lists: IIShoppingList[]): void => {
    if (!lists || !Array.isArray(lists)) {
      return;
    }

    lists.forEach(list => {
      if (list.items && Array.isArray(list.items)) {
        list.items.forEach((item: IShoppingItem) => {
          if (item.name) {
            addToHistory(item);
          }
        });
      }
    });
  };

  // Artikelhistorie automatisch aktualisieren, wenn sich Listen ändern
  watch(
    () => listRef.value,
    newLists => {
      if (newLists && Array.isArray(newLists)) {
        updateHistoryFromLists(newLists);
      }
    },
    { deep: true }
  );

  // Initialisierung der Artikelhistorie
  const initializeHistory = (): void => {
    if (listRef.value && Array.isArray(listRef.value)) {
      updateHistoryFromLists(listRef.value);
    }
  };

  // Statistik für Debug-Zwecke
  const historyStats = computed(() => {
    const itemCount = Object.keys(itemHistory.value).length;
    const totalEntries = Object.values(itemHistory.value).reduce(
      (sum, item) => sum + item.count,
      0
    );

    return {
      uniqueItems: itemCount,
      totalEntries,
      averageUsage: itemCount > 0 ? totalEntries / itemCount : 0,
    } as const;
  });

  return {
    itemHistory,
    getSuggestions,
    addToHistory,
    initializeHistory,
    historyStats,
  } as const;
}
