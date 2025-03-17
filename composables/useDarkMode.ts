import { ref, onMounted } from 'vue';

import type { Ref } from 'vue';
/**
 * Composable für die Verwaltung des Dark Mode
 * Bietet Funktionen zum Ein-/Ausschalten des dunklen Erscheinungsbilds
 */
export const useDarkMode = () => {
  const isDark: Ref<boolean> = ref(false);

  /**
   * Schaltet zwischen hellem und dunklem Modus um
   */
  const toggleDarkMode = (): void => {
    isDark.value = !isDark.value;

    // DOM aktualisieren
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Speichern der Präferenz im localStorage
    localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light');
  };

  /**
   * Setzt den Dark Mode auf einen bestimmten Wert
   * @param value - true für dunklen Modus, false für hellen Modus
   */
  const setDarkMode = (value: boolean): void => {
    if (isDark.value !== value) {
      isDark.value = value;

      // DOM aktualisieren
      if (isDark.value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Speichern der Präferenz
      localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light');
    }
  };

  /**
   * Folgt der Systempräferenz für den Dunkelmodus
   */
  const followSystemPreference = (): void => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    localStorage.removeItem('darkMode'); // Entfernt gespeicherte Präferenz
  };

  // Initiale Einstellung aus localStorage oder System-Präferenz laden
  onMounted(() => {
    const savedTheme = localStorage.getItem('darkMode');

    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      // Alternativ: System-Präferenz prüfen
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Initial setzen
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    }
  });

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    followSystemPreference,
  };
};
