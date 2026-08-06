<template>
  <div class="modal-overlay" v-if="isOpen" @click.self="close">
    <div class="modal-content glass fade-in">
      <button class="close-btn" @click="close">
        <X class="icon" />
      </button>
      
      <div class="modal-header" v-if="item">
        <h2 class="modal-title">{{ item.title }}</h2>
        <div class="tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'preview' }"
            @click="activeTab = 'preview'"
          >
            Preview
          </button>
          <button 
            v-if="item.codeUrl"
            class="tab-btn" 
            :class="{ active: activeTab === 'code' }"
            @click="activeTab = 'code'"
          >
            Code
          </button>
        </div>
      </div>

      <div class="modal-body" v-if="item">
        <!-- Preview Tab -->
        <div class="tab-content preview-tab" v-if="activeTab === 'preview'">
          <div class="media-wrapper">
            <video 
              v-if="item.mediaType === 'video'" 
              :src="item.mediaUrl" 
              autoplay 
              loop 
              muted 
              playsinline
              class="large-media"
            ></video>
            <img 
              v-else 
              :src="item.mediaUrl" 
              class="large-media" 
              :alt="item.title"
            />
          </div>
        </div>

        <!-- Code Tab -->
        <div class="tab-content code-tab" v-if="activeTab === 'code'">
          <div class="code-wrapper" v-if="!isLoadingCode">
            <pre><code>{{ codeContent }}</code></pre>
          </div>
          <div class="loading-state" v-else>
            Loading code...
          </div>
        </div>
      </div>
      
      <div class="modal-footer" v-if="item && activeTab === 'code'">
        <button class="action-btn" @click="copyCode">
          <span v-if="!copied">Copy Code</span>
          <span v-else>Copied! ✔</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  item: { id: string; title: string; mediaUrl: string; mediaType: string; codeUrl: string } | null;
}>();

const emit = defineEmits(['close']);

const activeTab = ref('preview');
const codeContent = ref('');
const isLoadingCode = ref(false);
const copied = ref(false);

const close = () => {
  emit('close');
  // Reset state
  setTimeout(() => {
    activeTab.value = 'preview';
    copied.value = false;
  }, 300);
};

// Fetch code when modal opens and item changes
watch(() => props.item, async (newItem) => {
  if (newItem && newItem.codeUrl) {
    isLoadingCode.value = true;
    try {
      const res = await fetch(newItem.codeUrl);
      if (res.ok) {
        codeContent.value = await res.text();
      } else {
        codeContent.value = '// Gagal memuat kode sumber.';
      }
    } catch (e) {
      codeContent.value = '// Error memuat kode.';
    } finally {
      isLoadingCode.value = false;
    }
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(codeContent.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  border-radius: var(--card-radius, 16px);
  position: relative;
  overflow: hidden;
  box-shadow: var(--card-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.5));
  border: var(--card-border-width, 1px) solid var(--card-border-color);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--card-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-right: 3rem; /* space for close btn */
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-color);
  background: rgba(128, 128, 128, 0.1);
}

.tab-btn.active {
  color: var(--bg-color);
  background: var(--text-color);
}
[data-theme="retro"] .tab-btn.active {
  color: #fff;
  background: #ff5555;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: var(--bg-color-lighter);
  border: var(--card-border-width, 1px) solid var(--card-border-color);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #ff4757;
  color: #fff;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.media-wrapper {
  width: 100%;
  min-height: 400px;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.large-media {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}

.code-wrapper {
  padding: 1.5rem;
  background: #1e1e1e;
  color: #d4d4d4;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.code-wrapper pre {
  margin: 0;
}

.loading-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  background: var(--bg-color-lighter);
  border-top: 1px solid var(--card-border-color);
}

.action-btn {
  background: var(--text-color);
  color: var(--bg-color);
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}
</style>
