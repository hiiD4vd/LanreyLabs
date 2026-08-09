<template>
  <div class="template-grid">
    <div class="grid-content">
      <TemplateCard 
        v-for="item in displayedItems" 
        :key="item.id" 
        :item="item"
      />
      <!-- Sentinel element for infinite scroll -->
      <div ref="sentinelRef" class="sentinel"></div>

      <div v-if="items.length === 0" class="empty-state">
        No components found for this category.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import TemplateCard from './TemplateCard.vue';

const props = defineProps<{
  items: Array<{
    id: string;
    title: string;
    mediaUrl: string;
    mediaType: string;
    codeUrl: string;
  }>;
}>();

defineEmits(['select']);

const displayedCount = ref(20);
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const displayedItems = computed(() => {
  return props.items.slice(0, displayedCount.value);
});

// Reset count when categories/items change
watch(() => props.items, () => {
  displayedCount.value = 20;
});

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && displayedCount.value < props.items.length) {
      // Load more items
      displayedCount.value += 20;
    }
  }, {
    rootMargin: '200px', // Trigger slightly before the user reaches the bottom
  });

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.template-grid {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--grid-min-col, 300px), 1fr));
  gap: var(--grid-gap, 2rem);
  padding: var(--grid-padding-y, 2rem) var(--grid-padding-x, 2rem) 4rem var(--grid-padding-x, 2rem);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.sentinel {
  grid-column: 1 / -1;
  height: 20px;
}
</style>
