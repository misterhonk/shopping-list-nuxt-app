<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-3">
          <HeaderMenu />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 shadow-inner mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Shopping List App &copy; {{ new Date().getFullYear() }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Version {{ appVersion }}</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import HeaderMenu from '~/components/layout/HeaderMenu.vue';
import { APP_VERSION } from '~/services/updateService';

// App-Version aus dem zentralen Service importieren
const appVersion: string = APP_VERSION;
</script>

<style>
html {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

body {
  @apply bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white;
}
</style>
