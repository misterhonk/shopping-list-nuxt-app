import { ref, onMounted } from 'vue';

export const useDarkMode = () => {
  const isDark = ref(false);

  const toggleDarkMode = () => {
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
    toggleDarkMode
  };
};