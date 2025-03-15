// Kategorie-Vorlagen für verschiedene Geschäftstypen
export const categoryTemplates = {
  // Standardvorlage für Supermärkte
  supermarket: {
    id: 'supermarket',
    name: 'Supermarkt',
    description: 'Standardkategorien für einen typischen Supermarkt',
    categories: [
      'Obst & Gemüse',
      'Fleisch & Fisch',
      'Backwaren',
      'Milchprodukte',
      'Getränke',
      'Tiefkühlwaren',
      'Konserven',
      'Grundnahrungsmittel',
      'Snacks & Süßigkeiten',
      'Gewürze & Backen',
      'Fertiggerichte',
      'Internationale Küche',
      'Bio-Produkte',
      'Sonstiges',
    ],
  },

  // Vorlage für Drogeriemärkte
  drugstore: {
    id: 'drugstore',
    name: 'Drogeriemarkt',
    description: 'Kategorien für einen typischen Drogeriemarkt',
    categories: [
      'Körperpflege',
      'Gesicht & Make-up',
      'Haarpflege',
      'Mundpflege',
      'Hygieneartikel',
      'Baby & Kind',
      'Waschmittel',
      'Reinigungsmittel',
      'Gesundheit',
      'Nahrungsergänzung',
      'Haushaltswaren',
      'Sonstiges',
    ],
  },

  // Vorlage für Baumärkte
  hardware: {
    id: 'hardware',
    name: 'Baumarkt',
    description: 'Kategorien für einen typischen Baumarkt',
    categories: [
      'Werkzeuge',
      'Elektro',
      'Holz',
      'Farben & Lacke',
      'Bauen',
      'Sanitär',
      'Eisenwaren',
      'Garten',
      'Heimwerken',
      'Maschinen',
      'Bodenbeläge',
      'Auto & Fahrrad',
      'Beleuchtung',
      'Sonstiges',
    ],
  },

  // Vorlage für Elektrofachgeschäfte
  electronics: {
    id: 'electronics',
    name: 'Elektronikmarkt',
    description: 'Kategorien für einen typischen Elektronikmarkt',
    categories: [
      'Computer & Zubehör',
      'Smartphones & Tablets',
      'TV & Audio',
      'Foto & Video',
      'Haushaltselektronik',
      'Kabel & Adapter',
      'Gaming',
      'Smart Home',
      'Speichermedien',
      'Software',
      'Netzwerk',
      'Sonstiges',
    ],
  },
};

// Standard-Template-ID
export const defaultTemplateId = 'supermarket';

// Hilfsfunktion zum Abrufen aller Templates
export const getAllTemplates = () => {
  return Object.values(categoryTemplates);
};

// Hilfsfunktion zum Abrufen eines bestimmten Templates
export const getTemplate = (templateId) => {
  return (
    categoryTemplates[templateId] ||
    categoryTemplates[defaultTemplateId]
  );
};
