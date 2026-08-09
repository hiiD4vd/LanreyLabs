<template>
  <div class="app-container" data-theme="behance">
    
    <div class="sticky-header">
      <!-- Top Navbar -->
    <header class="top-navbar">
      <div class="logo">Showcase<span class="dot">.</span></div>
      
      <div class="search-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search by Templates..." class="search-input" />
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
  max-width: 100vw;
}

/* Top Navbar */
.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: var(--nav-border);
  background: var(--bg-color);
  flex-shrink: 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.05em;
}
.logo .dot {
  color: #0057ff;
}

.search-container {
  display: flex;
  align-items: center;
  background: #f4f4f4;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  flex: 1;
  max-width: 400px;
}
[data-theme="behance"] .search-container {
  background: #ffffff;
  border: 1px solid #ebebeb;
}
.search-icon {
  color: #888;
  margin-right: 0.5rem;
}
.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-family: inherit;
  font-size: 0.95rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Category Bar */
.category-bar-wrapper {
  padding: 1.5rem 2rem 0.5rem;
  background: var(--bg-color);
  flex-shrink: 0;
  width: 100%;
}

.category-bar {
  display: flex;
  gap: 0.8rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

/* Hide scrollbar for category bar */
.category-bar::-webkit-scrollbar {
  display: none;
}
.category-bar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.category-bar.is-dragging {
  cursor: grabbing;
}
.category-bar.is-dragging .cat-pill {
  cursor: grabbing;
  pointer-events: none; /* Mencegah tombol terpencet saat digeser */
}

.cat-pill {
  background: var(--cat-bg);
  color: var(--cat-color);
  border: var(--cat-border);
  border-radius: var(--cat-radius);
  padding: 0.6rem 1.2rem;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.cat-pill:hover {
  background: var(--cat-hover-bg);
}

.cat-pill.active {
  background: var(--cat-active-bg);
  color: var(--cat-active-color);
  border-color: transparent;
}

/* Main Content */
.main-content {
  flex: 1;
}

@media (max-width: 600px) {
  .top-navbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }
  .search-container {
    max-width: 100%;
    width: 100%;
  }
  .category-bar-wrapper {
    padding: 1rem 1rem 0.5rem;
  }
}
</style>
