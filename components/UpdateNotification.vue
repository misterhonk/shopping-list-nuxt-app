<template>
  <div
    v-if="showUpdateNotification"
    class="fixed bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white p-4 rounded-lg shadow-lg z-50 flex flex-col"
  >
    <div class="flex justify-between items-center">
      <h3 class="font-bold">Neue Version verfügbar!</h3>
      <button @click="dismissUpdate" class="ml-4 text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
    <p class="mt-2">Version {{ updateInfo.newVersion }} ist jetzt verfügbar.</p>
    <div class="flex justify-end mt-3">
      <button
        @click="applyAppUpdate"
        class="bg-white text-orange-500 px-4 py-2 rounded-md font-medium"
      >
        Jetzt aktualisieren
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

import { 
  checkForUpdates, 
  applyUpdate, 
  checkForWaitingServiceWorker, 
  forceServiceWorkerUpdate,
  type UpdateInfo 
} from '~/services/updateService';

const showUpdateNotification = ref(false);
const updateInfo = ref<UpdateInfo>({ hasUpdate: false });

onMounted(() => {
  // Prüfe auf App-Version Updates
  const result = checkForUpdates();
  updateInfo.value = result;
  
  if (result.hasUpdate) {
    showUpdateNotification.value = true;
  } else {
    // Wenn kein App-Version Update, prüfe auf Service Worker Updates
    checkForWaitingServiceWorker(hasWaitingWorker => {
      if (hasWaitingWorker) {
        // Service Worker wartet auf Update
        updateInfo.value = {
          hasUpdate: true,
          newVersion: 'neue Version'
        };
        showUpdateNotification.value = true;
      }
    });
  }
  
  // Registriere Event-Listener für Service Worker-Aktualisierungen
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Service Worker wurde aktualisiert
      if (!document.hidden) {
        window.location.reload();
      }
    });
  }
  
  // Regelmäßige Check-Intervalle für iOS
  const checkInterval = setInterval(() => {
    const result = checkForUpdates();
    if (result.hasUpdate && !showUpdateNotification.value) {
      updateInfo.value = result;
      showUpdateNotification.value = true;
    }
  }, 60 * 1000); // Jede Minute prüfen
  
  // Cleanup bei Komponenten-Unmount
  onBeforeUnmount(() => {
    clearInterval(checkInterval);
  });
});

function applyAppUpdate(): void {
  // Versuche zuerst, einen wartenden Service Worker zu aktivieren
  forceServiceWorkerUpdate();
  
  // Aktualisiere gespeicherte App-Version und lade neu
  applyUpdate();
}

function dismissUpdate(): void {
  showUpdateNotification.value = false;
}
</script>
