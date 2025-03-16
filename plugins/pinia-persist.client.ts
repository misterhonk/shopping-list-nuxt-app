import { defineNuxtPlugin } from '#app';

/**
 * Plugin für die Persistenz von Pinia-Stores
 * Dieser Plugin wird nicht mehr benötigt, da wir jetzt direkt localStorage
 * in der Vue-Komponente verwenden ohne Pinia
 * 
 * Bleibt für historische Zwecke erhalten
 */
export default defineNuxtPlugin(() => {
  // Leerer Plugin
  return {};
});
