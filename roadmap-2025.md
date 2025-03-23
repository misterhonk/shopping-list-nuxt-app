# Shopping List App - Roadmap 2025-2026

## ✅ Abgeschlossene Meilensteine

### Refactoring Phase 1 (Q1 2025)

- ✅ **Aufräumen und Optimieren**
  - ✅ Tote Code-Teile entfernen
  - ✅ TypeScript-Integration verbessert
  - ✅ Codekommentare verbessert
  - ✅ CSS-Stile bereinigt
  - ✅ Import-Pfade optimiert
  - ✅ Relative Imports auf Nuxt-Aliase umgestellt
  - ✅ Duplizierte Import/Export-Funktionalität konsolidiert

### Refactoring Phase 2 (Q1 2025)

- ✅ **Architektur**
  - ✅ Service-orientierte Architektur eingeführt
  - ✅ Repository-Pattern implementiert
  - ✅ UI-Logik von Geschäftslogik getrennt
  - ✅ TypeScript strenger konfiguriert
  - ✅ Interfaces für alle Datenstrukturen definiert
  - ✅ Komplexe Funktionen vereinfacht

### DevOps & Deployment (Q1 2025)

- ✅ **Docker-Setup**
  - ✅ Multi-Stage-Build konfiguriert
  - ✅ Multi-Environment-Setup mit .env-Dateien
  - ✅ Docker-Compose für parallele Instanzen
  - ✅ Traefik-Integration für Reverse-Proxy und SSL

### Qualitätssicherung

- ✅ **Tooling**
  - ✅ ESLint-Regeln optimiert
  - ✅ Prettier für Formatierung eingerichtet
  - ✅ Husky für Pre-Commit-Hooks konfiguriert
- ✅ **Monitoring**
  - ✅ Strukturiertes Logging-System implementiert
  - ✅ Konsolenausgaben durch strukturiertes Logging ersetzt

### UI/UX (teilweise vorgezogen aus Q2-Q3 2025)

- ✅ **UI-Optimierungen**
  - ✅ Kompakterer Header mit Einkaufswagen-Icon
  - ✅ Horizontales, scrollbares Tab-System für Listen
  - ✅ Direkte Artikeleingabe mit optionalen Details
  - ✅ Konsistente Farbgebung für Aktions-Buttons
  - ✅ Verbesserte Checkbox-Funktionalität mit visuellen Effekten
  - ✅ Touchgesten optimiert (Swipe für Listenelemente)

### Artikelmanagement (teilweise vorgezogen)

- ✅ **Kategorie-Verwaltung**
  - ✅ Laufweg-Sortierung für Kategorien implementiert
  - ✅ Drag & Drop für Kategoriesortierung
  - ✅ Standardsortierung nach Markttyp
  - ✅ Option zum Wechseln zwischen Standard und benutzerdefinierter Sortierung

### PWA Verbesserungen (vorgezogen)

- ✅ **PWA-Update-Mechanismus**
  - ✅ Service Worker Optimierung mit skipWaiting und clientsClaim
  - ✅ Cache-Strategien verbessert (NetworkFirst statt StaleWhileRevalidate)
  - ✅ Zentrale Versionsverwaltung implementiert
  - ✅ Update-Benachrichtigungen für Benutzer
  - ✅ iOS-spezifische Verbesserungen für Homescreen-Apps

## 🚀 Geplante Meilensteine

### Milestone 1: Basis-Funktionalitäten Erweitern (Q2 2025)

- 🔄 **Preisverfolgung** (Sprint 1-2)

  - [ ] Preiseingabe bei Artikelerfassung implementieren
  - [ ] Preishistorie pro Artikel speichern
  - [ ] Gesamtsumme der Einkaufsliste berechnen und anzeigen

- 🔄 **Artikelmanagement** (Sprint 3)
  - [ ] Detaillierte Artikelbeschreibungen (Größe, Marke, etc.)
  - ✅ Verbessertes Kategorie-Management
  - ✅ Schnellere Artikelerfassung

### Milestone 2: Datenanalyse & Visualisierung (Q3 2025)

- 🔄 **Statistik-Dashboard** (Sprint 4-5)

  - [ ] Basisstatistiken implementieren (Gesamtausgaben, Durchschnittskosten)
  - [ ] Statistik nach Kategorien (Ausgaben pro Kategorie)
  - [ ] Visualisierung mit Diagrammen (Balken-, Linien-, Kreisdiagramme)

- 🔄 **Preisvergleich** (Sprint 6)
  - [ ] Preisvergleich zwischen verschiedenen Märkten
  - [ ] Funktion zur Anzeige des günstigsten Preises eines Artikels
  - [ ] Top-5-Listen (teuerste Artikel, häufigste Artikel)

### Milestone 3: Kollaboration & Integration (Q4 2025)

- 🔄 **Sharing & Kollaboration** (Sprint 7-8)

  - [ ] Listen teilen via Link oder QR-Code
  - [ ] Echtzeit-Kollaboration für gemeinsame Listen
  - [ ] Aktivitätsprotokoll für gemeinsame Listen

- 🔄 **Backend-Integration** (Sprint 9-10)
  - [ ] Cloud-Speicherung implementieren
  - [ ] Benutzerkonten einrichten
  - [ ] Datensynchronisation zwischen Geräten

### Milestone 4: Planung & Organisation (Q1 2026)

- 🔄 **Einkaufsplanung** (Sprint 11-12)

  - ✅ Sortierung der Artikel nach optimaler Einkaufsroute
  - [ ] Wiederholungseinkäufe planen (wöchentlich, monatlich)
  - [ ] Erinnerungen für geplante Einkäufe

- 🔄 **Budgetierung** (Sprint 13)
  - [ ] Budgetplanung mit Preiswarnung implementieren
  - [ ] Budget-Tracking über Zeit
  - [ ] Exportfunktion für Preisdaten als CSV

### Milestone 5: Erweitertes Feature-Set (Q2 2026)

- 🔄 **Rezepteintegration** (Sprint 14-15)

  - [ ] Rezeptverwaltung implementieren
  - [ ] Automatische Einkaufsliste aus Rezept generieren
  - [ ] Rezeptsuche und -vorschläge

- 🔄 **Erweiterte Artikelerkennung** (Sprint 16)
  - [ ] Barcodes scannen und speichern
  - [ ] Bilderkennung für Artikel
  - [ ] Alternativvorschläge für Artikel

## 🧪 Kontinuierliche Verbesserungen

### 🎨 UI/UX

#### Kurzfristige Ziele (Q2-Q3 2025)

- ✅ Design-Audit durchführen
- ✅ Konsistentes Farbschema optimieren
- ✅ Touchgesten optimieren (Swipe, Drag & Drop)
- [ ] Leerstaaten (empty states) für alle Ansichten gestalten

#### Mittelfristige Ziele (Q3 2025-Q1 2026)

- [ ] Micro-Animationen für Feedback hinzufügen
- ✅ Bottom-Navigation für mobile Geräte optimieren
- [ ] Onboarding für Neulinge implementieren
- [ ] Tooltips und Hilfetexte hinzufügen

#### Langfristige Ziele (Q2-Q4 2026)

- [ ] Vollständiger Audit zur Barrierefreiheit (WCAG 2.1)
- [ ] Tablet- und Desktop-Layout optimieren
- [ ] Nutzerführung (Guided Tour) für neue Features
- [ ] Druckfreundliche Ansicht für Listen

### 👨‍💻 Code-Qualität

#### Kurzfristige Ziele (Q2-Q3 2025)

- [ ] Unit-Tests für kritische Funktionen schreiben
- [ ] Automatisierte Tests in CI integrieren
- [ ] Code-Review-Prozess etablieren
- ✅ TypeScript strict mode feinjustieren
- ✅ commitlint für Commit-Message-Validierung
- ✅ GitHub Actions CI-Workflow

#### Mittelfristige Ziele (Q3 2025-Q1 2026)

- [ ] End-to-End-Tests implementieren
- [ ] Performance-Tests einrichten
- [ ] Bundle-Größe reduzieren
- [ ] CI/CD-Pipeline verfeinern
- [ ] Docker-Compose für lokale Entwicklung
- [ ] Erweiterte Commit-Validierung mit Release-Notes

#### Langfristige Ziele (Q2-Q4 2026)

- [ ] A11y-Tests automatisieren
- [ ] Performance-Monitoring einrichten
- [ ] Integrationstests für API-Verbindungen
- [ ] Mobile-Tests auf verschiedenen Geräten
- [ ] Internationalisierungs-Workflow

### 🔒 Sicherheit & Datenschutz

#### Kurzfristige Ziele (Q2-Q3 2025)

- [ ] Vollständiger Security-Audit
- [ ] Abhängigkeiten auf Sicherheitslücken prüfen
- [ ] Input-Validierung verstärken
- [ ] Audit aller gespeicherten Daten

#### Mittelfristige Ziele (Q3 2025-Q1 2026)

- [ ] Automatische Backups implementieren
- [ ] Wiederherstellungsfunktion verbessern
- [ ] Datenexport in verschiedene Formate
- [ ] Versionierung von Daten

#### Langfristige Ziele (Q2-Q4 2026)

- [ ] End-to-End-Verschlüsselung für geteilte Listen
- [ ] Content Security Policy implementieren
- [ ] Cookie-Nutzung überprüfen und minimieren
- [ ] Privatsphäreeinstellungen implementieren

### 🛠️ DevOps & Performance

#### Kurzfristige Ziele (Q2-Q3 2025)

- ✅ Automatisierte Code-Review-Tools einrichten
- ✅ IDE-Konfiguration für Team standardisieren
- ✅ Deployment-Prozess weiter automatisieren
- [ ] VSCode-Extensions empfehlen
- [ ] Test-Automatisierung einführen (Vue Testing Library/Vitest)
- [ ] End-to-End-Tests mit Cypress oder Playwright

#### Mittelfristige Ziele (Q3 2025-Q1 2026)

- [ ] Rendering-Performance optimieren
- [ ] Lazy Loading implementieren
- [ ] Caching-Strategien implementieren
- [ ] Canary-Releases einrichten
- [ ] Code-Qualitätsmetriken mit SonarQube oder CodeClimate
- [ ] Bundle-Analysen mit Webpack Bundle Analyzer
- [ ] Performance-Budgets für die Web-App definieren
- [ ] Security-Checks (npm audit)
- [ ] Dependency-Scanning für Sicherheitslücken

#### Langfristige Ziele (Q2-Q4 2026)

- [ ] Rollback-Strategie verbessern
- [ ] Release-Notes automatisieren
- [ ] Server-Monitoring für Backend
- [ ] Uptime-Checking implementieren
- [ ] Lighthouse CI für Leistungsbewertung
- [ ] Performance-Regression-Tests
- [ ] Web Vitals Tracking
- [ ] OWASP ZAP für Sicherheitsscans

### 📝 Dokumentation

#### Kurzfristige Ziele (Q2-Q3 2025)

- ✅ API-Dokumentation aktualisieren
- ✅ Architektur-Dokumentation erweitern
- [ ] JSDoc für wichtige Funktionen ergänzen
- ✅ Entwicklungsrichtlinien dokumentieren
- [ ] Automatische API-Dokumentationsgenerierung

#### Mittelfristige Ziele (Q3 2025-Q1 2026)

- [ ] Komponenten-Dokumentation erstellen
- [ ] Onboarding-Dokumentation verfassen
- [ ] Visuelle Komponenten-Bibliothek (Storybook) einrichten
- [ ] Benutzerhandbuch aktualisieren
- [ ] Erzeugung von Typendokumentation aus TypeScript

#### Langfristige Ziele (Q2-Q4 2026)

- [ ] Automatische Changelog-Generierung
- [ ] Interaktive Dokumentation für Entwickler
- [ ] Nutzerhandbuch in der App integrieren

## 🐞 Bekannte Probleme & Technische Schulden

### Dringende Bugs (Q2 2025)

- ✅ PWA-Installation auf iOS zuverlässiger machen
- ✅ Safari-spezifische Probleme beheben
- [ ] LocalStorage-Limits berücksichtigen
- [ ] Offline-Modus robuster machen

### Edge Cases (Q3-Q4 2025)

- [ ] Umgang mit sehr großen Listen verbessern
- [ ] Langsame Netzwerkverbindungen testen
- [ ] Geräte mit wenig Speicher unterstützen
- [ ] Extreme Bildschirmgrößen testen

### Technische Schulden (fortlaufend)

- ✅ API-Konsistenz weiter verbessern
- [ ] Unnötige Abhängigkeiten identifizieren und entfernen
- ✅ Build-Prozess weiter optimieren
- [ ] Browser-Kompatibilität verbessern
- ✅ Responsives Design weiter optimieren
