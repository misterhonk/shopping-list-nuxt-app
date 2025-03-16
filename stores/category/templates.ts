import { Category, CategoryTemplate, TemplateCollection } from '../../composables/types';

/**
 * Standard-Template-ID
 */
export const defaultTemplateId = 'supermarket';

/**
 * Kategorie-Vorlagen für verschiedene Geschäftstypen
 */
export const categoryTemplates: TemplateCollection = {
  // Standardvorlage für Supermärkte
  supermarket: {
    id: 'supermarket',
    name: 'Supermarkt',
    description: 'Standardkategorien für einen typischen Supermarkt',
    categories: [
      { id: 'obst_gemuese', name: 'Obst & Gemüse' },
      { id: 'fleisch_fisch', name: 'Fleisch & Fisch' },
      { id: 'backwaren', name: 'Backwaren' },
      { id: 'milchprodukte', name: 'Milchprodukte' },
      { id: 'getraenke', name: 'Getränke' },
      { id: 'tiefkuehlwaren', name: 'Tiefkühlwaren' },
      { id: 'konserven', name: 'Konserven' },
      { id: 'grundnahrungsmittel', name: 'Grundnahrungsmittel' },
      { id: 'snacks_suessigkeiten', name: 'Snacks & Süßigkeiten' },
      { id: 'gewuerze_backen', name: 'Gewürze & Backen' },
      { id: 'fertiggerichte', name: 'Fertiggerichte' },
      { id: 'internationale_kueche', name: 'Internationale Küche' },
      { id: 'bio_produkte', name: 'Bio-Produkte' },
      { id: 'sonstiges', name: 'Sonstiges' },
    ],
  },

  // Vorlage für Drogeriemärkte
  drugstore: {
    id: 'drugstore',
    name: 'Drogeriemarkt',
    description: 'Kategorien für einen typischen Drogeriemarkt',
    categories: [
      { id: 'koerperpflege', name: 'Körperpflege' },
      { id: 'gesicht_makeup', name: 'Gesicht & Make-up' },
      { id: 'haarpflege', name: 'Haarpflege' },
      { id: 'mundpflege', name: 'Mundpflege' },
      { id: 'hygieneartikel', name: 'Hygieneartikel' },
      { id: 'baby_kind', name: 'Baby & Kind' },
      { id: 'waschmittel', name: 'Waschmittel' },
      { id: 'reinigungsmittel', name: 'Reinigungsmittel' },
      { id: 'gesundheit', name: 'Gesundheit' },
      { id: 'nahrungsergaenzung', name: 'Nahrungsergänzung' },
      { id: 'haushaltswaren', name: 'Haushaltswaren' },
      { id: 'sonstiges', name: 'Sonstiges' },
    ],
  },

  // Vorlage für Baumärkte
  hardware: {
    id: 'hardware',
    name: 'Baumarkt',
    description: 'Kategorien für einen typischen Baumarkt',
    categories: [
      { id: 'werkzeuge', name: 'Werkzeuge' },
      { id: 'elektro', name: 'Elektro' },
      { id: 'holz', name: 'Holz' },
      { id: 'farben_lacke', name: 'Farben & Lacke' },
      { id: 'bauen', name: 'Bauen' },
      { id: 'sanitaer', name: 'Sanitär' },
      { id: 'eisenwaren', name: 'Eisenwaren' },
      { id: 'garten', name: 'Garten' },
      { id: 'heimwerken', name: 'Heimwerken' },
      { id: 'maschinen', name: 'Maschinen' },
      { id: 'bodenbelaege', name: 'Bodenbeläge' },
      { id: 'auto_fahrrad', name: 'Auto & Fahrrad' },
      { id: 'beleuchtung', name: 'Beleuchtung' },
      { id: 'sonstiges', name: 'Sonstiges' },
    ],
  },

  // Vorlage für Elektrofachgeschäfte
  electronics: {
    id: 'electronics',
    name: 'Elektronikmarkt',
    description: 'Kategorien für einen typischen Elektronikmarkt',
    categories: [
      { id: 'computer_zubehoer', name: 'Computer & Zubehör' },
      { id: 'smartphones_tablets', name: 'Smartphones & Tablets' },
      { id: 'tv_audio', name: 'TV & Audio' },
      { id: 'foto_video', name: 'Foto & Video' },
      { id: 'haushaltselektronik', name: 'Haushaltselektronik' },
      { id: 'kabel_adapter', name: 'Kabel & Adapter' },
      { id: 'gaming', name: 'Gaming' },
      { id: 'smart_home', name: 'Smart Home' },
      { id: 'speichermedien', name: 'Speichermedien' },
      { id: 'software', name: 'Software' },
      { id: 'netzwerk', name: 'Netzwerk' },
      { id: 'sonstiges', name: 'Sonstiges' },
    ],
  },
};

/**
 * Hilfsfunktion zum Abrufen aller Templates
 * @returns Array aller Templates
 */
export const getAllTemplates = (): CategoryTemplate[] => {
  return Object.values(categoryTemplates);
};

/**
 * Hilfsfunktion zum Abrufen eines bestimmten Templates
 * @param templateId - Die ID des zu suchenden Templates
 * @returns Das angeforderte Template oder das Standard-Template
 */
export const getTemplate = (templateId: string): CategoryTemplate => {
  return categoryTemplates[templateId] || categoryTemplates[defaultTemplateId];
};
