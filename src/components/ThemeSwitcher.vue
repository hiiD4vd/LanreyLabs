<template>
  <div class="theme-switcher">
    <label>Theme:</label>
    <select :value="modelValue" @change="updateValue">
      <option value="awwwards">Awwwards Style</option>
      <option value="behance">Behance Style</option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue']);

const updateValue = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f4f4f4;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #111;
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 600;
}

[data-theme="behance"] .theme-switcher {
  background: #ffffff;
  border: 1px solid #ebebeb;
}

.theme-switcher select {
  background: transparent;
  color: inherit;
  border: none;
  outline: none;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
}
</style>
