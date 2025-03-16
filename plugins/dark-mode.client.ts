import { defineNuxtPlugin } from '#app';

/**
 * Plugin für die Initialisierung des Dark Mode
 * Wird nur auf dem Client ausgeführt (.client.ts)
 */
export default defineNuxtPlugin(() => {
  // Dark Mode beim ersten Laden der Seite initialisieren
  if (process.client) {
    const savedTheme = localStorage.getItem('darkMode');
    
    // Dark Mode aktivieren, wenn gespeichert oder Systempräferenz
    if (savedTheme === 'dark' || 
       (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
    
    // Event-Listener für Systemänderungen
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Änderungen der Systempräferenz überwachen, wenn keine gespeicherte Einstellung
    const handleSystemDarkModeChange = (event: MediaQueryListEvent): void => {
      if (!localStorage.getItem('darkMode')) {
        if (event.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    // Event-Listener hinzufügen
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleSystemDarkModeChange);
    } else {
      // Fallback für ältere Browser
      darkModeMediaQuery.addListener(handleSystemDarkModeChange);
    }
  }
});
