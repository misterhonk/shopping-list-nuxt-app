<template>
  <div class="min-h-screen bg-gray-100 dark:bg-dark-background transition-colors duration-200">
    <header class="bg-blue-600 dark:bg-blue-800 text-white shadow transition-colors duration-200">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Meine Einkaufsliste</h1>
        <DarkModeToggle />
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <slot />
        </div>
      </div>
    </main>
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