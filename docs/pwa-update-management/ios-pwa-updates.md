# PWA Updates auf iOS-Geräten

Die Shopping-List-App als Progressive Web App (PWA) implementiert besondere Maßnahmen, um Updates auch auf iOS-Geräten zuverlässig bereitzustellen.

## Die Herausforderung von PWAs auf iOS

PWAs auf iOS (besonders solche, die zum Homescreen hinzugefügt wurden) haben einige einzigartige Eigenschaften, die Updates erschweren:

1. **Eingeschränkter Service Worker-Lebenszyklus**: iOS-Safari hat eine andere Implementierung des Service Worker-Lebenszyklus als Chrome oder Firefox.

2. **Aggressive Caching-Strategie**: iOS/Safari hat ein sehr aggressives Caching von PWA-Ressourcen.

3. **"Gestault"-Verhalten**: Zum Homescreen hinzugefügte Apps werden bei der Installation quasi "eingefroren" und aktualisieren sich nicht automatisch.

4. **Session-Management**: Der App-Zustand wird bei Hintergrundausführung nicht immer korrekt beibehalten.

## Implementierte Lösungen

### 1. Spezialisierte Update-Erkennung

```typescript
// Regelmäßige Cache-Invalidierung (alle 24 Stunden)
if (now - lastCheck > 24 * 60 * 60 * 1000) {
  localStorage.setItem(LAST_CHECK_KEY, now.toString())
  
  // Für iOS: Hard Reload bei längerem Nichtbenutzen der App
  if (isIOS() && isStandalone()) {
    console.log('Regelmäßige Cache-Invalidierung für iOS PWA...')
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
}
```

### 2. Spezielles Reload-Verfahren für iOS

```typescript
// Für iOS: Hard-Reload verwenden mit Cache-Busting
if (isIOS()) {
  window.location.href = window.location.href.split('#')[0] + 
    '?t=' + Date.now() + 
    (window.location.hash || '')
} else {
  window.location.reload()
}
```

### 3. Regelmäßige Service Worker-Updates

```typescript
// Für iOS: Service Worker regelmäßig neu registrieren
if (isIOS() && isStandalone()) {
  setInterval(() => {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.update()
      }
    })
  }, 1000 * 60 * 60) // Stündlich
}
```

### 4. Geänderte Cache-Strategien

In der `nuxt.config.ts` wurden die Cache-Strategien für iOS optimiert:

```javascript
// Von StaleWhileRevalidate zu NetworkFirst geändert
{
  urlPattern: /\.(?:js|css)$/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'static-resources',
    expiration: {
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 // 1 Tag
    }
  }
}
```

### 5. Cache-Kontrolle über HTTP-Header

```javascript
// Vite Server Headers
server: {
  headers: {
    'Service-Worker-Allowed': '/',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}
```

### 6. Meta-Tags für Cache-Kontrolle

```javascript
meta: [
  // Cache-Control Meta-Tags für iOS
  { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
  { 'http-equiv': 'Pragma', content: 'no-cache' },
  { 'http-equiv': 'Expires', content: '0' },
]
```

## Testen der App auf verschiedenen Ports

Um die Update-Funktion zu testen, haben wir einen alternativen Port konfiguriert:

```javascript
// Server-Konfiguration
server: {
  port: 3030, // Alternativer Port zum Testen
}
```

Dies ermöglicht:
1. Vergleichstests zwischen der alten und neuen Version
2. Einfaches Testen auf iOS-Geräten ohne Konflikte mit der installierten Version

## Empfehlungen für iOS-Benutzer

Für optimale Erfahrung mit PWAs auf iOS:

1. **Regelmäßig schließen und neu öffnen**: Schließen Sie die App vollständig (aus dem App-Switcher) und öffnen Sie sie neu, um Updates zu erhalten.

2. **Safari-Cache leeren**: Gehen Sie zu Einstellungen → Safari → Erweitert → Website-Daten → Alle Website-Daten löschen.

3. **App neu installieren**: In extremen Fällen kann es hilfreich sein, die PWA vom Homescreen zu entfernen und neu zu installieren.

4. **Browser-Version nutzen**: Die Browser-Version der App wird häufiger aktualisiert als die Homescreen-Version.
