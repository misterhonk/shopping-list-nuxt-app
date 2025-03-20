# UI-Mockup: Optimierter Header und Listen-Bereich

## Aktuelle vs. Neue UI

```
┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
│ ┌───────────────────────────────┐   │    │                                     │
│ │ Shopping List App       🌙 📊 │   │    │                              ⋮      │
│ └───────────────────────────────┘   │    │                                     │
│                                     │    │ ┌─────────────────────────────────┐ │
│ ┌───────────────────────────────┐   │    │ │ Wocheneinkauf                   │ │
│ │ Meine Listen                   │   │    │ │ 12 Artikel • 18.03.2025        │ │
│ │                               │   │    │ └─────────────────────────────────┘ │
│ │ ┌───────────────────────────┐ │   │    │                                     │
│ │ │ Wocheneinkauf             │ │   │    │ ┌─────────────────────────────────┐ │
│ │ │ 12 Artikel • 18.03.2025   │ │   │    │ │ Bürobedarf                      │ │
│ │ └───────────────────────────┘ │   │    │ │ 5 Artikel • 15.03.2025          │ │
│ │                               │   │    │ └─────────────────────────────────┘ │
│ │ ┌───────────────────────────┐ │   │    │                                     │
│ │ │ Bürobedarf                │ │   │    │ ┌─────────────────────────────────┐ │
│ │ │ 5 Artikel • 15.03.2025    │ │   │    │ │ Geburtstagsfest                 │ │
│ │ └───────────────────────────┘ │   │    │ │ 8 Artikel • 10.03.2025          │ │
│ │                               │   │    │ └─────────────────────────────────┘ │
│ │ ┌───────────────────────────┐ │   │    │                                     │
│ │ │ Geburtstagsfest           │ │   │    │                                     │
│ │ │ 8 Artikel • 10.03.2025    │ │   │    │                     ⊕               │
│ │ └───────────────────────────┘ │   │    │                                     │
│ │                               │   │    │                                     │
│ └───────────────────────────────┘   │    │                                     │
└─────────────────────────────────────┘    └─────────────────────────────────────┘
      Aktuelle Darstellung                     Optimierte Darstellung
```

## Dropdown-Menü Design (geöffnet)

```
┌─────────────────────────────────────┐
│                              ⋮      │
│       ┌─────────────────────┐       │
│       │ 🌙 Dark Mode        │       │
│       │ 📊 Statistik        │       │
│       │ ⚙️ Einstellungen    │       │
│       └─────────────────────┘       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Wocheneinkauf                   │ │
│ │ 12 Artikel • 18.03.2025        │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## Swipe-Funktionalität auf mobilen Geräten

### Swipe nach links (Löschen)

```
┌─────────────────────────────────────┐
│                              ⋮      │
│                                     │
│ ┌───────────────────────┐ ┌─────┐  │
│ │ Wocheneinkauf         │ │ 🗑️   │  │
│ │ 12 Artikel • 18.03... │ │     │  │
│ └───────────────────────┘ └─────┘  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Bürobedarf                      │ │
│ │ 5 Artikel • 15.03.2025          │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Swipe nach rechts (Bearbeiten)

```
┌─────────────────────────────────────┐
│                              ⋮      │
│                                     │
│  ┌─────┐ ┌───────────────────────┐  │
│  │ ✏️   │ │ Wocheneinkauf         │  │
│  │     │ │ 12 Artikel • 18.03... │  │
│  └─────┘ └───────────────────────┘  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Bürobedarf                      │ │
│ │ 5 Artikel • 15.03.2025          │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## Vorteile der neuen UI

1. **Mehr nutzbarer Bildschirmraum**
   - Reduzierung unnötiger Elemente (Header, Überschriften, Padding)
   - Mehr Platz für das Anzeigen der eigentlichen Listen
   - Optimierte Nutzung der verfügbaren Bildschirmfläche

2. **Intuitivere Bedienung**
   - Funktionen im Menü logisch gruppiert
   - Swipe-Gesten für schnelle Aktionen auf mobilen Geräten
   - Floating-Action-Button für "Neue Liste" ist immer gut sichtbar

3. **Moderneres Design**
   - Aufgeräumtere Oberfläche
   - Fokus auf den Inhalt statt auf strukturelle Elemente
   - Konsistentere Benutzeroberfläche
   
4. **Mobiloptimierung**
   - Besondere Berücksichtigung der Touchbedienung
   - Swipe-Gesten sparen Platz (keine zusätzlichen Buttons erforderlich)
   - Optimierung für Einhandbedienung (Menü und Add-Button in Daumenreichweite)
