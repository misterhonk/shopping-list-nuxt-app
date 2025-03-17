<template>
  <button
    class="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 hover-lift"
    :class="isDark ? 'bg-gray-800 text-orange-400' : 'bg-gray-100 text-gray-800'"
    aria-label="Dark Mode umschalten"
    @click="toggleDarkMode"
  >
    <transition name="theme-switch" mode="out-in">
      <svg
        v-if="isDark"
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </transition>
  </button>
</template>

<script setup lang="ts">
import { useDarkMode } from '~/composables/useDarkMode';

const { isDark, toggleDarkMode } = useDarkMode();
</script>

<style scoped>
.theme-switch-enter-active,
.theme-switch-leave-active {
  transition: all 0.3s ease;
}

.theme-switch-enter-from,
.theme-switch-leave-to {
  opacity: 0;
  transform: rotate(-30deg) scale(0.7);
}
</style>