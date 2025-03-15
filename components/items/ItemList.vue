<template>
  <div class="mb-8">
    <h3 class="font-bold text-xl text-orange-500 mb-3">Alle Artikel:</h3>
    <ul v-if="items.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
      <ItemListItem 
        v-for="item in items" 
        :key="item.id"
        :item="item"
        @toggle="$emit('toggle', item.id)"
        @remove="$emit('remove', item.id)"
      />
    </ul>
    <EmptyState v-else @add="$emit('add-new')" />
  </div>
</template>

<script setup>
import ItemListItem from './ItemListItem.vue';
import EmptyState from './EmptyState.vue';

defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

defineEmits(['toggle', 'remove', 'add-new']);
</script>
