/**
 * Default-Laufwege für verschiedene Markttypen
 *
 * Diese Datei definiert die Standard-Reihenfolge der Kategorien basierend auf
 * typischen Laufwegen in verschiedenen Geschäftstypen.
 */

import type { TemplateCollection } from '~/composables/types';
import type { CategoryTemplate } from '~/types/app-types';

/**
 * Supermarkt-Laufweg:
 * Ein typischer Supermarkt ist oft so angeordnet, dass man am Eingang
 * mit frischen Produkten beginnt und dann durch die Gänge zu verpackten Waren,
 * Tiefkühlprodukten und schließlich zu Getränken und Haushaltswaren gelangt.
 */
export const supermarketPath = [
  'obst_gemuese', // Obst & Gemüse (typischerweise am Eingang)
  'backwaren', // Backwaren (oft in der Nähe des Eingangs)
  'fleisch_fisch', // Fleisch & Fisch (Frischetheke)
  'milchprodukte', // Milchprodukte
  'grundnahrungsmittel', // Grundnahrungsmittel (Nudeln, Reis, Mehl)
  'gewuerze_backen', // Gewürze & Backen
  'konserven', // Konserven
  'internationale_kueche', // Internationale Küche
  'snacks_suessigkeiten', // Snacks & Süßigkeiten
  'getraenke', // Getränke
  'tiefkuehlwaren', // Tiefkühlwaren (oft an der Peripherie)
  'bio_produkte', // Bio-Produkte (je nach Markt unterschiedlich)
  'fertiggerichte', // Fertiggerichte
  'sonstiges', // Sonstiges
];

/**
 * Drogerie-Laufweg:
 * In Drogeriemärkten beginnt man typischerweise mit Kosmetik und Körperpflege,
 * gefolgt von Gesundheitsprodukten, Haushaltswaren und schließlich Babyartikeln.
 */
export const drugstorePath = [
  'gesicht_makeup', // Gesicht & Make-up (oft vorne/Eingangsbereich)
  'koerperpflege', // Körperpflege
  'haarpflege', // Haarpflege
  'mundpflege', // Mundpflege
  'hygieneartikel', // Hygieneartikel
  'gesundheit', // Gesundheit
  'nahrungsergaenzung', // Nahrungsergänzung
  'waschmittel', // Waschmittel
  'reinigungsmittel', // Reinigungsmittel
  'haushaltswaren', // Haushaltswaren
  'baby_kind', // Baby & Kind (oft hinten im Laden)
  'sonstiges', // Sonstiges
];

/**
 * Baumarkt-Laufweg:
 * Baumärkte haben oft eine Aufteilung nach Projekten, beginnend mit
 * Werkzeugen, dann Baustoffe, Farben, Garten und schließlich Einrichtung.
 */
export const hardwarePath = [
  'werkzeuge', // Werkzeuge (oft vorne im Laden)
  'eisenwaren', // Eisenwaren
  'elektro', // Elektro
  'sanitaer', // Sanitär
  'bauen', // Bauen
  'holz', // Holz
  'farben_lacke', // Farben & Lacke
  'bodenbelaege', // Bodenbeläge
  'heimwerken', // Heimwerken
  'maschinen', // Maschinen
  'beleuchtung', // Beleuchtung
  'garten', // Garten (oft in einem separaten Bereich/Außenbereich)
  'auto_fahrrad', // Auto & Fahrrad
  'sonstiges', // Sonstiges
];

/**
 * Elektronikmarkt-Laufweg:
 * Elektronikfachmärkte organisieren ihre Waren oft nach Produktkategorien,
 * beginnend mit Smartphones und Computern, gefolgt von TV/Audio und schließlich
 * Haushaltsgeräten.
 */
export const electronicsPath = [
  'smartphones_tablets', // Smartphones & Tablets (oft vorne im Laden)
  'computer_zubehoer', // Computer & Zubehör
  'tv_audio', // TV & Audio
  'foto_video', // Foto & Video
  'gaming', // Gaming
  'haushaltselektronik', // Haushaltselektronik
  'smart_home', // Smart Home
  'kabel_adapter', // Kabel & Adapter
  'netzwerk', // Netzwerk
  'speichermedien', // Speichermedien
  'software', // Software
  'sonstiges', // Sonstiges
];

/**
 * Fügt Standardreihenfolgen zu den Templates hinzu
 * @param templates Die zu aktualisierenden Templates
 * @returns Aktualisierte Templates mit defaultCategoryOrder
 */
export const addDefaultPathsToTemplates = (templates: TemplateCollection): TemplateCollection => {
  const updatedTemplates = { ...templates };

  // Supermarkt-Laufweg hinzufügen
  if (updatedTemplates.supermarket) {
    updatedTemplates.supermarket = {
      ...updatedTemplates.supermarket,
      defaultCategoryOrder: supermarketPath,
    };
  }

  // Drogeriemarkt-Laufweg hinzufügen
  if (updatedTemplates.drugstore) {
    updatedTemplates.drugstore = {
      ...updatedTemplates.drugstore,
      defaultCategoryOrder: drugstorePath,
    };
  }

  // Baumarkt-Laufweg hinzufügen
  if (updatedTemplates.hardware) {
    updatedTemplates.hardware = {
      ...updatedTemplates.hardware,
      defaultCategoryOrder: hardwarePath,
    };
  }

  // Elektronikmarkt-Laufweg hinzufügen
  if (updatedTemplates.electronics) {
    updatedTemplates.electronics = {
      ...updatedTemplates.electronics,
      defaultCategoryOrder: electronicsPath,
    };
  }

  return updatedTemplates;
};
