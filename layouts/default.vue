<template>
  <div class="min-h-screen bg-warmgray-50 dark:bg-dark-background theme-transition">
    <header class="bg-gradient-to-r from-brand-400 to-brand-600 dark:from-brand-700 dark:to-brand-500 text-white shadow-warmmd theme-transition">
      <div class="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 class="text-2xl font-display font-bold tracking-wide">Einkaufsliste</h1>
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
    <footer class="py-6 bg-warmgray-100 dark:bg-warmgray-900 text-warmgray-600 dark:text-warmgray-400 text-sm text-center theme-transition">
      <div class="max-w-5xl mx-auto px-4">
        <p>Mit ♥ erstellt · {{ new Date().getFullYear() }}</p>
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