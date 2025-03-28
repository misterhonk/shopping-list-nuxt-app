<template>
  <div class="relative">
    <input
      ref="inputElement"
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
      v-bind="$attrs"
      @input="onInput"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      @keydown.down.prevent="navigateSuggestions(1)"
      @keydown.up.prevent="navigateSuggestions(-1)"
      @keydown.enter.prevent="selectSuggestion(highlightedIndex)"
      @keydown.esc="showSuggestions = false"
    />

    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <ul>
        <li
          v-for="(suggestion, index) in filteredSuggestions"
          :key="index"
          class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
          :class="{ 'bg-gray-100 dark:bg-gray-700': index === highlightedIndex }"
          @mousedown.prevent="selectSuggestion(index)"
          @mouseover="highlightedIndex = index"
        >
          <span class="flex items-center">
            <template v-for="(part, idx) in splitTextForHighlight(suggestion.text)" :key="idx">
              <span v-if="part.highlight" class="text-orange-500 font-bold">{{ part.text }}</span>
              <span v-else>{{ part.text }}</span>
            </template>
          </span>
          <span v-if="suggestion.subtext" class="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {{ suggestion.subtext }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';

import type { ItemSuggestion } from '~/types/app-types';

// Hilfstypes (nicht aktiv genutzt)
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
interface _ITextPart {
  text: string;
  highlight: boolean;
}

type SuggestionInput = string | ItemSuggestion;

const props = withDefaults(
  defineProps<{
    modelValue: string;
    suggestions: SuggestionInput[];
    minChars?: number;
    placeholder?: string;
    maxSuggestions?: number;
  }>(),
  {
    modelValue: '',
    suggestions: () => [],
    minChars: 1,
    placeholder: '',
    maxSuggestions: 6,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', suggestion: ItemSuggestion): void;
}>();

// Referenz zum Input-Element
const inputElement = ref<HTMLInputElement | null>(null);

// Zustand der Komponente
const inputValue = ref<string>(_props.modelValue);
const showSuggestions = ref<boolean>(false);
const highlightedIndex = ref<number>(-1);

// Gefilterte Vorschläge basierend auf Eingabe
const filteredSuggestions = computed<ItemSuggestion[]>(() => {
  if (!inputValue.value || inputValue.value.length < _props.minChars) {
    return [];
  }

  // Suche in allen Vorschlägen
  return props.suggestions
    .filter(suggestion => {
      // Wenn das Objekt ein 'text'-Feld hat, prüfe dieses
      const searchText =
        typeof suggestion === 'object' && suggestion.text ? suggestion.text : String(suggestion);

      return searchText.toLowerCase().includes(inputValue.value.toLowerCase());
    })
    .map(suggestion => {
      // Normalisiere das Ausgabeformat
      if (typeof suggestion === 'object' && suggestion.text) {
        return suggestion;
      }
      return { text: String(suggestion) };
    })
    .slice(0, _props.maxSuggestions);
});

// Teilt den Text in hervorgehobene und normale Teile
interface IHighlightTextPart {
  text: string;
  highlight: boolean;
}

const splitTextForHighlight = (text: string): IHighlightTextPart[] => {
  if (!inputValue.value || inputValue.value.length < _props.minChars) {
    return [{ text, highlight: false }];
  }

  const inputRegex = new RegExp(inputValue.value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
  const parts: IHighlightTextPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = inputRegex.exec(text)) !== null) {
    // Text vor dem Match
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        highlight: false,
      });
    }

    // Der hervorgehobene Teil
    parts.push({
      text: match[0],
      highlight: true,
    });

    lastIndex = match.index + match[0].length;
  }

  // Text nach dem letzten Match
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      highlight: false,
    });
  }

  return parts.length ? parts : [{ text, highlight: false }];
};

// Eingabebehandlung
const onInput = (): void => {
  emit('update:modelValue', inputValue.value);
  showSuggestions.value = true;
  highlightedIndex.value = -1;
};

// Vorschläge mit Tasten navigieren
const navigateSuggestions = (direction: number): void => {
  if (!showSuggestions.value || filteredSuggestions.value.length === 0) {
    return;
  }

  const newIndex = highlightedIndex.value + direction;

  if (newIndex >= filteredSuggestions.value.length) {
    highlightedIndex.value = 0;
  } else if (newIndex < 0) {
    highlightedIndex.value = filteredSuggestions.value.length - 1;
  } else {
    highlightedIndex.value = newIndex;
  }
};

// Vorschlag auswählen
const selectSuggestion = (index: number): void => {
  if (index < 0 || index >= filteredSuggestions.value.length) {
    return;
  }

  const selected = filteredSuggestions.value[index];
  inputValue.value = selected.text;
  emit('update:modelValue', selected.text);
  emit('select', selected);

  showSuggestions.value = false;
  highlightedIndex.value = -1;

  // Fokus auf dem Input behalten
  nextTick(() => {
    if (inputElement.value) {
      inputElement.value.focus();
    }
  });
};

// Behandlung für Blur-Event
const handleBlur = (): void => {
  // Verzögerung hinzufügen, damit mousedown-Event auf Vorschlägen zuerst ausgelöst wird
  setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
};

// Wenn sich der externe Wert ändert, Input aktualisieren
watch(
  () => props.modelValue,
  newValue => {
    inputValue.value = newValue;
  }
);

// Bei der Initialisierung
onMounted(() => {
  if (_props.modelValue) {
    inputValue.value = _props.modelValue;
  }
});
</script>
