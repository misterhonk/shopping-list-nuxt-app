<template>
  <!-- Pinia Store Provider -->
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- PWA Installation-Benachrichtigung -->
    <div v-if="showPwaNotice" class="fixed bottom-0 left-0 right-0 p-4 bg-orange-500 text-white flex justify-between items-center z-50">
      <div class="font-medium">
        📣 Diese App kann installiert werden! Nutzen Sie die App auch offline.
      </div>
      <div class="flex space-x-2">
        <button @click="installPwa" class="px-3 py-1 bg-white text-orange-500 rounded-md text-sm font-medium">
          Installieren
        </button>
        <button @click="dismissPwaNotice" class="px-3 py-1 bg-orange-600 text-white rounded-md text-sm">
          Später
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// PWA Installation
const showPwaNotice = ref(false);

onMounted(() => {
  // Prüfen, ob die App bereits installiert ist oder der Hinweis ignoriert wurde
  const pwaNoticeDisabled = localStorage.getItem('pwaNoticeDisabled');
  const isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches;
  
  // Einmalige Verzögerung, um zu vermeiden, dass die Benachrichtigung sofort erscheint
  setTimeout(() => {
    showPwaNotice.value = !isPwaInstalled && pwaNoticeDisabled !== 'true';
  }, 3000);
});

// PWA installieren (wird automatisch vom Browser verarbeitet)
const installPwa = () => {
  showPwaNotice.value = false;
};

// PWA-Hinweis ignorieren
const dismissPwaNotice = () => {
  showPwaNotice.value = false;
  localStorage.setItem('pwaNoticeDisabled', 'true');
};
</script>
