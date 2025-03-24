// Logger initialisieren
import { ref, computed, onMounted, watch, defineComponent } from 'vue';
import draggable from 'vuedraggable';

import { diagnoseCategories } from '~/components/categories/testing-helper';
import { useCategoryStore } from '~/stores/category';
import { defaultTemplateId } from '~/stores/category/templates';
import { generateCategoryId } from '~/stores/category/utils';
import { createLogger } from '~/utils/logger';

// Import der CategoryModals Komponente
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Die Komponente existiert zur Laufzeit, aber der Typ ist nicht definiert
import CategoryModals from './modals/CategoryModals.vue';

import type { ICategory, ICategoryTemplate } from '~/types/app-types';

// Template für neues/bearbeitbares Template
interface INewTemplate {
  name: string;
  description: string;
  baseTemplateId: string;
}

interface IEditTemplate {
  name: string;
  description: string;
}

export default defineComponent({
  name: 'CategoryManager',
  components: {
    draggable,
    CategoryModals,
  },
  setup() {
    const _logger = createLogger('CategoryManager');

    // Wrapper für den Pinia-Store mit Fehlerbehandlung
    let categoryStore = null;
    try {
      categoryStore = useCategoryStore();
    } catch (e) {
      _logger.error('Fehler beim Initialisieren des CategoryStore:', e);
    }

    // Daten aus dem Store
    const templatesList = computed<ICategoryTemplate[]>(() => categoryStore?.templatesList ?? []);
    const currentTemplate = computed<ICategoryTemplate>(
      () => categoryStore?.currentTemplate ?? { id: '', name: 'Standard', categories: [] }
    );

    // Kategorien-Daten
    const currentCategories = computed<ICategory[]>(() => {
      if (categoryStore) {
        return categoryStore.currentCategories;
      }
      return [];
    });

    // Sortierungsbezogene Computed-Properties
    const isCustomSortActive = computed<boolean>(() => categoryStore?.isCustomSortActive ?? false);
    const hasDefaultOrder = computed<boolean>(() =>
      Boolean(currentTemplate.value.defaultCategoryOrder?.length)
    );

    // Sortierbare Kategorien für Drag & Drop
    const sortableCategoriesArray = computed({
      get: (): ICategory[] => {
        if (categoryStore) {
          return categoryStore.sortedCategories;
        }
        return [...currentCategoriesArray.value];
      },
      set: (newOrder: ICategory[]) => {
        if (categoryStore && Array.isArray(newOrder)) {
          const categoryIds = newOrder.map(cat => cat.id);
          categoryStore.updateCustomSortOrder(categoryIds);
        }
      },
    });

    const activeTemplateId = computed<string>(() => categoryStore?.activeTemplateId ?? '');
    const isTemplateCustom = computed<boolean>(() => {
      if (categoryStore && categoryStore.customTemplates) {
        return categoryStore.customTemplates[activeTemplateId.value] !== undefined;
      }
      return false;
    });

    // UI-Zustand
    const showNewCategoryModal = ref<boolean>(false);
    const showEditCategoryModal = ref<boolean>(false);
    const showNewTemplateModal = ref<boolean>(false);
    const showEditTemplateModal = ref<boolean>(false);
    const showDeleteTemplateModal = ref<boolean>(false);

    // Formulardaten
    const newCategoryName = ref<string>('');
    const editCategoryName = ref<string>('');
    const currentEditingCategory = ref<ICategory | null>(null);

    // Komponenten-Key für Neurendering
    const componentKey = ref<number>(0);

    // Konvertierung von String-Kategorien zu Kategorie-Objekten
    const convertCategory = (category: unknown): ICategory => {
      if (typeof category === 'string') {
        return { id: generateCategoryId(category), name: category };
      } else if (typeof category === 'object' && category !== null) {
        return category as ICategory;
      } else {
        _logger.warn('Unbekanntes Kategorieformat:', category);
        return { id: `unknown_${Date.now()}`, name: 'Unbekannt' };
      }
    };

    // Array für Kategorien mit zusätzlicher Reaktivität und Kompatibilität
    const currentCategoriesArray = computed<ICategory[]>(() => {
      // Explizit ein neues Array zurückgeben, damit Vue die Änderungen erkennt
      const categories = [...currentCategories.value];
      return categories.map(convertCategory);
    });

    // Drag & Drop Konfiguration
    const dragOptions = computed(() => ({
      animation: 200,
      group: 'categories',
      disabled: !isCustomSortActive.value,
      ghostClass: 'ghost',
      dragClass: 'dragging',
    }));

    // Debug-Watcher für Kategorieänderungen
    watch(currentCategories, () => {
      // Force Component Re-render
      componentKey.value += 1;
    });

    const newTemplate = ref<INewTemplate>({
      name: '',
      description: '',
      baseTemplateId: '',
    });

    const editTemplate = ref<IEditTemplate>({
      name: '',
      description: '',
    });

    // Beim Laden der Komponente
    onMounted(() => {
      if (!categoryStore) return;
      
      try {
        categoryStore.loadFromLocalStorage();

        // Aktiviere das aktuelle Template, falls die Komponente in einen leeren Zustand geladen wird
        if (!categoryStore.activeTemplateId) {
          categoryStore.activateTemplate(defaultTemplateId);
        }

        // Komponente explizit neu rendern, sobald sie geladen ist
        componentKey.value = 1;
      } catch (e) {
        _logger.error('Fehler beim Laden aus localStorage:', e);
      }
    });

    // ---- Methoden zum Umgang mit Templates ----
    
    // Template aktivieren
    const activateTemplate = (templateId: string): void => {
      if (!categoryStore) return;
      categoryStore.activateTemplate(templateId);
    };

    // Neues Template erstellen
    const createNewTemplate = (): void => {
      if (!categoryStore) return;
      
      if (!newTemplate.value.name.trim()) return;
      
      categoryStore.createTemplate(
        newTemplate.value.name.trim(),
        newTemplate.value.description.trim(),
        newTemplate.value.baseTemplateId || null
      );

      newTemplate.value = {
        name: '',
        description: '',
        baseTemplateId: '',
      };

      showNewTemplateModal.value = false;
    };

    // Template löschen Bestätigung anzeigen
    const confirmDeleteTemplate = (): void => {
      showDeleteTemplateModal.value = true;
    };

    // Template tatsächlich löschen
    const deleteCurrentTemplate = (): void => {
      if (!categoryStore) return;
      categoryStore.deleteTemplate(activeTemplateId.value);
      showDeleteTemplateModal.value = false;
    };

    // Bearbeitetes Template speichern
    const saveEditedTemplate = (): void => {
      if (!categoryStore || !editTemplate.value.name.trim()) return;
      
      categoryStore.updateTemplate(
        activeTemplateId.value,
        editTemplate.value.name.trim(),
        editTemplate.value.description.trim()
      );

      showEditTemplateModal.value = false;
    };

    // Auf Standardwerte zurücksetzen
    const resetToDefaults = (): void => {
      if (!categoryStore) return;
      
      const confirmMessage = 'Möchten Sie wirklich alle benutzerdefinierten Vorlagen zurücksetzen? ' + 
                            'Diese Aktion kann nicht rückgängig gemacht werden.';
                            
      if (confirm(confirmMessage)) {
        categoryStore.resetToDefault();
      }
    };

    // ---- Methoden zum Umgang mit Sortierung ----
    
    // Sortierungsmodus umschalten
    const toggleSortMode = (): void => {
      if (!categoryStore) return;
      categoryStore.toggleSortMode();
    };

    // Auf Standardsortierung zurücksetzen
    const resetToDefaultSort = (): void => {
      if (!categoryStore) return;
      categoryStore.resetToDefaultSort();
    };

    // ---- Methoden zum Umgang mit Kategorien ----
    
    // Neue Kategorie hinzufügen
    const addNewCategory = (): void => {
      if (!categoryStore || !newCategoryName.value.trim()) return;
      
      categoryStore.addCategory(newCategoryName.value.trim());
      newCategoryName.value = '';
      showNewCategoryModal.value = false;
      
      // Komponente neu rendern
      forceRerender();
    };

    // Kategorie bearbeiten (Formular öffnen)
    const editCategory = (category: ICategory): void => {
      currentEditingCategory.value = category;
      editCategoryName.value = category.name;
      showEditCategoryModal.value = true;
    };

    // Bearbeitete Kategorie speichern
    const saveEditedCategory = (): void => {
      if (!categoryStore || !currentEditingCategory.value || !editCategoryName.value.trim()) return;
      
      // Referenzen zur besseren Lesbarkeit
      const categoryToEdit = currentEditingCategory.value;
      const newName = editCategoryName.value.trim();
      
      // Modal schließen und Felder zurücksetzen
      showEditCategoryModal.value = false;
      currentEditingCategory.value = null;
      editCategoryName.value = '';
      
      try {
        // Kategorie bearbeiten
        categoryStore.editCategory(categoryToEdit, newName);
        
        // Diagnose und Aktualisierung aller Artikel mit dieser Kategorie
        updateCategoryReferences(categoryToEdit.id, newName);
        
        // Komponente neu rendern
        forceRerender();
        
        // Verzögertes erneutes Laden zur Sicherstellung der Aktualisierung
        setTimeout(() => {
          if (categoryStore) {
            categoryStore.loadFromLocalStorage();
            forceRerender();
          }
        }, 200);
      } catch (error) {
        _logger.error('Fehler bei saveEditedCategory:', error);
        alert('Es gab ein Problem beim Speichern der Änderung.');
      }
    };

    // Kategorie löschen
    const deleteCategory = (category: ICategory): void => {
      if (!categoryStore) return;
      
      const confirmText = `Möchten Sie die Kategorie "${category.name}" wirklich löschen?`;
      
      if (confirm(confirmText)) {
        categoryStore.deleteCategory(category);
        forceRerender();
      }
    };

    // Hilfsfunktionen

    // Kategorie-Referenzen in Artikeln aktualisieren
    const updateCategoryReferences = (categoryId: string, newName: string): void => {
      const updateFn = diagnoseCategories();
      if (typeof updateFn === 'function') {
        updateFn(categoryId, newName);
      }
    };

    // Komponente neu rendern
    const forceRerender = (): void => {
      componentKey.value += 1;
      
      // Sicherstellen, dass die Änderungen auch sichtbar sind
      setTimeout(() => {
        componentKey.value += 1;
      }, 100);
    };

    return {
      templatesList,
      currentTemplate,
      currentCategories,
      sortedCategories: categoryStore?.sortedCategories,
      isCustomSortActive,
      hasDefaultOrder,
      sortableCategoriesArray,
      activeTemplateId,
      isTemplateCustom,
      showNewCategoryModal,
      showEditCategoryModal,
      showNewTemplateModal,
      showEditTemplateModal,
      showDeleteTemplateModal,
      newCategoryName,
      editCategoryName,
      currentEditingCategory,
      componentKey,
      currentCategoriesArray,
      dragOptions,
      newTemplate,
      editTemplate,
      // Template-Methoden
      activateTemplate,
      createNewTemplate,
      confirmDeleteTemplate,
      deleteCurrentTemplate,
      saveEditedTemplate,
      resetToDefaults,
      // Sortierungs-Methoden
      toggleSortMode,
      resetToDefaultSort,
      // Kategorie-Methoden
      addNewCategory,
      editCategory,
      saveEditedCategory,
      deleteCategory
    };
  },
});
