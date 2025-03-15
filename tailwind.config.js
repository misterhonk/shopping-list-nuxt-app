/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  darkMode: 'class', // oder 'media' für automatische Erkennung der Systemeinstellung
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#3B82F6', // blau
          surface: '#1F2937', // dunkelgrau für Karten
          background: '#111827', // noch dunklerer Hintergrund
          text: {
            primary: '#F9FAFB', // helles weiß für Haupttext
            secondary: '#9CA3AF', // grau für Sekundärtext
          },
          border: '#374151' // dunkelgrau für Ränder
        }
      }
    },
  },
  plugins: [],
}