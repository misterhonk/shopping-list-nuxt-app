<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
    <header class="bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-700 dark:to-orange-500 text-white shadow-md theme-transition">
      <div class="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 class="text-2xl font-black tracking-tight">Einkaufsliste</h1>
        </div>
        <DarkModeToggle />
      </div>
    </header>
    <main class="py-8">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="theme-transition">
          <slot />
        </div>
      </div>
    </main>
    <footer class="py-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm text-center theme-transition">
      <div class="max-w-5xl mx-auto px-4">
        <p class="font-medium">Mit ♥ erstellt · {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>

<script>
import DarkModeToggle from '~/components/DarkModeToggle.vue';

export default {
  components: {
    DarkModeToggle
  }
}
</script>