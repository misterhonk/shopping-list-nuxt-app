// Logger initialisieren
import { ref, computed, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';

import CategoryModals from './modals/CategoryModals.vue';
import { diagnoseCategories } from '~/components/categories/testing-helper';
import { useCategoryStore } from '~/stores/category';
import { defaultTemplateId } from '~/stores/category/templates';
import { generateCategoryId } from '~/stores/category/utils';
import { createLogger } from '~/utils/logger';

export default {
  name: 'CategoryManager',
  components: {
    draggable,
    CategoryModals,
  },
  setup() {
    const logger = createLogger('CategoryManager');

    // Wrapper für den Pinia-Store mit Fehlerbehandlung
    let categoryStore = null;
    try {
      categoryStore = useCategoryStore();
    } catch (e) {
      logger.error('Fehler beim Initialisieren des CategoryStore:', e);
    }

    // Daten aus dem Store
    const templatesList = computed(() => categoryStore?.templatesList ?? []);
    const currentTemplate = computed(
      () => categoryStore?.currentTemplate ?? { name: 'Standard', categories: [] }
    );

    // Explizites Template mit direktem Zugriff auf den Store
    const currentCategories = computed(() => {
      // Immer die aktuellste Version direkt aus dem Store nehmen
      if (categoryStore) {
        const cats = categoryStore.currentCategories;
        logger.info('currentCategories computed neu ausgeführt:', cats);
        return cats;
      }
      return [];
    });

    // Sortierungsbezogene Computed-Properties
    const isCustomSortActive = computed(() => categoryStore?.isCustomSortActive ?? false);
    const hasDefaultOrder = computed(() =>
      Boolean(currentTemplate.value.defaultCategoryOrder?.length)
    );

    // Sortierbare Kategorien für Drag & Drop
    const sortableCategoriesArray = computed({
      get: () => {
        if (categoryStore) {
          // Wir verwenden die sortierte Kategorieliste vom Store
          return categoryStore.sortedCategories;
        }
        return [...currentCategoriesArray.value];
      },
      set: newOrder => {
        if (categoryStore && Array.isArray(newOrder)) {
          // IDs der neu sortierten Kategorien an den Store senden
          const categoryIds = newOrder.map(cat => cat.id);
          categoryStore.updateCustomSortOrder(categoryIds);
          // Das setzt auch automatisch useCustomSort auf true
        }
      },
    });

    const activeTemplateId = computed(() => categoryStore?.activeTemplateId ?? '');
    const isTemplateCustom = computed(
      () =>
        categoryStore?.customTemplates &&
        categoryStore.customTemplates[activeTemplateId.value] !== undefined
    );

    // UI-Zustand
    const showNewCategoryModal = ref(false);
    const showEditCategoryModal = ref(false);
    const showNewTemplateModal = ref(false);
    const showEditTemplateModal = ref(false);
    const showDeleteTemplateModal = ref(false);

    // Formulardaten
    const newCategoryName = ref('');
    const editCategoryName = ref('');
    const currentEditingCategory = ref('');

    // Komponenten-Key für Neurendering
    const componentKey = ref(0);

    // Array für Kategorien mit zusätzlicher Reaktivität und Kompatibilität
    const currentCategoriesArray = computed(() => {
      // Explizit ein neues Array zurückgeben, damit Vue die Änderungen erkennt
      const categories = [...currentCategories.value];

      // Kompatibilitätsprüfung: Konvertiere String-Kategorien zu Objekten für die Anzeige
      return categories.map(category => {
        if (typeof category === 'string') {
          // Altformat: String-Kategorie in kompatibles Objekt konvertieren
          return { id: generateCategoryId(category), name: category };
        } else if (typeof category === 'object' && category !== null) {
          // Neues Format: Kategorie-Objekt mit ID und Name
          return category;
        } else {
          // Fallback für unbekannte Formate
          logger.warn('Unbekanntes Kategorieformat:', category);
          return { id: `unknown_${Date.now()}`, name: 'Unbekannt' };
        }
      });
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
    watch(currentCategories, newVal => {
      logger.info('Aktuelle Kategorien geändert:', newVal);
      // Force Component Re-render
      componentKey.value += 1;
    });

    const newTemplate = ref({
      name: '',
      description: '',
      baseTemplateId: '',
    });

    const editTemplate = ref({
      name: '',
      description: '',
    });

    // Beim Laden der Komponente
    onMounted(() => {
      if (categoryStore) {
        try {
          categoryStore.loadFromLocalStorage();

          // Aktiviere das aktuelle Template, falls die Komponente in einen leeren Zustand geladen wird
          if (!categoryStore.activeTemplateId) {
            categoryStore.activateTemplate(defaultTemplateId);
          }

          // Komponente explizit neu rendern, sobald sie geladen ist
          componentKey.value = 1;
        } catch (e) {
          logger.error('Fehler beim Laden aus localStorage:', e);
        }
      }
    });

    // Methoden
    const activateTemplate = (templateId) => {
      if (!categoryStore) {
        return;
      }
      categoryStore.activateTemplate(templateId);
    };

    // Sortierungsmethoden
    const toggleSortMode = () => {
      if (!categoryStore) {
        return;
      }
      categoryStore.toggleSortMode();
    };

    const resetToDefaultSort = () => {
      if (!categoryStore) {
        return;
      }
      categoryStore.resetToDefaultSort();
    };

    const addNewCategory = () => {
      if (!categoryStore) {
        return;
      }
      if (newCategoryName.value.trim()) {
        categoryStore.addCategory(newCategoryName.value.trim());
        newCategoryName.value = '';
        showNewCategoryModal.value = false;

        // Komponente explizit neu rendern
        componentKey.value += 1;

        // Sicherstellen, dass die Änderungen auch sichtbar sind
        setTimeout(() => {
          componentKey.value += 1;
        }, 100);
      }
    };

    const editCategory = (category) => {
      currentEditingCategory.value = category;
      editCategoryName.value = category.name;
      showEditCategoryModal.value = true;
    };

    const saveEditedCategory = () => {
      if (!categoryStore) {
        return;
      }
      if (editCategoryName.value.trim() && currentEditingCategory.value) {
        logger.info('saveEditedCategory aufgerufen mit:', {
          category: currentEditingCategory.value,
          neuName: editCategoryName.value.trim(),
        });

        // Wir brauchen eine Referenz zur Kategorie, bevor wir das Modal schließen
        const categoryToEdit = currentEditingCategory.value;
        const newName = editCategoryName.value.trim();

        // Modal schließen und Felder zurücksetzen
        showEditCategoryModal.value = false;
        currentEditingCategory.value = null;
        editCategoryName.value = '';

        // Jetzt erst die Kategorie bearbeiten
        try {
          // Direkter Test mit dem Store
          logger.info(
            'Bearbeite Kategorie',
            categoryToEdit.id,
            'von',
            categoryToEdit.name,
            'zu',
            newName
          );
          categoryStore.editCategory(categoryToEdit, newName);

          // Diagnose und direktes Update der Einkaufslisten
          const updateFn = diagnoseCategories();
          if (typeof updateFn === 'function') {
            // Direkte Aktualisierung aller Artikel mit dieser Kategorie
            updateFn(categoryToEdit.id, newName);
          }

          // Komponente explizit neu rendern
          componentKey.value += 1;

          // Einen weiteren Versuch starten, falls das erste Update nicht funktioniert hat
          setTimeout(() => {
            try {
              // Sicherstellen, dass die Bearbeitung angewendet wurde
              categoryStore.loadFromLocalStorage();

              // Nochmals Komponente neu rendern
              componentKey.value += 1;
              logger.info('Kategorien nach erneutem Laden:', categoryStore.currentCategories);
            } catch (e) {
              logger.error('Fehler beim Neuladen:', e);
            }
          }, 200);
        } catch (error) {
          logger.error('Fehler bei saveEditedCategory:', error);
          alert('Es gab ein Problem beim Speichern der Änderung.');
        }
      }
    };

    const deleteCategory = (category) => {
      if (!categoryStore) {
        return;
      }

      const confirmText = `Möchten Sie die Kategorie "${category.name}" wirklich löschen?`;

      if (confirm(confirmText)) {
        categoryStore.deleteCategory(category);

        // Komponente explizit neu rendern
        componentKey.value += 1;

        // Sicherstellen, dass die Änderungen auch sichtbar sind
        setTimeout(() => {
          componentKey.value += 1;
        }, 100);
      }
    };

    const createNewTemplate = () => {
      if (!categoryStore) {
        return;
      }
      if (newTemplate.value.name.trim()) {
        categoryStore.createTemplate(
          newTemplate.value.name.trim(),
          newTemplate.value.description.trim(),
          newTemplate.value.baseTemplateId ?? null
        );

        newTemplate.value = {
          name: '',
          description: '',
          baseTemplateId: '',
        };

        showNewTemplateModal.value = false;
      }
    };

    const confirmDeleteTemplate = () => {
      showDeleteTemplateModal.value = true;
    };

    const deleteCurrentTemplate = () => {
      if (!categoryStore) {
        return;
      }
      categoryStore.deleteTemplate(activeTemplateId.value);
      showDeleteTemplateModal.value = false;
    };

    const saveEditedTemplate = () => {
      if (!categoryStore) {
        return;
      }
      if (editTemplate.value.name.trim()) {
        categoryStore.updateTemplate(
          activeTemplateId.value,
          editTemplate.value.name.trim(),
          editTemplate.value.description.trim()
        );

        showEditTemplateModal.value = false;
      }
    };

    const resetToDefaults = () => {
      if (!categoryStore) {
        return;
      }
      if (
        confirm(
          'Möchten Sie wirklich alle benutzerdefinierten Vorlagen zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.'
        )
      ) {
        categoryStore.resetToDefault();
      }
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
      activateTemplate,
      toggleSortMode,
      resetToDefaultSort,
      addNewCategory,
      editCategory,
      saveEditedCategory,
      deleteCategory,
      createNewTemplate,
      confirmDeleteTemplate,
      deleteCurrentTemplate,
      saveEditedTemplate,
      resetToDefaults,
    };
  },
};
