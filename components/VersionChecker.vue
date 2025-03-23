<template>
  <div class="fixed bottom-14 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg z-50">
    <div class="text-xs">
      <div class="flex justify-between items-center mb-1">
        <strong>Debug-Info</strong>
        <button class="text-white ml-2" @click="isExpanded = !isExpanded">
          <svg
            v-if="isExpanded"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div v-if="isExpanded">
        <p><strong>Version:</strong> {{ appVersion }}</p>
        <p><strong>Host:</strong> {{ hostname }}</p>
        <p><strong>SW:</strong> {{ hasSW ? 'Aktiv' : 'Inaktiv' }}</p>
        <p><strong>Stored:</strong> {{ storedVersion ?? 'Keine' }}</p>
        <p><strong>Build:</strong> {{ buildTime.split('T')[0] }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import { APP_VERSION, getStoredVersion } from '~/services/updateService';

// App-Metadaten
const appVersion = APP_VERSION;
const hostname = ref('');
const hasSW = ref(false);
const storedVersion = ref('');
// Aktuelle Zeit als Build-Zeitstempel
const buildTime = new Date().toISOString();
// Zustandsverwaltung
const isExpanded = ref(false);

onMounted(() => {
  // Hostname ermitteln
  hostname.value = window.location.hostname;

  // Service Worker Status prüfen
  hasSW.value = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  // Gespeicherte Version abrufen
  storedVersion.value = getStoredVersion() ?? 'Keine';
});
</script>
