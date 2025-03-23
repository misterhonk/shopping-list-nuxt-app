<template>
  <div ref="menuRef" class="header-menu">
    <!-- Menu toggle button -->
    <button class="menu-button" aria-label="Menu" @click.stop="toggleMenu">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        class="menu-icon"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div v-if="isMenuOpen" class="dropdown-menu">
      <div class="menu-item" @click="toggleDarkMode">
        <span>{{ themeStore.isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
        <svg
          v-if="themeStore.isDarkMode"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"
          />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"
          />
        </svg>
      </div>
      <div class="menu-item" @click="navigateToStatistics">
        <span>Statistik</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17ZM19 19H5V5H19V19.1ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
          />
        </svg>
      </div>
      <!-- More menu items can be added here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { useThemeStore } from '@/stores/theme';

// Stores
const themeStore = useThemeStore();

// Menu state
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// Toggle menu
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Close menu if clicked outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false;
  }
};

// Toggle dark mode
const toggleDarkMode = () => {
  themeStore.toggleDarkMode();
  isMenuOpen.value = false; // Close menu after action
};

// Navigate to statistics
const navigateToStatistics = () => {
  // Navigation logic here
  isMenuOpen.value = false; // Close menu after action
};

// Setup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header-menu {
  position: relative;
  display: inline-block;
}

.menu-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.menu-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.dark .menu-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-icon {
  fill: currentColor;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
  animation: menuFadeIn 0.2s ease;
}

.dark .dropdown-menu {
  background-color: #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-item span {
  font-size: 14px;
}

.menu-item svg {
  fill: currentColor;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
