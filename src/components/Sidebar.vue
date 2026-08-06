<template>
  <aside class="sidebar glass">
    <div class="sidebar-header">
      <h2 class="title">PRO-Level Components</h2>
    </div>
    
    <div class="categories-list">
      <button 
        class="category-btn"
        :class="{ active: selectedCategory === 'All' }"
        @click="$emit('select', 'All')"
      >
        All
      </button>
      
      <button 
        v-for="cat in categories" 
        :key="cat"
        class="category-btn"
        :class="{ active: selectedCategory === cat }"
        @click="$emit('select', cat)"
      >
        {{ cat }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[];
  selectedCategory: string;
}>();

defineEmits(['select']);
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: var(--sidebar-border);
  background: var(--sidebar-bg);
  padding: 1.5rem 1rem;
}

.sidebar-header {
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.02em;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
}

.category-btn {
  background: rgba(0, 0, 0, 0.05);
  border: var(--card-border-width, 1px) solid transparent;
  color: var(--text-muted);
  padding: 0.8rem 1rem;
  border-radius: var(--card-radius, 8px);
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.category-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-color);
}

[data-theme="glass"] .category-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
[data-theme="glass"] .category-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-btn.active {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-hover);
}

[data-theme="neo-brutalism"] .category-btn {
  border-color: #000;
  background: #fff;
  color: #000;
}
[data-theme="neo-brutalism"] .category-btn.active {
  background: var(--accent-color);
  box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
}
[data-theme="neo-brutalism"] .category-btn:hover {
  background: #f0f0f0;
}
[data-theme="neo-brutalism"] .title {
  color: #fff;
  text-shadow: 2px 2px 0px #000;
}
[data-theme="swiss"] .sidebar {
  width: 100%;
  height: 100%;
  padding: 3rem 2rem;
}
[data-theme="swiss"] .category-btn {
  background: transparent;
  color: #888;
  border: none;
  border-bottom: 1px solid #eee;
  border-radius: 0;
  padding: 1rem 0;
}
[data-theme="swiss"] .category-btn:hover {
  color: #111;
  background: transparent;
}
[data-theme="swiss"] .category-btn.active {
  color: var(--accent-color);
  background: transparent;
  border-bottom: 2px solid var(--accent-color);
}
</style>
