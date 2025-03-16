<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-black text-gray-800 dark:text-gray-50">
      {{ title }}
    </h1>
    <slot name="actions"></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
