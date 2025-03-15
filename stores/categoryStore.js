import { defineStore } from 'pinia';
import {
  categoryTemplates,
  defaultTemplateId,
} from './templates/categoryTemplates';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    templates: { ...categoryTemplates },
    activeTemplateId: defaultTemplateId,
    customTemplates: {},
    isEditMode: false,
  }),

  getters: {
    // Alle verfügbaren Templates (voreingestellte und benutzerdefinierte)
    allTemplates() {
      return { ...this.templates, ...this.customTemplates };
    },

    // Das aktuell ausgewählte Template
    currentTemplate() {
      return (
        this.allTemplates[this.activeTemplateId] ||
        this.templates[defaultTemplateId]
      );
    },

    // Nur die Kategorien des aktuell ausgewählten Templates
    currentCategories() {
      return this.currentTemplate?.categories || [];
    },

    // Alle Templates als Array für die Auswahl
    templatesList() {
      return Object.values(this.allTemplates).map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        isCustom: this.customTemplates[template.id] !== undefined,
      }));
    },
  },

  actions: {
    // Template aktivieren
    activateTemplate(templateId) {
      if (this.allTemplates[templateId]) {
        this.activeTemplateId = templateId;
        this.saveToLocalStorage();
      }
    },

    // Kategorie hinzufügen
    addCategory(category) {
      if (!category || category.trim() === '') return;

      // Prüfe, ob die Kategorie bereits existiert
      if (this.currentCategories.includes(category)) return;

      // Stelle sicher, dass wir die vordefinierten Templates nicht verändern
      if (this.templates[this.activeTemplateId]) {
        // Erstelle eine Kopie als benutzerdefiniertes Template
        this.customTemplates[this.activeTemplateId] = {
          ...this.templates[this.activeTemplateId],
          categories: [
            ...this.templates[this.activeTemplateId].categories,
            category,
          ],
        };
      } else {
        // Update das benutzerdefinierte Template
        this.customTemplates[this.activeTemplateId].categories.push(
          category
        );
      }

      this.saveToLocalStorage();
    },

    // Kategorie bearbeiten
    editCategory(oldCategory, newCategory) {
      if (!newCategory || newCategory.trim() === '') return;
      if (!this.currentCategories.includes(oldCategory)) return;

      // Stelle sicher, dass wir die vordefinierten Templates nicht verändern
      let templateToEdit = null;

      if (this.templates[this.activeTemplateId]) {
        // Erstelle eine Kopie als benutzerdefiniertes Template
        templateToEdit = {
          ...this.templates[this.activeTemplateId],
          categories: [
            ...this.templates[this.activeTemplateId].categories,
          ],
        };
      } else {
        // Verwende das bestehende benutzerdefinierte Template
        templateToEdit = {
          ...this.customTemplates[this.activeTemplateId],
        };
        templateToEdit.categories = [...templateToEdit.categories];
      }

      // Kategorie bearbeiten
      const index = templateToEdit.categories.indexOf(oldCategory);
      if (index !== -1) {
        templateToEdit.categories[index] = newCategory;
        this.customTemplates[this.activeTemplateId] = templateToEdit;
        this.saveToLocalStorage();
      }
    },

    // Kategorie löschen
    deleteCategory(category) {
      if (!this.currentCategories.includes(category)) return;

      // Stelle sicher, dass wir die vordefinierten Templates nicht verändern
      let templateToEdit = null;

      if (this.templates[this.activeTemplateId]) {
        // Erstelle eine Kopie als benutzerdefiniertes Template
        templateToEdit = {
          ...this.templates[this.activeTemplateId],
          categories: this.templates[
            this.activeTemplateId
          ].categories.filter((cat) => cat !== category),
        };
      } else {
        // Verwende das bestehende benutzerdefinierte Template
        templateToEdit = {
          ...this.customTemplates[this.activeTemplateId],
        };
        templateToEdit.categories = templateToEdit.categories.filter(
          (cat) => cat !== category
        );
      }

      this.customTemplates[this.activeTemplateId] = templateToEdit;
      this.saveToLocalStorage();
    },

    // Neues Template erstellen
    createTemplate(name, description = '', baseTemplateId = null) {
      if (!name || name.trim() === '') return null;

      // Template-ID aus dem Namen generieren
      const id =
        name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

      // Kategorien aus einem Basis-Template übernehmen oder leer starten
      let categories = [];
      if (baseTemplateId && this.allTemplates[baseTemplateId]) {
        categories = [
          ...this.allTemplates[baseTemplateId].categories,
        ];
      }

      // Neues Template erstellen
      const newTemplate = {
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

    // Template löschen (nur benutzerdefinierte)
    deleteTemplate(templateId) {
      if (!this.customTemplates[templateId]) return;

      delete this.customTemplates[templateId];

      // Falls das aktive Template gelöscht wurde, zurück zum Standard
      if (this.activeTemplateId === templateId) {
        this.activeTemplateId = defaultTemplateId;
      }

      this.saveToLocalStorage();
    },

    // Template bearbeiten (nur benutzerdefinierte)
    updateTemplate(templateId, name, description) {
      if (!this.customTemplates[templateId]) return;

      this.customTemplates[templateId] = {
        ...this.customTemplates[templateId],
        name: name || this.customTemplates[templateId].name,
        description:
          description || this.customTemplates[templateId].description,
      };

      this.saveToLocalStorage();
    },

    // Kategorien-Reihenfolge aktualisieren
    updateCategoryOrder(newOrder) {
      if (!Array.isArray(newOrder) || newOrder.length === 0) return;

      // Stelle sicher, dass wir die vordefinierten Templates nicht verändern
      let templateToEdit = null;

      if (this.templates[this.activeTemplateId]) {
        // Erstelle eine Kopie als benutzerdefiniertes Template, aber nur wenn die Reihenfolge sich ändert
        templateToEdit = {
          ...this.templates[this.activeTemplateId],
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

    // Daten im Local Storage speichern
    saveToLocalStorage() {
      try {
        localStorage.setItem(
          'categoryTemplates',
          JSON.stringify({
            activeTemplateId: this.activeTemplateId,
            customTemplates: this.customTemplates,
          })
        );
      } catch (error) {
        console.error(
          'Fehler beim Speichern der Kategorie-Vorlagen:',
          error
        );
      }
    },

    // Daten aus dem Local Storage laden
    loadFromLocalStorage() {
      try {
        const data = localStorage.getItem('categoryTemplates');
        if (data) {
          const parsedData = JSON.parse(data);

          if (parsedData.customTemplates) {
            this.customTemplates = parsedData.customTemplates;
          }

          if (
            parsedData.activeTemplateId &&
            (this.templates[parsedData.activeTemplateId] ||
              this.customTemplates[parsedData.activeTemplateId])
          ) {
            this.activeTemplateId = parsedData.activeTemplateId;
          }
        }
      } catch (error) {
        console.error(
          'Fehler beim Laden der Kategorie-Vorlagen:',
          error
        );
      }
    },

    // Alle Änderungen zurücksetzen
    resetToDefault() {
      this.customTemplates = {};
      this.activeTemplateId = defaultTemplateId;
      this.saveToLocalStorage();
    },
  },
});
