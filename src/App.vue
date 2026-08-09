<template>
  <div class="app-container" data-theme="behance">
    
    <div class="sticky-header">
      <!-- Top Navbar -->
    <header class="top-navbar">
      <!-- Row 1: Logo -->
      <div class="navbar-row navbar-row-top">
        <div class="logo">LanreyLabs<span class="dot">.</span></div>
      </div>
      <!-- Row 2: Search bar full width -->
      <div class="navbar-row navbar-row-search">
        <div class="search-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search templates..." class="search-input" />
        </div>
      </div>
    </header>

    <!-- Horizontal Category Bar -->
    <div class="category-bar-wrapper">
      <div 
        class="category-bar" 
        ref="categoryBarRef"
        @mousedown="onMouseDown"
        @mouseleave="onMouseLeave"
        @mouseup="onMouseUp"
        @mousemove="onMouseMove"
        @wheel.prevent="onWheel"
      >
        <button 
          class="cat-pill"
          :class="{ active: selectedCategory === 'All' }"
          @click="handleCategorySelect('All')"
        >
          All
        </button>
        <button 
          v-for="cat in sortedCategories" 
          :key="cat"
          class="cat-pill"
          :class="{ active: selectedCategory === cat }"
          @click="handleCategorySelect(cat)"
        >
          {{ cat }}
        </button>
      </div>
    </div>
    </div>

    <!-- Main Grid Content -->
    <main class="main-content">
      <TemplateGrid 
        :items="filteredItems"
      />
    </main>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TemplateGrid from './components/TemplateGrid.vue';
import data from './data.json';

const categoryBarRef = ref<HTMLElement | null>(null);
let isDown = false;
let startX: number;
let scrollLeft: number;

const onMouseDown = (e: MouseEvent) => {
  isDown = true;
  if (!categoryBarRef.value) return;
  categoryBarRef.value.classList.add('is-dragging');
  startX = e.pageX - categoryBarRef.value.offsetLeft;
  scrollLeft = categoryBarRef.value.scrollLeft;
};

const onMouseLeave = () => {
  isDown = false;
  if (categoryBarRef.value) categoryBarRef.value.classList.remove('is-dragging');
};

const onMouseUp = () => {
  isDown = false;
  if (categoryBarRef.value) categoryBarRef.value.classList.remove('is-dragging');
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDown || !categoryBarRef.value) return;
  e.preventDefault();
  const x = e.pageX - categoryBarRef.value.offsetLeft;
  const walk = (x - startX) * 2; // Kecepatan geser
  categoryBarRef.value.scrollLeft = scrollLeft - walk;
};

const onWheel = (e: WheelEvent) => {
  if (categoryBarRef.value) {
    categoryBarRef.value.scrollLeft += e.deltaY;
  }
};

const categories = ref(data.categories || []);
const itemsMap = ref<Record<string, any>>(data.items || {});

const selectedCategory = ref('All');


const getPriority = (category: string) => {
  if (category === 'ReactBits') return 2;
  if (category === 'Magic UI' || category === 'OriginKit') return 3;
  return 1;
};

const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => getPriority(a) - getPriority(b));
});

const filteredItems = computed(() => {
  let items = [];
  if (selectedCategory.value === 'All') {
    items = Object.values(itemsMap.value).flat();
  } else {
    items = itemsMap.value[selectedCategory.value] || [];
  }
  return items.sort((a: any, b: any) => getPriority(a.category) - getPriority(b.category));
});

const handleCategorySelect = (category: string) => {
  selectedCategory.value = category;
};
</script>

<style scoped>
/* Sticky Header Wrapper */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-color);
  width: 100%;
  box-sizing: border-box;
  border-bottom: var(--nav-border);
}

/* Top Navbar */
.top-navbar {
  display: flex;
  flex-direction: column;
  padding: 0.875rem 1.25rem 0.75rem;
  background: var(--bg-color);
  box-sizing: border-box;
  width: 100%;
  gap: 0.65rem;
}

/* Navbar Rows */
.navbar-row {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.navbar-row-top {
  justify-content: space-between;
}

.navbar-row-search {
  width: 100%;
}

.logo {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}
.logo .dot {
  color: #0057ff;
}

/* Search Box — always full width of its row */
.search-container {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 0.55rem 1rem;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}
.search-icon {
  color: #999;
  margin-right: 0.5rem;
  flex-shrink: 0;
}
.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  min-width: 0;
  font-family: inherit;
  font-size: 0.9rem;
}

/* Category Bar */
.category-bar-wrapper {
  padding: 0.75rem 1.25rem 0.5rem;
  background: var(--bg-color);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.category-bar {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  /* Make sure pills don't get cut */
  padding-right: 1.25rem;
}

.category-bar::-webkit-scrollbar { display: none; }
.category-bar { -ms-overflow-style: none; scrollbar-width: none; }

.category-bar.is-dragging { cursor: grabbing; }
.category-bar.is-dragging .cat-pill {
  cursor: grabbing;
  pointer-events: none;
}

.cat-pill {
  background: var(--cat-bg);
  color: var(--cat-color);
  border: var(--cat-border);
  border-radius: var(--cat-radius);
  padding: 0.55rem 1rem;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.cat-pill:hover { background: var(--cat-hover-bg); }
.cat-pill.active {
  background: var(--cat-active-bg);
  color: var(--cat-active-color);
  border-color: transparent;
}

/* Main Content */
.main-content {
  flex: 1;
}
</style>
