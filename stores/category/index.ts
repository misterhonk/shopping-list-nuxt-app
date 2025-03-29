import { defineStore } from 'pinia';
import { ref, computed, markRaw } from 'vue';

import { diagnoseCategories } from '~/components/categories/testing-helper';
import {
  addCategory,
  updateCategory,
  deleteCategory,
  createTemplate,
  deleteTemplate,
} from '~/stores/category/operations';
import {
  loadSortConfigs,
  saveSortConfigs,
  getSortConfigForTemplate,
  updateSortConfig,
  sortCategories,
} from '~/stores/category/sorting';
import { saveCategoryData, loadCategoryData } from '~/stores/category/storage';
import { categoryTemplates, defaultTemplateId } from '~/stores/category/templates';
import { deepCopy } from '~/stores/category/utils';
import { createCategorySyncPlugin } from '~/stores/plugins/categorySyncPlugin';
import { createLogger } from '~/utils/logger';

// Import the interfaces
import type {
  ICategory,
  ICategoryTemplate,
  ICategorySortConfig,
  ITemplateCollection,
} from '~/types/app-types';

// Logger initialisieren
const _logger = createLogger('CategoryStore');
const PREFIX = '[CategoryStore]';

/**
 * Store für die Verwaltung von Kategorien und Templates
 */
export const useCategoryStore = defineStore('category', () => {
  // Zustand
  const activeTemplateId = ref<string>('');
  const customTemplates = ref<ITemplateCollection>({});
  const sortConfigs = ref<Record<string, ICategorySortConfig>>({});
  const eventBus = ref<any>(null);

  // Berechnete Eigenschaften

  /**
   * Alle verfügbaren Templates (Standard und benutzerdefiniert)
   */
  const templates = computed<ITemplateCollection>(() => ({
    ...categoryTemplates,
    ...customTemplates.value,
  }));

  /**
   * Das aktuell aktive Template
   */
  const currentTemplate = computed<ICategoryTemplate>(() => {
    const activeId = activeTemplateId.value || defaultTemplateId;
    return templates.value[activeId] || categoryTemplates[defaultTemplateId];
  });

  /**
   * Die Kategorien des aktuellen Templates
   */
  const currentCategories = computed<ICategory[]>(() => currentTemplate.value.categories || []);

  /**
   * Die Kategorien als ID-zu-Name-Mapping
   */
  const categoryMapping = computed<Record<string, string>>(() => {
    const mapping: Record<string, string> = {};
    for (const category of currentCategories.value) {
      mapping[category.id] = category.name;
    }
    return mapping;
  });

  /**
   * Gibt an, ob die benutzerdefinierte Sortierung aktiv ist
   */
  const isCustomSortActive = computed<boolean>(() => {
    const config = getSortConfig();
    return config.useCustomSort;
  });

  /**
   * Sortierte Kategorien für die Anzeige
   */
  const sortedCategories = computed<ICategory[]>(() =>
    sortCategories(currentCategories.value, currentTemplate.value, getSortConfig())
  );

  /**
   * Gibt die Sortierungskonfiguration für das aktuelle Template zurück
   */
  const getSortConfig = (): ICategorySortConfig =>
    getSortConfigForTemplate(currentTemplate.value.id, sortConfigs.value);

  /**
   * Alle Templates als Liste für UI-Komponenten
   */
  const templatesList = computed<ICategoryTemplate[]>(() => {
    const result: ICategoryTemplate[] = [];

    // Standardvorlagen hinzufügen
    for (const [_id, template] of Object.entries(categoryTemplates)) {
      result.push({
        ...template,
        isCustom: false,
      });
    }

    // Benutzerdefinierte Vorlagen hinzufügen
    for (const [_id, template] of Object.entries(customTemplates.value)) {
      result.push({
        ...template,
        isCustom: true,
      });
    }

    return result;
  });

  // Aktionen

  /**
   * Kategorie hinzufügen
   * @param name - Name der neuen Kategorie
   */
  const addCategoryAction = (name: string): void => {
    if (!name.trim()) {
      return;
    }

    const updatedTemplate = addCategory(currentTemplate.value, name.trim());

    // Template aktualisieren
    if (updatedTemplate) {
      updateTemplateAction(updatedTemplate);
    }
  };

  /**
   * Kategorie bearbeiten
   * @param category - Die zu bearbeitende Kategorie
   * @param newName - Der neue Name der Kategorie
   */
  const editCategory = (category: ICategory, newName: string): void => {
    if (!newName.trim() || newName === category.name) {
      return;
    }

    const updatedTemplate = updateCategory(currentTemplate.value, category, newName.trim());

    // Template aktualisieren
    if (updatedTemplate) {
      updateTemplateAction(updatedTemplate);

      // Event-Bus auslösen, um Änderungen in der App zu verbreiten
      if (eventBus.value && typeof eventBus.value.emit === 'function') {
        eventBus.value.emit(category.id, newName.trim());
      }
    }
  };

  /**
   * Kategorie löschen
   * @param category - Die zu löschende Kategorie
   */
  const deleteCategoryAction = (category: ICategory): void => {
    const updatedTemplate = deleteCategory(currentTemplate.value, category);

    // Template aktualisieren
    if (updatedTemplate) {
      updateTemplateAction(updatedTemplate);
    }
  };

  /**
   * Template aktivieren
   * @param templateId - Die ID des zu aktivierenden Templates
   */
  const activateTemplate = (templateId: string): void => {
    if (!templateId || !templates.value[templateId]) {
      activeTemplateId.value = defaultTemplateId;
    } else {
      activeTemplateId.value = templateId;
    }

    // Speichern
    saveToLocalStorage();
  };

  /**
   * Neues Template erstellen
   * @param name - Name des neuen Templates
   * @param description - Beschreibung des neuen Templates
   * @param baseTemplateId - Optionale ID eines Basis-Templates, von dem Kategorien übernommen werden sollen
   */
  const createTemplateAction = (
    name: string,
    description: string,
    baseTemplateId: string | null = null
  ): void => {
    if (!name.trim()) {
      return;
    }

    const baseTemplate = baseTemplateId ? templates.value[baseTemplateId] : null;

    const newTemplate = createTemplate(name.trim(), description.trim(), baseTemplate);

    // Template hinzufügen und aktivieren
    customTemplates.value = {
      ...customTemplates.value,
      [newTemplate.id]: newTemplate,
    };

    activateTemplate(newTemplate.id);
  };

  /**
   * Template aktualisieren
   * @param template - Das vollständige aktualisierte Template
   */
  const updateTemplateAction = (template: ICategoryTemplate): void => {
    if (!template.id) {
      return;
    }

    // Prüfen, ob es ein Standard- oder benutzerdefiniertes Template ist
    if (categoryTemplates[template.id]) {
      // Bei Standardvorlagen, Kategorien auch bei gleicher ID aktualisieren, falls Namen geändert wurden
      const _updatedTemplate = deepCopy(template);
      // Kategorien aus dem Standard-Template aktualisieren
      const result = updateTemplate(template);
      // Template aktualisieren
      customTemplates.value = {
        ...customTemplates.value,
        [template.id]: result,
      };
    } else {
      // Bei benutzerdefinierten Vorlagen direkt aktualisieren
      customTemplates.value = {
        ...customTemplates.value,
        [template.id]: template,
      };
    }

    // Speichern
    saveToLocalStorage();
  };

  /**
   * Template umbenennen/bearbeiten
   * @param templateId - Die ID des zu bearbeitenden Templates
   * @param name - Der neue Name des Templates
   * @param description - Die neue Beschreibung des Templates
   */
  const updateTemplate = (templateId: string, name: string, description: string): void => {
    if (!templateId || !templates.value[templateId]) {
      return;
    }

    const template = templates.value[templateId];
    const updatedTemplate = {
      ...template,
      name: name.trim() || template.name,
      description: description.trim() || template.description,
    };

    updateTemplateAction(updatedTemplate);
  };

  /**
   * Template löschen
   * @param templateId - Die ID des zu löschenden Templates
   */
  const deleteTemplateAction = (templateId: string): void => {
    // Standardvorlagen können nicht gelöscht werden
    if (!templateId || categoryTemplates[templateId]) {
      return;
    }

    const result = deleteTemplate(templateId, customTemplates.value);

    // Templates aktualisieren
    customTemplates.value = result;

    // Wenn das aktive Template gelöscht wurde, das Standard-Template aktivieren
    if (activeTemplateId.value === templateId) {
      activeTemplateId.value = defaultTemplateId;
    }

    // Speichern
    saveToLocalStorage();
  };

  /**
   * Alle benutzerdefinierten Vorlagen zurücksetzen
   */
  const resetToDefault = (): void => {
    customTemplates.value = {};
    activeTemplateId.value = defaultTemplateId;
    sortConfigs.value = {};
    saveToLocalStorage();
  };

  /**
   * Laden der benutzerdefinierten Vorlagen und der aktiven Vorlage aus dem localStorage
   */
  const loadFromLocalStorage = (): void => {
    try {
      // Kategoriedaten laden
      const data = loadCategoryData();

      if (data) {
        if (data.customTemplates) {
          customTemplates.value = data.customTemplates;
        }
        if (data.activeTemplateId) {
          activeTemplateId.value = data.activeTemplateId;
        } else {
          activeTemplateId.value = defaultTemplateId;
        }
      } else {
        activeTemplateId.value = defaultTemplateId;
      }

      // Sortierungskonfigurationen laden
      const configs = loadSortConfigs();
      if (configs) {
        sortConfigs.value = configs;
      }
    } catch (error) {
      _logger.error(`${PREFIX} Fehler beim Laden aus localStorage:`, error);
      activeTemplateId.value = defaultTemplateId;
    }
  };

  /**
   * Speichern der benutzerdefinierten Vorlagen und der aktiven Vorlage im localStorage
   */
  const saveToLocalStorage = (): void => {
    try {
      // Kategoriedaten speichern
      saveCategoryData(activeTemplateId.value, customTemplates.value);

      // Sortierungskonfigurationen speichern
      saveSortConfigs(sortConfigs.value);
    } catch (error) {
      _logger.error(`${PREFIX} Fehler beim Speichern in localStorage:`, error);
    }
  };

  /**
   * Sortierungsmodus umschalten
   */
  const toggleSortMode = (): void => {
    const config = getSortConfig();
    const newConfig: ICategorySortConfig = {
      ...config,
      useCustomSort: !config.useCustomSort,
    };

    // Wenn die benutzerdefinierte Sortierung aktiviert wird, aktuelle Reihenfolge als Standard setzen
    if (newConfig.useCustomSort && newConfig.customOrder.length === 0) {
      // Wenn eine Standard-Reihenfolge definiert ist, diese verwenden
      if (
        currentTemplate.value.defaultCategoryOrder &&
        currentTemplate.value.defaultCategoryOrder.length > 0
      ) {
        newConfig.customOrder = [...currentTemplate.value.defaultCategoryOrder];
      } else {
        // Sonst die aktuelle Reihenfolge (alphabetisch) verwenden
        newConfig.customOrder = currentCategories.value.map(cat => cat.id);
      }
    }

    // Konfiguration aktualisieren
    sortConfigs.value = updateSortConfig(newConfig, sortConfigs.value);

    // Speichern
    saveToLocalStorage();
  };

  /**
   * Benutzerdefinierte Sortierreihenfolge zurücksetzen
   */
  const resetToDefaultSort = (): void => {
    const config = getSortConfig();
    const newConfig: ICategorySortConfig = {
      ...config,
      useCustomSort: false,
      customOrder: [],
    };

    // Konfiguration aktualisieren
    sortConfigs.value = updateSortConfig(newConfig, sortConfigs.value);

    // Speichern
    saveToLocalStorage();
  };

  /**
   * Benutzerdefinierte Sortierreihenfolge aktualisieren
   * @param categoryIds - Die neue Reihenfolge der Kategorie-IDs
   */
  const updateCustomSortOrder = (categoryIds: string[]): void => {
    const config = getSortConfig();
    const newConfig: ICategorySortConfig = {
      ...config,
      customOrder: categoryIds,
    };

    // Konfiguration aktualisieren
    sortConfigs.value = updateSortConfig(newConfig, sortConfigs.value);

    // Speichern
    saveToLocalStorage();
  };

  /**
   * Event-Bus für Kategorieänderungen setzen
   * @param bus - Der zu verwendende Event-Bus
   */
  const setCategoryEventBus = (bus: any): void => {
    eventBus.value = markRaw(bus);
  };

  // Initialisierung
  try {
    // Event-Listener für das Diagnose-Feature
    const diagnosticRegistration = diagnoseCategories();
    if (typeof diagnosticRegistration === 'function') {
      _logger.debug(`${PREFIX} Diagnostisches System registriert.`);
    }
  } catch (error) {
    _logger.debug(`${PREFIX} Diagnostisches System nicht verfügbar:`, error);
  }

  // Plugin für App-Events
  const plugin = createCategorySyncPlugin({
    setBus: setCategoryEventBus,
  });

  return {
    // Zustand
    activeTemplateId,
    customTemplates,
    sortConfigs,
    // Berechnete Eigenschaften
    templates,
    currentTemplate,
    currentCategories,
    categoryMapping,
    isCustomSortActive,
    sortedCategories,
    templatesList,
    // Aktionen
    addCategory: addCategoryAction,
    editCategory,
    deleteCategory: deleteCategoryAction,
    activateTemplate,
    createTemplate: createTemplateAction,
    updateTemplate,
    deleteTemplate: deleteTemplateAction,
    resetToDefault,
    loadFromLocalStorage,
    toggleSortMode,
    resetToDefaultSort,
    updateCustomSortOrder,
    // Plugin
    categorySync: plugin,
  };
});
