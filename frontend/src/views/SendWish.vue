<template>
  <div class="send-wish-page">
    <header class="page-header">
      <router-link to="/home" class="back-btn">←</router-link>
      <h1 class="page-title">发送愿望</h1>
    </header>
    
    <div class="page-container">
      <div class="send-form">
        <div class="form-hint">
          <span class="hint-icon">💭</span>
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
        
        <div class="wish-tips">
          <h4>💡 小贴士</h4>
          <ul>
            <li>愿望可以是任何你想要的东西</li>
            <li>具体一点的愿望更容易被实现哦</li>
            <li>也可以是想要一起做的事情</li>
          </ul>
        </div>
        
        <div class="quick-wishes">
          <h4>🌟 快速愿望</h4>
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
          <span v-else>发送给 TA 💕</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishesStore } from '@/stores/wishes'
import { getSocket } from '@/services/socket'

const router = useRouter()
const wishesStore = useWishesStore()

const content = ref('')
const sending = ref(false)

const quickWishes = [
  '想要一束花 💐',
  '想一起看电影 🎬',
  '想吃好吃的 🍰',
  '想要一个抱抱 🤗',
  '想要小礼物 🎁',
  '想一起散步 🚶'
]

const canSend = computed(() => content.value.trim().length > 0)

async function handleSend() {
  if (!canSend.value) return
  
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
  background: var(--female-bg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--white);
  padding: calc(20px + var(--safe-area-top)) 20px 16px;
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
  background: var(--female-bg);
  border-radius: var(--radius-full);
  text-decoration: none;
  font-size: 20px;
  color: var(--text-primary);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.page-container {
  padding: 20px;
  padding-bottom: calc(100px + var(--safe-area-bottom));
}

.send-form {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow);
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--female-bg);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.hint-icon {
  font-size: 20px;
}

.wish-input {
  min-height: 150px;
  font-size: 18px;
  line-height: 1.6;
}

.char-count {
  text-align: right;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-light);
}

.char-count .warning {
  color: #FF9800;
}

.wish-tips {
  margin-top: 24px;
  padding: 16px;
  background: #FFF8E1;
  border-radius: var(--radius-md);
}

.wish-tips h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: #F57C00;
}

.wish-tips ul {
  list-style: none;
  font-size: 13px;
  color: #E65100;
}

.wish-tips li {
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}

.wish-tips li::before {
  content: '•';
  position: absolute;
  left: 0;
}

.quick-wishes {
  margin-top: 24px;
}

.quick-wishes h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  padding: 8px 16px;
  background: var(--female-bg);
  border: none;
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--female-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-btn:active {
  transform: scale(0.95);
  background: var(--female-primary);
  color: var(--white);
}

.send-btn {
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  font-size: 18px;
}
</style>
