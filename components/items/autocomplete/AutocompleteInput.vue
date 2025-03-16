<template>
  <div class="relative">
    <input
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
      @input="onInput"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      @keydown.down.prevent="navigateSuggestions(1)"
      @keydown.up.prevent="navigateSuggestions(-1)"
      @keydown.enter.prevent="selectSuggestion(highlightedIndex)"
      @keydown.esc="showSuggestions = false"
      ref="inputElement"
      v-bind="$attrs"
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
          <span v-html="highlightMatch(suggestion.text)"></span>
          <span v-if="suggestion.subtext" class="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {{ suggestion.subtext }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  minChars: {
    type: Number,
    default: 1,
  },
  placeholder: {
    type: String,
    default: '',
  },
  maxSuggestions: {
    type: Number,
    default: 6,
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

// Referenz zum Input-Element
const inputElement = ref(null);

// Zustand der Komponente
const inputValue = ref(props.modelValue);
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);

// Gefilterte Vorschläge basierend auf Eingabe
const filteredSuggestions = computed(() => {
  if (!inputValue.value || inputValue.value.length < props.minChars) {
    return [];
  }

  // Suche in allen Vorschlägen
  const filtered = props.suggestions
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
    .slice(0, props.maxSuggestions);

  return filtered;
});

// Markiere die übereinstimmenden Teile im Text
const highlightMatch = text => {
  if (!inputValue.value || inputValue.value.length < props.minChars) {
    return text;
  }

  const regex = new RegExp(`(${inputValue.value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<strong class="text-orange-500">$1</strong>');
};

// Eingabebehandlung
const onInput = () => {
  emit('update:modelValue', inputValue.value);
  showSuggestions.value = true;
  highlightedIndex.value = -1;
};

// Vorschläge mit Tasten navigieren
const navigateSuggestions = direction => {
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
const selectSuggestion = index => {
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
const handleBlur = () => {
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
  if (props.modelValue) {
    inputValue.value = props.modelValue;
  }
});
</script>
