/**
 * Service für die Verwaltung von Kategorien
 *
 * Dieser Service enthält die Geschäftslogik für die Verwaltung von Kategorien
 * und ist unabhängig von der Vue-spezifischen UI-Logik.
 */

import { BaseService } from './base/BaseService';

import type { IStorageRepository } from '~/repositories/StorageRepository';
import type { Category, CategoryTemplate } from '~/types/app-types';

/**
 * Service für die Verwaltung von Kategorien
 */
export class CategoryService extends BaseService {
  /**
   * Der Schlüssel für die aktive Template-ID im Storage
   */
  private readonly ACTIVE_TEMPLATE_KEY = 'activeTemplateId';

  /**
   * Der Schlüssel für benutzerdefinierte Kategorien im Storage
   */
  private readonly CUSTOM_CATEGORIES_KEY = 'customCategories';

  /**
   * Der Schlüssel für das Kategorien-Event im Storage
   */
  private readonly CATEGORY_EVENT_KEY = 'categoryUpdateEvent';

  /**
   * Das Repository für den Datenzugriff
   */
  private readonly repository: IStorageRepository;

  /**
   * Vordefinierte Kategorievorlagen
   */
  private readonly templates: Record<string, CategoryTemplate> = {
    supermarket: {
      id: 'supermarket',
      name: 'Supermarkt',
      description: 'Standardvorlage für Supermarkteinkäufe',
      categories: [
        { id: 'fruits_vegetables', name: 'Obst & Gemüse', color: '#4caf50' },
        { id: 'dairy', name: 'Milchprodukte', color: '#f5f5f5' },
        { id: 'meat', name: 'Fleisch & Wurst', color: '#f44336' },
        { id: 'bakery', name: 'Backwaren', color: '#8d6e63' },
        { id: 'frozen', name: 'Tiefkühlwaren', color: '#2196f3' },
        { id: 'beverages', name: 'Getränke', color: '#03a9f4' },
        { id: 'household', name: 'Haushaltswaren', color: '#9e9e9e' },
        { id: 'sweets', name: 'Süßigkeiten', color: '#e91e63' },
        { id: 'other', name: 'Sonstiges', color: '#9c27b0' },
      ],
    },
    drugstore: {
      id: 'drugstore',
      name: 'Drogerie',
      description: 'Vorlage für Drogerieprodukte',
      categories: [
        { id: 'personal_hygiene', name: 'Körperpflege', color: '#ba68c8' },
        { id: 'cleaning', name: 'Reinigung', color: '#4dd0e1' },
        { id: 'cosmetics', name: 'Kosmetik', color: '#f06292' },
        { id: 'health', name: 'Gesundheit', color: '#4caf50' },
        { id: 'baby', name: 'Baby & Kind', color: '#ffb74d' },
        { id: 'other', name: 'Sonstiges', color: '#9c27b0' },
      ],
    },
    hardware: {
      id: 'hardware',
      name: 'Baumarkt',
      description: 'Vorlage für Baumarktartikel',
      categories: [
        { id: 'tools', name: 'Werkzeuge', color: '#ff5722' },
        { id: 'building_materials', name: 'Baumaterial', color: '#8d6e63' },
        { id: 'garden', name: 'Garten', color: '#4caf50' },
        { id: 'electrical', name: 'Elektro', color: '#fdd835' },
        { id: 'paint', name: 'Farben & Lacke', color: '#29b6f6' },
        { id: 'hardware', name: 'Eisenwaren', color: '#78909c' },
        { id: 'other', name: 'Sonstiges', color: '#9c27b0' },
      ],
    },
    electronics: {
      id: 'electronics',
      name: 'Elektronik',
      description: 'Vorlage für Elektronikgeschäfte',
      categories: [
        { id: 'computers', name: 'Computer & Zubehör', color: '#0288d1' },
        { id: 'phones', name: 'Smartphones & Telefone', color: '#0097a7' },
        { id: 'entertainment', name: 'Unterhaltungselektronik', color: '#e53935' },
        { id: 'appliances', name: 'Haushaltsgeräte', color: '#757575' },
        { id: 'cables', name: 'Kabel & Adapter', color: '#fdd835' },
        { id: 'other', name: 'Sonstiges', color: '#9c27b0' },
      ],
    },
  };

  /**
   * Erstellt eine neue Instanz des CategoryService
   * @param repository - Das Repository für den Datenzugriff
   */
  constructor(repository: IStorageRepository) {
    super('CategoryService');
    this.repository = repository;
  }

  /**
   * Gibt alle verfügbaren Kategorievorlagen zurück
   * @returns Ein Objekt mit allen Vorlagen
   */
  public getAllTemplates(): Record<string & CategoryTemplate> {
    return (
      this.safeOperation(() => {
        // Vordefinierte Templates mit benutzerdefinierten Templates kombinieren
        const customTemplates = this.getCustomTemplates();

        return {
          ...this.templates,
          ...customTemplates,
        };
      }, 'Fehler beim Abrufen aller Kategorievorlagen') ?? { ...this.templates }
    );
  }

  /**
   * Gibt eine Vorlage anhand ihrer ID zurück
   * @param templateId - ID der Vorlage
   * @returns Die gefundene Vorlage oder null bei Fehler
   */
  public getTemplateById(templateId: string): CategoryTemplate | null {
    return this.safeOperation(() => {
      if (!templateId) {
        throw new Error('TemplateId darf nicht leer sein');
      }

      const templates = this.getAllTemplates();
      return templates[templateId] || null;
    }, `Fehler beim Abrufen der Vorlage mit ID ${templateId}`);
  }

  /**
   * Gibt alle Kategorien einer Vorlage zurück
   * @param templateId - ID der Vorlage
   * @returns Array aller Kategorien oder leeres Array bei Fehler
   */
  public getCategoriesByTemplateId(templateId: string): Category[] {
    return (
      this.safeOperation(() => {
        const template = this.getTemplateById(templateId);

        if (!template) {
          throw new Error(`Vorlage mit ID ${templateId} nicht gefunden`);
        }

        return [...template.categories];
      }, `Fehler beim Abrufen der Kategorien für Vorlage ${templateId}`) ?? []
    );
  }

  /**
   * Gibt die ID der aktiven Vorlage zurück
   * @returns Die ID der aktiven Vorlage oder 'supermarket' als Fallback
   */
  public getActiveTemplateId(): string {
    return (
      this.safeOperation(() => {
        const activeId = this.repository.getItem<string>(this.ACTIVE_TEMPLATE_KEY);
        return activeId ?? 'supermarket';
      }, 'Fehler beim Abrufen der aktiven Vorlagen-ID') ?? 'supermarket'
    );
  }

  /**
   * Setzt die aktive Vorlage
   * @param templateId - ID der Vorlage
   * @returns true bei Erfolg, false bei Fehler
   */
  public setActiveTemplate(templateId: string): boolean {
    return (
      this.safeOperation(() => {
        if (!templateId) {
          throw new Error('TemplateId darf nicht leer sein');
        }

        const template = this.getTemplateById(templateId);

        if (!template) {
          throw new Error(`Vorlage mit ID ${templateId} nicht gefunden`);
        }

        return this.repository.setItem(this.ACTIVE_TEMPLATE_KEY, templateId);
      }, `Fehler beim Setzen der aktiven Vorlage ${templateId}`) ?? false
    );
  }

  /**
   * Gibt alle aktiven Kategorien zurück
   * @returns Array aller Kategorien der aktiven Vorlage
   */
  public getActiveCategories(): Category[] {
    return (
      this.safeOperation(() => {
        const activeTemplateId = this.getActiveTemplateId();
        return this.getCategoriesByTemplateId(activeTemplateId);
      }, 'Fehler beim Abrufen der aktiven Kategorien') ?? []
    );
  }

  /**
   * Erstellt eine benutzerdefinierte Kategorienvorlage
   * @param template - Die zu erstellende Vorlage
   * @returns Die erstellte Vorlage oder null bei Fehler
   */
  public createCustomTemplate(template: Partial<CategoryTemplate>): CategoryTemplate | null {
    return this.safeOperation(() => {
      if (!template.name || template.name.trim() === '') {
        throw new Error('Vorlagenname darf nicht leer sein');
      }

      if (!template.id) {
        template.id = `custom_${Date.now()}`;
      }

      if (!Array.isArray(template.categories) || template.categories.length === 0) {
        throw new Error('Vorlage muss mindestens eine Kategorie enthalten');
      }

      const customTemplate: CategoryTemplate = {
        id: template.id,
        name: template.name.trim(),
        description: template.description ?? 'Benutzerdefinierte Vorlage',
        categories: template.categories.map(cat => ({
          id: cat.id ?? `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: cat.name,
          color: cat.color ?? '#9c27b0',
          icon: cat.icon,
        })),
        isCustom: true,
      };

      // Bestehende benutzerdefinierte Vorlagen abrufen
      const customTemplates = this.getCustomTemplates();

      // Neue Vorlage hinzufügen
      customTemplates[customTemplate.id] = customTemplate;

      // Speichern
      const success = this.repository.setItem(this.CUSTOM_CATEGORIES_KEY, customTemplates);

      return success ? customTemplate : null;
    }, 'Fehler beim Erstellen einer benutzerdefinierten Kategorienvorlage');
  }

  /**
   * Aktualisiert eine Kategorie und informiert über die Änderung
   * @param templateId - ID der Vorlage
   * @param categoryId - ID der Kategorie
   * @param updates - Die zu aktualisierenden Felder
   * @returns Die aktualisierte Kategorie oder null bei Fehler
   */
  public updateCategory(
    templateId: string,
    categoryId: string,
    updates: Partial<Category>
  ): Category | null {
    return this.safeOperation(() => {
      if (!templateId || !categoryId) {
        throw new Error('TemplateId und CategoryId dürfen nicht leer sein');
      }

      // Nur benutzerdefinierte Vorlagen können bearbeitet werden
      const customTemplates = this.getCustomTemplates();
      const template = customTemplates[templateId];

      if (!template) {
        throw new Error(
          `Benutzerdefinierte Vorlage mit ID ${templateId} nicht gefunden oder keine benutzerdefinierte Vorlage`
        );
      }

      const categoryIndex = template.categories.findIndex(cat => cat.id === categoryId);

      if (categoryIndex === -1) {
        throw new Error(`Kategorie mit ID ${categoryId} nicht gefunden`);
      }

      // Kategorie aktualisieren
      const updatedCategory: Category = {
        ...template.categories[categoryIndex],
        ...updates,
        id: categoryId, // ID darf nicht überschrieben werden
      };

      // Template aktualisieren
      template.categories[categoryIndex] = updatedCategory;

      // Speichern
      const success = this.repository.setItem(this.CUSTOM_CATEGORIES_KEY, customTemplates);

      if (success) {
        // Event auslösen für Aktualisierung von Artikeln
        this.triggerCategoryUpdateEvent(categoryId, updatedCategory.name);
      }

      return success ? updatedCategory : null;
    }, `Fehler beim Aktualisieren der Kategorie mit ID ${categoryId} in Vorlage ${templateId}`);
  }

  /**
   * Löst ein Event für die Aktualisierung von Kategorie aus
   * @param categoryId - ID der aktualisierten Kategorie
   * @param newName - Der neue Name der Kategorie
   */
  private triggerCategoryUpdateEvent(categoryId: string, newName: string): void {
    this.safeOperation(() => {
      this.repository.setItem(this.CATEGORY_EVENT_KEY, {
        categoryId,
        newName,
        timestamp: Date.now(),
      });
    }, `Fehler beim Auslösen des Category-Update-Events für Kategorie ${categoryId}`);
  }

  /**
   * Gibt alle benutzerdefinierten Vorlagen zurück
   * @returns Ein Objekt mit allen benutzerdefinierten Vorlagen
   */
  private getCustomTemplates(): Record<string & CategoryTemplate> {
    return (
      this.safeOperation(() => {
        const customTemplates = this.repository.getItem<Record<string, CategoryTemplate>>(
          this.CUSTOM_CATEGORIES_KEY
        );
        return customTemplates ?? {};
      }, 'Fehler beim Abrufen der benutzerdefinierten Vorlagen') ?? {}
    );
  }
}
