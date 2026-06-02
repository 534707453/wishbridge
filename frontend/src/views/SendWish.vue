<template>
  <div class="send-wish-page">
    <header class="page-header">
      <router-link to="/home" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </router-link>
      <h1 class="page-title">发送愿望</h1>
      <div style="width: 40px;"></div>
    </header>
    
    <div class="page-container">
      <div v-if="!isPaired" class="empty-state">
        <div class="empty-icon">🔗</div>
        <h3 class="empty-title">请先配对</h3>
        <p class="empty-desc">发送愿望需要先与伴侣配对</p>
        <router-link to="/profile" class="btn btn-primary">去配对</router-link>
      </div>
      
      <div v-else class="send-form">
        <div class="form-hint">
          <span>写下你的小心愿，TA会收到哦~</span>
        </div>
        
        <div class="input-group">
          <textarea
            v-model="content"
            class="input wish-input"
            placeholder="我想收到..."
            rows="6"
            maxlength="500"
          ></textarea>
          <div class="char-count">
            <span :class="{ warning: content.length > 450 }">
              {{ content.length }}/500
            </span>
          </div>
        </div>
        
        <div class="quick-wishes">
          <h4>快速选择</h4>
          <div class="quick-list">
            <button
              v-for="wish in quickWishes"
              :key="wish"
              class="quick-btn"
              @click="content = wish"
            >
              {{ wish }}
            </button>
          </div>
        </div>
        
        <button 
          class="btn btn-primary send-btn" 
          :disabled="!canSend || sending"
          @click="handleSend"
        >
          <span v-if="sending">发送中...</span>
          <span v-else>发送给 TA</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishesStore } from '@/stores/wishes'
import { useAuthStore } from '@/stores/auth'
import { getSocket } from '@/services/socket'

const router = useRouter()
const wishesStore = useWishesStore()
const authStore = useAuthStore()

const content = ref('')
const sending = ref(false)

const quickWishes = [
  '想要一束花 💐',
  '想一起看电影 🎬',
  '想吃好吃的 🍰',
  '想要一个抱抱 🤗',
  '想一起散步 🚶'
]

const canSend = computed(() => content.value.trim().length > 0)
const isPaired = computed(() => authStore.isPaired)

async function handleSend() {
  if (!canSend.value || !isPaired.value) return
  
  sending.value = true
  
  const socket = getSocket()
  if (socket?.connected) {
    socket.emit('wish:send', { content: content.value.trim() })
    
    setTimeout(() => {
      window.$toast?.success('愿望已发送！')
      content.value = ''
      sending.value = false
      router.push('/wishes')
    }, 500)
  } else {
    const result = await wishesStore.sendWish(content.value.trim())
    
    sending.value = false
    
    if (result.success) {
      window.$toast?.success('愿望已发送！')
      content.value = ''
      router.push('/wishes')
    } else {
      window.$toast?.error(result.error)
    }
  }
}
</script>

<style scoped>
.send-wish-page {
  min-height: 100vh;
  background: var(--bg);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(16px + var(--safe-area-top)) 20px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: 20px;
  color: var(--text-primary);
  transition: background var(--transition-fast);
}

.back-btn:active {
  background: var(--bg-hover);
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.page-container {
  padding: 20px;
  padding-bottom: calc(20px + var(--safe-area-bottom));
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  text-align: center;
}

.send-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-hint {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.wish-input {
  min-height: 160px;
  font-size: 16px;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-light);
}

.char-count .warning {
  color: var(--warning);
}

.quick-wishes {
  margin-top: 24px;
}

.quick-wishes h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-btn:active {
  transform: scale(0.96);
  background: var(--primary-light);
  color: var(--primary);
}

.send-btn {
  width: 100%;
  margin-top: 32px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
}
</style>
