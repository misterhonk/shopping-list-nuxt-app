import { defineStore } from 'pinia';

import { createLogger } from '../utils/logger';
import {
  categoryTemplates,
  defaultTemplateId,
  generateCategoryId,
} from './templates/categoryTemplates';
import { Category, CategoryTemplate, TemplateCollection } from '../composables/types';

// Logger initialisieren
const logger = createLogger('categoryStore');

/**
 * Interface für den CategoryStore State
 */
interface CategoryState {
  templates: TemplateCollection;
  activeTemplateId: string;
  customTemplates: TemplateCollection;
  isEditMode: boolean;
}

/**
 * Store für die Verwaltung von Kategorien und Vorlagen
 */
export const useCategoryStore = defineStore('categoryStore', {
  state: (): CategoryState => ({
    templates: { ...categoryTemplates },
    activeTemplateId: defaultTemplateId,
    customTemplates: {},
    isEditMode: false,
  }),

  getters: {
    /**
     * Alle verfügbaren Templates (voreingestellte und benutzerdefinierte)
     */
    allTemplates(): TemplateCollection {
      return { ...this.templates, ...this.customTemplates };
    },

    /**
     * Das aktuell ausgewählte Template
     */
    currentTemplate(): CategoryTemplate {
      return this.allTemplates[this.activeTemplateId] || this.templates[defaultTemplateId];
    },

    /**
     * Nur die Kategorien des aktuell ausgewählten Templates
     */
    currentCategories(): Category[] {
      return this.currentTemplate?.categories || [];
    },

    /**
     * Alle Templates als Array für die Auswahl
     */
    templatesList(): Array<{
      id: string;
      name: string;
      description: string;
      isCustom: boolean;
    }> {
      return Object.values(this.allTemplates).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        isCustom: this.customTemplates[template.id] !== undefined,
      }));
    },
  },

  actions: {
    /**
     * Template aktivieren
     * @param templateId - Die ID des zu aktivierenden Templates
     */
    activateTemplate(templateId: string): void {
      if (this.allTemplates[templateId]) {
        this.activeTemplateId = templateId;
        this.customTemplates = JSON.parse(JSON.stringify(this.customTemplates));
        this.saveToLocalStorage();

        // Explizites Neuladen zur Sicherheit
        const localStorageData = localStorage.getItem('categoryTemplates');
        if (localStorageData) {
          const parsedData = JSON.parse(localStorageData);
          if (parsedData.customTemplates && Object.keys(parsedData.customTemplates).length > 0) {
            const updatedCustomTemplates = parsedData.customTemplates;

            // Stelle sicher, dass der Store die aktuelle Version verwendet
            this.customTemplates = updatedCustomTemplates;
          }
        }
      }
    },

    /**
     * Kategorie hinzufügen
     * @param categoryName - Der Name der neuen Kategorie
     */
    addCategory(categoryName: string): void {
      if (!categoryName || categoryName.trim() === '') {
        return;
      }

      // Erstelle ein neues Kategorie-Objekt
      const newCategory: Category = {
        id: generateCategoryId(categoryName),
        name: categoryName.trim(),
      };

      // Prüfe, ob die Kategorie bereits existiert
      if (this.currentCategories.some(cat => cat.name === newCategory.name)) {
        logger.warn('Kategorie existiert bereits:', newCategory.name);
        return;
      }

      logger.info('Füge Kategorie hinzu:', newCategory);
      logger.info('Store-Zustand vor Hinzufügen:', {
        activeTemplateId: this.activeTemplateId,
        isStandardTemplate: this.templates[this.activeTemplateId] !== undefined,
        currentTemplate: this.currentTemplate,
        currentCategories: this.currentCategories,
      });

      // Prüfen, ob wir mit einem Standard-Template arbeiten
      const isStandardTemplate = this.templates[this.activeTemplateId] !== undefined;

      if (isStandardTemplate) {
        // Bei Standardvorlagen erstellen wir eine Kopie als benutzerdefiniert
        const newTemplate = JSON.parse(
          JSON.stringify({
            ...this.templates[this.activeTemplateId],
            id: this.activeTemplateId,
            categories: [...this.templates[this.activeTemplateId].categories, newCategory],
          })
        );

        // Mit $patch aktualisieren, um bessere Reaktivität zu gewährleisten
        this.$patch({
          customTemplates: {
            ...this.customTemplates,
            [this.activeTemplateId]: newTemplate,
          },
        });
      } else {
        // Bei benutzerdefinierten Vorlagen fügen wir der bestehenden Liste hinzu
        // Tiefe Kopie erstellen und aktualisieren
        const updatedTemplate = JSON.parse(
          JSON.stringify({
            ...this.customTemplates[this.activeTemplateId],
            categories: [...this.customTemplates[this.activeTemplateId].categories, newCategory],
          })
        );

        // Mit $patch aktualisieren
        this.$patch({
          customTemplates: {
            ...this.customTemplates,
            [this.activeTemplateId]: updatedTemplate,
          },
        });
      }

      logger.info('Template nach Hinzufügen:', this.customTemplates[this.activeTemplateId]);
      this.saveToLocalStorage();
    },

    /**
     * Kategorie bearbeiten
     * @param categoryToEdit - Die zu bearbeitende Kategorie (Objekt oder ID)
     * @param newName - Der neue Name für die Kategorie
     */
    editCategory(categoryToEdit: Category | string, newName: string): void {
      if (!newName || newName.trim() === '') {
        return;
      }

      // Sicherstellen, dass wir eine Kategorie-ID haben
      const categoryId = typeof categoryToEdit === 'object' ? categoryToEdit.id : categoryToEdit;
      const categoryName = typeof categoryToEdit === 'object' ? categoryToEdit.name : 'Unknown';

      // Prüfen, ob die Kategorie existiert
      const existingCategory = this.currentCategories.find(cat => {
        if (typeof cat === 'object') {
          return cat.id === categoryId;
        }
        return false;
      });

      if (!existingCategory) {
        logger.error('Kategorie nicht gefunden:', categoryId, categoryName);
        return;
      }

      logger.info(
        `Editiere Kategorie von '${existingCategory.name}' (ID: ${existingCategory.id}) zu '${newName}'`
      );
      logger.info('Store-Zustand vor Bearbeitung:', {
        activeTemplateId: this.activeTemplateId,
        isStandardTemplate: this.templates[this.activeTemplateId] !== undefined,
        currentCategories: this.currentCategories,
      });

      try {
        // Prüfen, ob wir mit einem Standard-Template arbeiten
        const isStandardTemplate = this.templates[this.activeTemplateId] !== undefined;

        // Erstelle eine Kopie der Kategorien
        let updatedCategories: Category[];

        if (isStandardTemplate) {
          updatedCategories = this.templates[this.activeTemplateId].categories.map(cat => {
            if (cat.id === categoryId) {
              return { ...cat, name: newName.trim() };
            }
            return cat;
          });
        } else {
          updatedCategories = this.customTemplates[this.activeTemplateId].categories.map(cat => {
            if (cat.id === categoryId) {
              return { ...cat, name: newName.trim() };
            }
            return cat;
          });
        }

        if (isStandardTemplate) {
          // Erstelle ein neues Template basierend auf dem Standard-Template
          this.customTemplates = {
            ...this.customTemplates,
            [this.activeTemplateId]: {
              ...this.templates[this.activeTemplateId],
              id: this.activeTemplateId,
              categories: updatedCategories,
            },
          };
        } else {
          // Aktualisiere das bestehende benutzerdefinierte Template
          this.customTemplates = {
            ...this.customTemplates,
            [this.activeTemplateId]: {
              ...this.customTemplates[this.activeTemplateId],
              categories: updatedCategories,
            },
          };
        }

        logger.info('Erfolgreich aktualisiert');
        logger.info('Neuer Store-Zustand:', {
          customTemplates: this.customTemplates[this.activeTemplateId],
          currentCategories: this.currentCategories,
        });

        // Speichern in LocalStorage
        this.saveToLocalStorage();

        // Explizites Neuladen zur Sicherheit
        setTimeout(() => {
          this.loadFromLocalStorage();
        }, 50);
      } catch (error) {
        logger.error('Fehler beim Bearbeiten der Kategorie:', error);
      }
    },

    /**
     * Kategorie löschen
     * @param categoryToDelete - Die zu löschende Kategorie (Objekt oder ID)
     */
    deleteCategory(categoryToDelete: Category | string): void {
      // Sicherstellen, dass wir eine Kategorie-ID haben
      const categoryId =
        typeof categoryToDelete === 'object' ? categoryToDelete.id : categoryToDelete;
      const categoryName = typeof categoryToDelete === 'object' ? categoryToDelete.name : 'Unknown';

      // Prüfen, ob die Kategorie existiert
      const existingCategory = this.currentCategories.find(cat => {
        if (typeof cat === 'object') {
          return cat.id === categoryId;
        }
        return false;
      });

      if (!existingCategory) {
        logger.error('Kategorie zum Löschen nicht gefunden:', categoryId, categoryName);
        return;
      }

      logger.info('Lösche Kategorie:', existingCategory);
      logger.info('Store-Zustand vor Löschen:', {
        activeTemplateId: this.activeTemplateId,
        isStandardTemplate: this.templates[this.activeTemplateId] !== undefined,
        currentCategories: this.currentCategories,
      });

      // Prüfen, ob wir mit einem Standard-Template arbeiten
      const isStandardTemplate = this.templates[this.activeTemplateId] !== undefined;

      if (isStandardTemplate) {
        // Bei Standardvorlagen erstellen wir eine Kopie als benutzerdefiniert
        const newTemplate = JSON.parse(
          JSON.stringify({
            ...this.templates[this.activeTemplateId],
            id: this.activeTemplateId,
            categories: this.templates[this.activeTemplateId].categories.filter(
              cat => cat.id !== categoryId
            ),
          })
        );

        // Mit $patch aktualisieren
        this.$patch({
          customTemplates: {
            ...this.customTemplates,
            [this.activeTemplateId]: newTemplate,
          },
        });
      } else {
        // Bei benutzerdefinierten Vorlagen aktualisieren wir die bestehende
        const updatedTemplate = JSON.parse(
          JSON.stringify({
            ...this.customTemplates[this.activeTemplateId],
            categories: this.customTemplates[this.activeTemplateId].categories.filter(
              cat => cat.id !== categoryId
            ),
          })
        );

        // Mit $patch aktualisieren
        this.$patch({
          customTemplates: {
            ...this.customTemplates,
            [this.activeTemplateId]: updatedTemplate,
          },
        });
      }

      logger.info('Template nach Löschen:', this.customTemplates[this.activeTemplateId]);
      this.saveToLocalStorage();

      // Explizites Neuladen zur Sicherheit
      setTimeout(() => {
        this.loadFromLocalStorage();
      }, 50);
    },

    /**
     * Neues Template erstellen
     * @param name - Der Name des neuen Templates
     * @param description - Die Beschreibung des Templates
     * @param baseTemplateId - Die ID eines Basis-Templates für Kategorien
     * @returns Die ID des neuen Templates oder null bei Fehler
     */
    createTemplate(
      name: string,
      description: string = '',
      baseTemplateId: string | null = null
    ): string | null {
      if (!name || name.trim() === '') {
        return null;
      }

      // Template-ID aus dem Namen generieren
      const id = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

      // Kategorien aus einem Basis-Template übernehmen oder leer starten
      let categories: Category[] = [];
      if (baseTemplateId && this.allTemplates[baseTemplateId]) {
        categories = [...this.allTemplates[baseTemplateId].categories];
      }

      // Neues Template erstellen
      const newTemplate: CategoryTemplate = {
        id,
        name,
        description,
        categories,
      };

      // Template speichern
      this.customTemplates[id] = newTemplate;

      // Neues Template aktivieren
      this.activeTemplateId = id;

      this.saveToLocalStorage();
      return id;
    },

    /**
     * Template löschen (nur benutzerdefinierte)
     * @param templateId - Die ID des zu löschenden Templates
     */
    deleteTemplate(templateId: string): void {
      if (!this.customTemplates[templateId]) {
        return;
      }

      delete this.customTemplates[templateId];

      // Falls das aktive Template gelöscht wurde, zurück zum Standard
      if (this.activeTemplateId === templateId) {
        this.activeTemplateId = defaultTemplateId;
      }

      this.saveToLocalStorage();
    },

    /**
     * Template bearbeiten (nur benutzerdefinierte)
     * @param templateId - Die ID des zu bearbeitenden Templates
     * @param name - Der neue Name (optional)
     * @param description - Die neue Beschreibung (optional)
     */
    updateTemplate(templateId: string, name?: string, description?: string): void {
      if (!this.customTemplates[templateId]) {
        return;
      }

      this.customTemplates[templateId] = {
        ...this.customTemplates[templateId],
        name: name || this.customTemplates[templateId].name,
        description: description || this.customTemplates[templateId].description,
      };

      this.saveToLocalStorage();
    },

    /**
     * Kategorien-Reihenfolge aktualisieren
     * @param newOrder - Die neue Reihenfolge der Kategorien
     */
    updateCategoryOrder(newOrder: Category[]): void {
      if (!Array.isArray(newOrder) || newOrder.length === 0) {
        return;
      }

      // Stelle sicher, dass wir die vordefinierten Templates nicht verändern
      let templateToEdit: CategoryTemplate | null = null;

      if (this.templates[this.activeTemplateId]) {
        // Erstelle eine Kopie als benutzerdefiniertes Template, aber nur wenn die Reihenfolge sich ändert
        templateToEdit = {
          ...this.templates[this.activeTemplateId],
          id: this.activeTemplateId,
          categories: newOrder,
        };
      } else {
        // Verwende das bestehende benutzerdefinierte Template
        templateToEdit = {
          ...this.customTemplates[this.activeTemplateId],
        };
        templateToEdit.categories = newOrder;
      }

      this.customTemplates[this.activeTemplateId] = templateToEdit;
      this.saveToLocalStorage();
    },

    /**
     * Daten im Local Storage speichern
     */
    saveToLocalStorage(): void {
      try {
        // Sicherstellen, dass alle Daten korrekt sind, bevor wir speichern
        Object.values(this.customTemplates).forEach(template => {
          if (!template.id || !template.categories) {
            logger.error('Ungültiges Template-Format:', template);
            // Hinzufügen fehlender Eigenschaften
            if (!template.id) {
              template.id =
                template.name?.toLowerCase().replace(/\s+/g, '_') || this.activeTemplateId;
            }

            if (!template.categories) {
              template.categories = [];
            }
          }
        });

        const dataToSave = {
          activeTemplateId: this.activeTemplateId,
          customTemplates: this.customTemplates,
        };

        // Tiefe Kopie erstellen, um Referenzprobleme zu vermeiden
        const cleanDataToSave = JSON.parse(JSON.stringify(dataToSave));

        logger.info('Speichere in localStorage:', cleanDataToSave);
        localStorage.setItem('categoryTemplates', JSON.stringify(cleanDataToSave));
      } catch (error) {
        logger.error('Fehler beim Speichern der Kategorie-Vorlagen:', error);
      }
    },

    /**
     * Daten aus dem Local Storage laden
     */
    loadFromLocalStorage(): void {
      try {
        logger.info('Lade aus localStorage');
        const data = localStorage.getItem('categoryTemplates');
        if (data) {
          const parsedData = JSON.parse(data);
          logger.info('Geladene Daten:', parsedData);

          if (parsedData.customTemplates) {
            // Prüfen, ob Migration notwendig ist
            let needsMigration = false;
            for (const templateId in parsedData.customTemplates) {
              const template = parsedData.customTemplates[templateId];
              if (template.categories?.length > 0 && typeof template.categories[0] === 'string') {
                needsMigration = true;
                break;
              }
            }

            if (needsMigration) {
              logger.info('Migration der Kategorien notwendig - alte Strings zu Objekten');
              this.migrateCategories(parsedData.customTemplates);
            } else {
              // Tiefe Kopie erstellen, um Referenzprobleme zu vermeiden
              this.customTemplates = JSON.parse(JSON.stringify(parsedData.customTemplates));
            }
          }

          if (
            parsedData.activeTemplateId &&
            (this.templates[parsedData.activeTemplateId] ||
              this.customTemplates[parsedData.activeTemplateId])
          ) {
            this.activeTemplateId = parsedData.activeTemplateId;
          }

          logger.info('Nach dem Laden - activeTemplateId:', this.activeTemplateId);
          logger.info('Nach dem Laden - customTemplates:', this.customTemplates);
        }
      } catch (error) {
        logger.error('Fehler beim Laden der Kategorie-Vorlagen:', error);
      }
    },

    /**
     * Migration alter String-Kategorien zu Objekt-Kategorien
     * @param customTemplates - Die zu migrierenden benutzerdefinierten Templates
     */
    migrateCategories(customTemplates: TemplateCollection): void {
      logger.info('Starte Migration von String-Kategorien zu Objekten');

      // Für jedes Template die Kategorien migrieren
      for (const templateId in customTemplates) {
        const template = customTemplates[templateId];
        if (template.categories && Array.isArray(template.categories)) {
          // Kategorien in Objekte konvertieren
          const newCategories = template.categories.map(category => {
            if (typeof category === 'string') {
              return {
                id: generateCategoryId(category),
                name: category,
              };
            }
            return category; // Falls es bereits ein Objekt ist
          });
          template.categories = newCategories;
        }
      }

      // Aktualisierte Daten übernehmen
      this.customTemplates = JSON.parse(JSON.stringify(customTemplates));
      logger.info('Migration abgeschlossen, neue customTemplates:', this.customTemplates);

      // Speichern, um das neue Format zu persistieren
      this.saveToLocalStorage();
    },

    /**
     * Alle Änderungen zurücksetzen
     */
    resetToDefault(): void {
      this.customTemplates = {};
      this.activeTemplateId = defaultTemplateId;
      this.saveToLocalStorage();
    },
  },
});
