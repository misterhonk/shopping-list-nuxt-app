export default defineNuxtPlugin(() => {
  // Dark Mode beim ersten Laden der Seite initialisieren
  if (process.client) {
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme === 'dark' || 
       (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }
});