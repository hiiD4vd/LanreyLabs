<template>
  <div class="template-card" @click="$emit('select')" ref="cardRef">
    <div class="video-container" ref="videoContainer" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <!-- Media will only load its source when the card is intersecting (lazy loaded) -->
      <video
        v-if="item.mediaType === 'video'"
        ref="videoRef"
        :src="isLoaded ? (item.previewUrl || item.mediaUrl) : ''"
        class="card-video"
        muted
        loop
        playsinline
        preload="metadata"
      ></video>
      <img 
        v-else 
        :src="isLoaded ? (item.previewUrl || item.mediaUrl) : ''" 
        class="card-image" 
        :alt="item.title" 
      />
      <div class="play-overlay" v-if="item.mediaType === 'video' && !isPlaying">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="play-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      </div>
    </div>
    
    <div class="card-info">
      <h3 class="card-title">{{ item.title }}</h3>
      <div class="card-meta">
        <div class="author-badge">PRO</div>
        <div class="interactions">
          <span class="likes">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="icon"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            1.2k
          </span>
          <span class="views">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            4.5k
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  item: {
    id: string;
    title: string;
    mediaUrl: string;
    previewUrl?: string | null;
    mediaType: string;
    codeUrl: string;
  };
}>();

defineEmits(['select']);

const cardRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const isLoaded = ref(false);

let observer: IntersectionObserver | null = null;

const handleMouseEnter = () => {
  if (videoRef.value && props.item.mediaType === 'video') {
    videoRef.value.play();
    isPlaying.value = true;
  }
};

const handleMouseLeave = () => {
  if (videoRef.value && props.item.mediaType === 'video') {
    videoRef.value.pause();
    isPlaying.value = false;
  }
};

onMounted(() => {
  // Intersection Observer for Lazy Loading Media & Auto-Play
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 1. Lazy load trigger
        isLoaded.value = true;
        
        // 2. Auto-play jika video
        if (props.item.mediaType === 'video' && videoRef.value) {
          // Tunggu sedikit agar src terisi sebelum play()
          setTimeout(() => {
            videoRef.value?.play().then(() => {
              isPlaying.value = true;
            }).catch((e) => console.log('Autoplay prevented:', e));
          }, 50);
        }
      } else {
        // Auto-pause saat keluar dari layar
        if (props.item.mediaType === 'video' && videoRef.value) {
          videoRef.value.pause();
          isPlaying.value = false;
        }
      }
    });
  }, {
    threshold: 0.3 // Memicu play saat 30% kartu terlihat
  });

  if (cardRef.value) {
    observer.observe(cardRef.value);
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.template-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: var(--card-bg);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
}

.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--video-radius);
  overflow: hidden;
  position: relative;
  background: #f0f0f0;
}

.card-video, .card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.template-card:hover .card-video,
.template-card:hover .card-image {
  transform: scale(1.02);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.4);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0.8;
  pointer-events: none;
}

.card-info {
  padding: var(--title-margin-top) 0.2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-title {
  font-size: var(--title-size);
  font-weight: var(--title-weight);
  color: var(--text-color);
  margin: 0;
  line-height: 1.3;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.author-badge {
  background: #e0e0e0;
  color: #333;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}
[data-theme="behance"] .author-badge {
  background: #0057ff;
  color: #fff;
}

.interactions {
  display: flex;
  gap: 0.8rem;
}

.interactions span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.interactions .icon {
  opacity: 0.7;
}
</style>
