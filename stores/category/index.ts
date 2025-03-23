import { defineStore } from 'pinia';

import { createLogger } from '~/utils/logger';

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
import {
  loadSortConfigs,
  saveSortConfigs,
  getSortConfigForTemplate,
  updateSortConfig,
  sortCategories,
} from './sorting';
import { saveCategoryData, loadCategoryData } from './storage';
import { categoryTemplates, defaultTemplateId } from './templates';

import type { CategorySortConfig, TemplateCollection } from '~/composables/types';
import type { Category, CategoryTemplate } from '~/types/app-types';

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
  sortConfigs: Record<string, CategorySortConfig>;
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
    sortConfigs: {},
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
      return this.currentTemplate.categories ?? [];
    },

    /**
     * Sortierte Kategorien des aktuellen Templates (nach Laufweg, Benutzerdefiniert oder Alphabetisch)
     */
    sortedCategories(): Category[] {
      const currentSortConfig = getSortConfigForTemplate(this.activeTemplateId, this.sortConfigs);
      return sortCategories(this.currentCategories, this.currentTemplate, currentSortConfig);
    },

    /**
     * Alle Templates als Array für die Auswahl
     */
    templatesList(): {
      id: string;
      name: string;
      description: string;
      isCustom: boolean;
    }[] {
      return Object.values(this.allTemplates).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        isCustom: this.customTemplates[template.id] !== undefined,
      }));
    },

    /**
     * Aktuelle Sortierungskonfiguration für das ausgewählte Template
     */
    currentSortConfig(): CategorySortConfig {
      return getSortConfigForTemplate(this.activeTemplateId, this.sortConfigs);
    },

    /**
     * Gibt an, ob die aktuelle Sortierung benutzerdefiniert ist
     */
    isCustomSortActive(): boolean {
      return this.currentSortConfig.useCustomSort;
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

      // Kategorie auch aus benutzerdefinierten Sortierungen entfernen
      if (this.sortConfigs[this.activeTemplateId]) {
        const updatedOrder = this.sortConfigs[this.activeTemplateId].customOrder.filter(
          id => id !== categoryId
        );

        this.sortConfigs[this.activeTemplateId] = {
          ...this.sortConfigs[this.activeTemplateId],
          customOrder: updatedOrder,
        };

        saveSortConfigs(this.sortConfigs);
      }

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

        // Wenn es ein Basis-Template gab, dessen Sortierung übernehmen
        if (baseTemplateId && this.sortConfigs[baseTemplateId]) {
          this.sortConfigs[result.newTemplateId] = {
            ...this.sortConfigs[baseTemplateId],
            templateId: result.newTemplateId,
          };
          saveSortConfigs(this.sortConfigs);
        }

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

      // Sortierungskonfiguration für das gelöschte Template entfernen
      if (this.sortConfigs[templateId]) {
        const updatedConfigs = { ...this.sortConfigs };
        delete updatedConfigs[templateId];
        this.sortConfigs = updatedConfigs;
        saveSortConfigs(this.sortConfigs);
      }

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
     * Sortierung zwischen Standard und Benutzerdefiniert umschalten
     */
    toggleSortMode(): void {
      const currentConfig = getSortConfigForTemplate(this.activeTemplateId, this.sortConfigs);

      const updatedConfig = {
        ...currentConfig,
        useCustomSort: !currentConfig.useCustomSort,
      };

      // Wenn wir zum ersten Mal auf benutzerdefinierte Sortierung umschalten,
      // verwenden wir die Standard-Reihenfolge als Ausgangspunkt
      if (updatedConfig.useCustomSort && updatedConfig.customOrder.length === 0) {
        const template = this.allTemplates[this.activeTemplateId];
        if (template.defaultCategoryOrder) {
          updatedConfig.customOrder = [...template.defaultCategoryOrder];
        } else {
          // Andernfalls nehmen wir einfach die aktuelle Reihenfolge der Kategorien
          updatedConfig.customOrder = this.currentCategories.map(cat => cat.id);
        }
      }

      this.sortConfigs = updateSortConfig(updatedConfig, this.sortConfigs);
      saveSortConfigs(this.sortConfigs);
    },

    /**
     * Benutzerdefinierte Sortierreihenfolge aktualisieren
     * @param newOrder - Array mit Kategorie-IDs in der neuen Reihenfolge
     */
    updateCustomSortOrder(newOrder: string[]): void {
      const currentConfig = getSortConfigForTemplate(this.activeTemplateId, this.sortConfigs);

      const updatedConfig = {
        ...currentConfig,
        useCustomSort: true,
        customOrder: newOrder,
      };

      this.sortConfigs = updateSortConfig(updatedConfig, this.sortConfigs);
      saveSortConfigs(this.sortConfigs);
    },

    /**
     * Benutzerdefinierte Sortierung zurücksetzen auf Standard-Laufweg
     */
    resetToDefaultSort(): void {
      const template = this.allTemplates[this.activeTemplateId];
      const defaultOrder = template.defaultCategoryOrder ?? [];

      const updatedConfig: CategorySortConfig = {
        templateId: this.activeTemplateId,
        useCustomSort: false,
        customOrder: [...defaultOrder],
      };

      this.sortConfigs = updateSortConfig(updatedConfig, this.sortConfigs);
      saveSortConfigs(this.sortConfigs);
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

        // Sortierungskonfigurationen laden
        this.sortConfigs = loadSortConfigs();
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

      // Sortierungskonfigurationen zurücksetzen
      this.sortConfigs = {};
      saveSortConfigs({});
    },
  },
});
