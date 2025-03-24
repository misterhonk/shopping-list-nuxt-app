<template>
  <div>
    <PageHeader title="Statistiken & Ausgaben">
      <template #actions>
        <NuxtLink to="/" class="btn btn-secondary">
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Zurück
          </span>
        </NuxtLink>
      </template>
    </PageHeader>

    <!-- Ausgabenübersicht für die aktuelle Liste -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Aktuelle Liste: {{ currentList.name }}
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Gesamtbetrag</h3>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ formatCurrency(totalAmount) }}
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Durchschnitt pro Artikel
          </h3>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ formatCurrency(averageItemPrice) }}
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Teuerster Artikel</h3>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ mostExpensiveItem?.name ?? '-' }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ mostExpensiveItem ? formatCurrency(mostExpensiveItem.price) : '-' }}
          </p>
        </div>

        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Anzahl Artikel</h3>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ itemsWithPrice }} / {{ totalItems }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">mit Preisangabe</p>
        </div>
      </div>

      <!-- Ausgaben nach Kategorien -->
      <h3 class="text-lg font-bold mb-3 text-gray-800 dark:text-white">Ausgaben nach Kategorie</h3>
      <div v-if="categoryExpenses.length > 0" class="relative pt-1 mb-6">
        <div class="flex mb-2 items-center justify-between">
          <div>
            <span
              class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
            >
              Kategorieverteilung
            </span>
          </div>
        </div>
        <div class="flex h-4 mb-4 overflow-hidden bg-gray-200 dark:bg-gray-600 rounded">
          <div
            v-for="category in categoryExpenses"
            :key="category.id"
            :style="{ width: `${category.percentage}%` }"
            :class="getCategoryColor(category.id)"
            class="flex flex-col justify-center text-xs text-center text-white"
          ></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <div v-for="category in categoryExpenses" :key="category.id" class="flex items-center">
            <div :class="`w-3 h-3 rounded-full mr-2 ${getCategoryColor(category.id)}`"></div>
            <span class="text-xs text-gray-600 dark:text-gray-300"
              >{{ category.name }}: {{ formatCurrency(category.amount) }} ({{
                category.percentage.toFixed(1)
              }}%)</span
            >
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Fügen Sie Preise zu Ihren Artikeln hinzu, um die Verteilung nach Kategorien zu sehen.</p>
      </div>
    </div>

    <!-- Einkaufshistorie -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Einkaufshistorie</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-2">
        Zusammenfassung Ihrer letzten Einkaufslisten
      </p>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Liste
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Datum
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Artikel
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Gesamtbetrag
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="shoppingHistory.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                Keine Einkaufshistorie verfügbar. Alle Ihre abgeschlossenen Einkaufslisten werden
                hier angezeigt.
              </td>
            </tr>
            <tr
              v-for="history in shoppingHistory"
              :key="history.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ history.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(history.date) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ history.itemCount }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatCurrency(history.totalAmount) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import PageHeader from '~/components/layout/PageHeader.vue';
import { useShoppingItems } from '~/composables/useShoppingItems';
import { useShoppingLists } from '~/composables/useShoppingLists';

import type { ShoppingItem } from '~/types/app-types';

// Schnittstelle für Kategorie-Ausgaben
interface ICategoryExpense {
  id: string;
  name: string;
  amount: number;
  percentage: number;
}

// Schnittstelle für Einkaufshistorie
interface IShoppingHistoryItem {
  id: string;
  name: string;
  date: number;
  itemCount: number;
  totalAmount: number;
}

// Listen-Management
const { lists, currentListId, currentList } = useShoppingLists();

// Artikel-Management
const { allItems } = useShoppingItems(lists, currentListId);

// Berechnete Eigenschaften
const totalItems = computed<number>(() => allItems.value.length ?? 0);

// Ermittle Artikel mit Preisen
const itemsWithPrice = computed<number>(
  () => allItems.value.filter(item => item.price && item.price > 0).length ?? 0
);

// Gesamtbetrag
const totalAmount = computed<number>(() =>
  allItems.value.reduce((total, item) => total + (item.price ?? 0) * (item.quantity ?? 1), 0)
);

// Durchschnitt pro Artikel
const averageItemPrice = computed<number>(() => {
  if (itemsWithPrice.value === 0) {
    return 0;
  }
  const total = allItems.value.reduce((sum, item) => sum + (item.price ?? 0), 0);
  return total / itemsWithPrice.value;
});

// Teuerster Artikel
const mostExpensiveItem = computed<ShoppingItem | null>(() => {
  if (allItems.value.length === 0) {
    return null;
  }

  return [...allItems.value]
    .filter(item => item.price && item.price > 0)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))[0];
});

// Ausgaben nach Kategorien
const categoryExpenses = computed<CategoryExpense[]>(() => {
  if (allItems.value.length === 0) {
    return [];
  }

  const categories: Record<string, CategoryExpense> = {};

  allItems.value.forEach(item => {
    if (!item.price || item.price <= 0) {
      return;
    }

    const categoryId = typeof item.category === 'object' ? item.category.id : 'sonstiges';
    const categoryName =
      typeof item.category === 'object' ? item.category.name : (item.category ?? 'Sonstiges');
    const itemAmount = (item.price ?? 0) * (item.quantity ?? 1);

    if (!categories[categoryId]) {
      categories[categoryId] = {
        id: categoryId,
        name: categoryName,
        amount: 0,
        percentage: 0,
      };
    }

    categories[categoryId].amount += itemAmount;
  });

  // Prozentsätze berechnen
  const result = Object.values(categories);
  result.forEach(cat => {
    cat.percentage = totalAmount.value > 0 ? (cat.amount / totalAmount.value) * 100 : 0;
  });

  return result.sort((a, b) => b.amount - a.amount);
});

// Mock für die Einkaufshistorie (später zu implementieren)
const shoppingHistory = ref<ShoppingHistoryItem[]>([]);

// Hilfsfunktionen
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (date: number): string =>
  new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const getCategoryColor = (categoryId: string): string => {
  const colors: Record<string, string> = {
    obst_gemuese: 'bg-green-500',
    fleisch_fisch: 'bg-red-500',
    backwaren: 'bg-yellow-500',
    milchprodukte: 'bg-blue-500',
    getraenke: 'bg-purple-500',
    tiefkuehlwaren: 'bg-cyan-500',
    konserven: 'bg-gray-500',
    grundnahrungsmittel: 'bg-orange-500',
    snacks_suessigkeiten: 'bg-pink-500',
    sonstiges: 'bg-gray-400',
  };

  // Prefix prüfen und entfernen (für IDs mit Timestamp)
  const baseId = categoryId.split('_').slice(0, -1).join('_');

  if (colors[categoryId]) {
    return colors[categoryId];
  }
  if (colors[baseId]) {
    return colors[baseId];
  }

  // Wenn keine Übereinstimmung gefunden wird, eine Farbe basierend auf dem String generieren
  const hash = Array.from(categoryId).reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
    0
  );

  // Konvertieren zu einer von 10 Farben
  const index = Math.abs(hash % 10);
  const colorClasses = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-gray-500',
    'bg-orange-500',
    'bg-teal-500',
  ];

  return colorClasses[index];
};

// Laden der Daten
onMounted(() => {
  // Hier könnten wir später die Einkaufshistorie laden, wenn wir sie implementieren
});
</script>
