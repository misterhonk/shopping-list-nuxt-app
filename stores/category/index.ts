import { defineStore } from 'pinia';

import { createLogger } from '#imports';

import { migrateCategories, needsMigration } from './migration';
import {
  addCategory as addCategoryOperation,
  editCategory as editCategoryOperation,
  deleteCategory as deleteCategoryOperation,
  createTemplate as createTemplateOperation,
  deleteTemplate as deleteTemplateOperation,
  updateTemplate as updateTemplateOperation,
  updateCategoryOrder as updateCategoryOrderOperation,
} from './operations';
import { saveCategoryData, loadCategoryData } from './storage';
import { categoryTemplates, defaultTemplateId } from './templates';

import type { Category, CategoryTemplate, TemplateCollection } from '#imports';

// Logger initialisieren
const logger = createLogger('index');

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
        this.saveToLocalStorage();
      }
    },

    /**
     * Kategorie hinzufügen
     * @param categoryName - Der Name der neuen Kategorie
     */
    addCategory(categoryName: string): void {
      this.customTemplates = addCategoryOperation(
        this.activeTemplateId,
        categoryName,
        this.templates,
        this.customTemplates
      );
      this.saveToLocalStorage();
    },

    /**
     * Kategorie bearbeiten
     * @param categoryToEdit - Die zu bearbeitende Kategorie (Objekt oder ID)
     * @param newName - Der neue Name für die Kategorie
     */
    editCategory(categoryToEdit: Category | string, newName: string): void {
      // Sicherstellen, dass wir eine Kategorie-ID haben
      const categoryId = typeof categoryToEdit === 'object' ? categoryToEdit.id : categoryToEdit;

      this.customTemplates = editCategoryOperation(
        this.activeTemplateId,
        categoryId,
        newName,
        this.templates,
        this.customTemplates
      );

      this.saveToLocalStorage();

      // Explizites Neuladen zur Sicherheit
      setTimeout(() => {
        this.loadFromLocalStorage();
      }, 50);
    },

    /**
     * Kategorie löschen
     * @param categoryToDelete - Die zu löschende Kategorie (Objekt oder ID)
     */
    deleteCategory(categoryToDelete: Category | string): void {
      // Sicherstellen, dass wir eine Kategorie-ID haben
      const categoryId =
        typeof categoryToDelete === 'object' ? categoryToDelete.id : categoryToDelete;

      this.customTemplates = deleteCategoryOperation(
        this.activeTemplateId,
        categoryId,
        this.templates,
        this.customTemplates
      );

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
      const result = createTemplateOperation(
        name,
        description,
        baseTemplateId,
        this.templates,
        this.customTemplates
      );

      if (result.newTemplateId) {
        this.customTemplates = result.customTemplates;
        this.activeTemplateId = result.newTemplateId;
        this.saveToLocalStorage();
        return result.newTemplateId;
      }

      return null;
    },

    /**
     * Template löschen (nur benutzerdefinierte)
     * @param templateId - Die ID des zu löschenden Templates
     */
    deleteTemplate(templateId: string): void {
      this.customTemplates = deleteTemplateOperation(templateId, this.customTemplates);

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
      this.customTemplates = updateTemplateOperation(
        templateId,
        name,
        description,
        this.customTemplates
      );

      this.saveToLocalStorage();
    },

    /**
     * Kategorien-Reihenfolge aktualisieren
     * @param newOrder - Die neue Reihenfolge der Kategorien
     */
    updateCategoryOrder(newOrder: Category[]): void {
      this.customTemplates = updateCategoryOrderOperation(
        this.activeTemplateId,
        newOrder,
        this.templates,
        this.customTemplates
      );

      this.saveToLocalStorage();
    },

    /**
     * Daten im Local Storage speichern
     */
    saveToLocalStorage(): void {
      saveCategoryData(this.activeTemplateId, this.customTemplates);
    },

    /**
     * Daten aus dem Local Storage laden
     */
    loadFromLocalStorage(): void {
      try {
        const data = loadCategoryData();

        if (data) {
          if (data.customTemplates) {
            // Prüfen, ob Migration notwendig ist
            if (needsMigration(data.customTemplates)) {
              logger.info('Migration der Kategorien notwendig - alte Strings zu Objekten');
              this.customTemplates = migrateCategories(data.customTemplates);
            } else {
              this.customTemplates = data.customTemplates;
            }
          }

          if (
            data.activeTemplateId &&
            (this.templates[data.activeTemplateId] || this.customTemplates[data.activeTemplateId])
          ) {
            this.activeTemplateId = data.activeTemplateId;
          }
        }
      } catch (error) {
        logger.error('Fehler beim Laden der Kategorie-Vorlagen:', error);
      }
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
