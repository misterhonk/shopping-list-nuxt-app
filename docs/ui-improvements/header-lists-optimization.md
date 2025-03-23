# UI-Optimierung: Header und Listen-Bereich

## Problembeschreibung

Die aktuelle UI benötigt Optimierungen für eine kompaktere und benutzerfreundlichere Darstellung:

1. Der Header "Shopping List App" nimmt unnötig viel Platz ein und bietet nur wenig Funktionalität.
2. Der Container für "Meine Listen" enthält überflüssige Elemente (Überschrift, Padding).
3. Die Listen-Elemente könnten auf mobilen Geräten durch Swipe-Funktionalität verbessert werden.

## Lösungsansatz

### 1. Header-Bereich kompakter gestalten

- Header "Shopping List App" entfernen oder stark reduzieren
- Funktionen (Dark Mode, Statistik) in ein Menü verschieben, das über ein Icon in der rechten oberen Ecke zugänglich ist
- Das Menü sollte aufklappbar sein und die bisherigen Funktionen enthalten

#### Technische Umsetzung

- Erstellen einer Menü-Komponente (`HeaderMenu.vue`)
- Integration eines Icon-Buttons (z.B. mit drei Punkten oder Hamburger-Menü)
- Implementierung eines Dropdown-Menüs mit den bestehenden Funktionen
- Anpassung der Styling-Parameter im bestehenden Header

### 2. Listen-Container optimieren

- Überschrift "Meine Listen" entfernen oder minimieren
- Padding reduzieren für platzsparendere Darstellung
- Listen-Elemente direkt anzeigen ohne überflüssige Container-Elemente

#### Technische Umsetzung

- Überarbeitung des CSS für den Listen-Container
- Entfernung oder Minimierung der Überschrift
- Optimierung des Paddings und Margins

### 3. Swipe-Funktionalität für Listen-Elemente (Mobile)

- Implementierung von Swipe-Gesten (links/rechts) für Listen-Elemente auf mobilen Geräten
- Bei Swipe links: Löschen oder Archivieren der Liste
- Bei Swipe rechts: Bearbeiten der Liste oder andere Funktionen

#### Technische Umsetzung

- Installation und Integration einer Touch-Gesten-Bibliothek (z.B. `vue-touch` oder `hammer.js`)
- Implementierung der Swipe-Erkennung für Listen-Elemente
- Gestaltung der visuellen Rückmeldung bei Swipe-Aktionen
- Konfiguration der ausgelösten Aktionen (Löschen, Bearbeiten, etc.)

## Vorteile

- Mehr nutzbare Bildschirmfläche für die eigentlichen Listen
- Intuitivere Benutzererfahrung auf mobilen Geräten
- Moderneres und aufgeräumteres Design
- Bessere Nutzung des verfügbaren Platzes auf kleinen Bildschirmen

## Priorisierte Tasks

1. **Header-Optimierung**

   - [ ] Erstellen einer `HeaderMenu.vue` Komponente mit Dropdown-Funktionalität
   - [ ] Integration des Menü-Icons in den bestehenden Header
   - [ ] Verschieben der bestehenden Funktionen (Dark Mode, Statistik) ins Dropdown-Menü
   - [ ] Verringerung der Header-Höhe und Anpassung des Stylings

2. **Listen-Container Verschlankung**

   - [ ] CSS-Anpassungen zur Entfernung/Minimierung der Überschrift
   - [ ] Reduzierung des Paddings und der Margins
   - [ ] Optimierung der Listen-Element-Darstellung

3. **Swipe-Funktionalität**
   - [ ] Evaluierung und Integration einer geeigneten Touch-Gesten-Bibliothek
   - [ ] Implementierung der Swipe-Erkennung für Listen-Elemente
   - [ ] Gestaltung der visuellen Feedback-Elemente (z.B. erscheinende Buttons)
   - [ ] Anbindung der Swipe-Aktionen an bestehende Funktionen

## Technische Überlegungen

- Responsives Design beachten, um auf allen Bildschirmgrößen optimal zu funktionieren
- Sicherstellung der Barrierefreiheit trotz der UI-Änderungen
- Browser-Kompatibilität der Touch-Gesten-Implementierung testen
- Performance-Optimierung, besonders bei der Swipe-Funktionalität
