import { ref, onMounted } from 'vue';
import { useLocalStorage } from '~/composables/core/useLocalStorage';

import type { Ref } from 'vue';

// LocalStorage-Schlüssel für Dark Mode
const DARK_MODE_STORAGE_KEY = 'darkMode';

/**
 * Composable für die Verwaltung des Dark Mode
 * Bietet Funktionen zum Ein-/Ausschalten des dunklen Erscheinungsbilds
 */
export const useDarkMode = () => {
  const isDark: Ref<boolean> = ref(false);
  const { saveToStorage, loadFromStorage, removeFromStorage } = useLocalStorage();

  /**
   * Aktualisiert das DOM basierend auf dem Dark Mode-Status
   * @param value - Dark Mode Status
   */
  const updateDOMDarkMode = (value: boolean): void => {
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  /**
   * Schaltet zwischen hellem und dunklem Modus um
   */
  const toggleDarkMode = (): void => {
    isDark.value = !isDark.value;
    updateDOMDarkMode(isDark.value);
    saveToStorage(DARK_MODE_STORAGE_KEY, isDark.value ? 'dark' : 'light');
  };

  /**
   * Setzt den Dark Mode auf einen bestimmten Wert
   * @param value - true für dunklen Modus, false für hellen Modus
   */
  const setDarkMode = (value: boolean): void => {
    if (isDark.value !== value) {
      isDark.value = value;
      updateDOMDarkMode(isDark.value);
      saveToStorage(DARK_MODE_STORAGE_KEY, isDark.value ? 'dark' : 'light');
    }
  };

  /**
   * Folgt der Systempräferenz für den Dunkelmodus
   */
  const followSystemPreference = (): void => {
    const prefersDark = systemPrefersDarkMode();
    setDarkMode(prefersDark);
    removeFromStorage(DARK_MODE_STORAGE_KEY); // Entfernt gespeicherte Präferenz
  };

  /**
   * Prüft, ob das System Dark Mode bevorzugt
   * @returns true wenn das System Dark Mode bevorzugt, sonst false
   */
  const systemPrefersDarkMode = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  /**
   * Initialisiert den Dark Mode basierend auf gespeicherten Einstellungen oder Systemeinstellungen
   */
  const initializeDarkMode = (): void => {
    const savedTheme = loadFromStorage<string>(DARK_MODE_STORAGE_KEY);

    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      // Alternativ: System-Präferenz prüfen
      isDark.value = systemPrefersDarkMode();
    }

    // Initial setzen
    updateDOMDarkMode(isDark.value);
    
    // Event-Listener für Systemänderungen einrichten
    setupSystemPreferenceListener();
  };
  
  /**
   * Richtet einen Event-Listener für Änderungen der Systemeinstellung ein
   */
  const setupSystemPreferenceListener = (): void => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Änderungen der Systempräferenz überwachen, wenn keine gespeicherte Einstellung
    const handleSystemDarkModeChange = (event: MediaQueryListEvent): void => {
      if (!loadFromStorage<string>(DARK_MODE_STORAGE_KEY)) {
        updateDOMDarkMode(event.matches);
        isDark.value = event.matches;
      }
    };

    // Event-Listener hinzufügen
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleSystemDarkModeChange);
    } else {
      // Fallback für ältere Browser
      darkModeMediaQuery.addListener(handleSystemDarkModeChange);
    }
  };

  // Initiale Einstellung aus localStorage oder System-Präferenz laden
  onMounted(() => {
    initializeDarkMode();
  });

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    followSystemPreference,
    systemPrefersDarkMode,
    initializeDarkMode,
  };
};
