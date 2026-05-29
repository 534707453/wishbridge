<template>
  <div class="home-page">
    <header class="home-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="greeting-section">
          <div class="greeting-badge">{{ greeting }}</div>
          <h1 class="greeting-text">{{ user?.username }}</h1>
        </div>
        <div class="logo-wrapper">
          <span class="logo-icon">🌉</span>
        </div>
      </div>
    </header>
    
    <div class="page-container">
      <section class="mood-section" v-if="partner">
        <div class="section-card mood-card">
          <div class="card-accent"></div>
          <div class="section-header">
            <h2 class="section-title">
              <span class="title-icon">{{ isFemale ? '💝' : '👀' }}</span>
              {{ isFemale ? '我的心情' : 'TA的心情' }}
            </h2>
          </div>
          <div class="mood-display" v-if="displayMood && displayMood.mood">
            <span class="mood-emoji animate-heart-beat">{{ displayMood.mood }}</span>
            <div class="mood-info">
              <span class="mood-label">{{ getMoodLabel(displayMood.mood) }}</span>
              <span class="mood-time">{{ formatMoodTime(displayMood.updated_at) }}</span>
            </div>
          </div>
          <div class="mood-empty" v-else>
            <span class="empty-icon">🌸</span>
            <span>{{ isFemale ? '还没有设置心情' : 'TA还没有设置心情' }}</span>
          </div>
        </div>
      </section>
      
      <section class="wishes-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🎁</span>
            最近愿望
          </h2>
          <router-link to="/wishes" class="see-more">
            查看全部
            <span class="arrow">→</span>
          </router-link>
        </div>
        
        <div class="wishes-grid" v-if="recentWishes.length > 0">
          <WishCard 
            v-for="(wish, index) in recentWishes" 
            :key="wish.id" 
            :wish="wish"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <template #actions>
              <button 
                v-if="isMale && wish.status === 'pending'"
                class="btn btn-primary btn-sm"
                @click="markRealized(wish)"
              >
                实现 ✨
              </button>
            </template>
          </WishCard>
        </div>
        
        <div class="empty-state" v-else>
          <span class="empty-icon">🎁</span>
          <span class="empty-text">{{ isFemale ? '还没有发送愿望' : '还没有收到愿望' }}</span>
          <router-link v-if="isFemale" to="/send-wish" class="btn btn-primary mt-lg">
            发送第一个愿望
          </router-link>
        </div>
      </section>
      
      <section class="pair-section" v-if="!partner">
        <div class="section-card pair-card">
          <div class="pair-header">
            <span class="pair-icon">💝</span>
            <span class="pair-title">还没有配对？</span>
          </div>
          <p class="pair-desc">告诉 TA 你的配对码，建立连接</p>
          
          <div class="pair-code-box">
            <span class="code-label">我的配对码</span>
            <span class="code-value">{{ user?.pair_code }}</span>
          </div>
          
          <div class="pair-form">
            <input
              v-model="pairCode"
              type="text"
              class="input"
              placeholder="输入对方的配对码"
              maxlength="6"
            />
            <button class="btn btn-primary" @click="handleBind">绑定</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWishesStore } from '@/stores/wishes'
import { useMoodsStore } from '@/stores/moods'
import WishCard from '@/components/WishCard.vue'

const authStore = useAuthStore()
const wishesStore = useWishesStore()
const moodsStore = useMoodsStore()

const pairCode = ref('')

const user = computed(() => authStore.user)
const partner = computed(() => authStore.partner)
const isFemale = computed(() => authStore.isFemale)
const isMale = computed(() => authStore.isMale)
const recentWishes = computed(() => wishesStore.wishes.slice(0, 3))

const displayMood = computed(() => {
  return isFemale.value ? moodsStore.currentMood : moodsStore.partnerMood
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '🌙 夜深了'
  if (hour < 9) return '🌅 早上好'
  if (hour < 12) return '☀️ 上午好'
  if (hour < 14) return '🌤️ 中午好'
  if (hour < 18) return '🌇 下午好'
  if (hour < 22) return '🌆 晚上好'
  return '🌙 夜深了'
})

function getMoodLabel(emoji) {
  const mood = moodsStore.MOOD_OPTIONS.find(m => m.emoji === emoji)
  return mood ? mood.label : ''
}

function formatMoodTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `今天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function markRealized(wish) {
  const result = await wishesStore.updateWishStatus(wish.id, 'realized')
  if (result.success) {
    window.$toast?.success('已标记为实现！')
  } else {
    window.$toast?.error(result.error)
  }
}

async function handleBind() {
  if (!pairCode.value) {
    window.$toast?.error('请输入配对码')
    return
  }
  
  const result = await authStore.bindPair(pairCode.value.toUpperCase())
  if (result.success) {
    window.$toast?.success('配对成功！')
    pairCode.value = ''
  } else {
    window.$toast?.error(result.error)
  }
}

onMounted(async () => {
  await Promise.all([
    wishesStore.fetchWishes(),
    moodsStore.fetchCurrentMood(),
    moodsStore.fetchPartnerMood()
  ])
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--female-bg);
}

.home-header {
  position: relative;
  padding: calc(20px + var(--safe-area-top)) 20px 60px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: var(--female-gradient);
  clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
}

.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: white;
}

.greeting-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.greeting-badge {
  font-size: 12px;
  opacity: 0.9;
}

.greeting-text {
  font-size: 28px;
  font-weight: 700;
}

.logo-wrapper {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 32px;
  animation: float 3s ease-in-out infinite;
}

.page-container {
  margin-top: -40px;
  padding: 0 16px;
  padding-bottom: calc(90px + var(--safe-area-bottom));
  position: relative;
  z-index: 1;
}

.section-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--female-gradient);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.see-more {
  font-size: 13px;
  color: var(--female-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.see-more .arrow {
  transition: transform var(--transition-fast);
}

.see-more:hover .arrow {
  transform: translateX(4px);
}

.mood-card {
  margin-bottom: 24px;
}

.mood-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mood-emoji {
  font-size: 56px;
}

.mood-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mood-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.mood-time {
  font-size: 12px;
  color: var(--text-light);
}

.mood-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: var(--text-light);
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.wishes-section {
  margin-bottom: 24px;
}

.wishes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.empty-text {
  color: var(--text-light);
  margin-bottom: 8px;
}

.pair-card {
  margin-top: 20px;
}

.pair-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.pair-icon {
  font-size: 32px;
}

.pair-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.pair-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.pair-code-box {
  background: linear-gradient(135deg, var(--female-bg) 0%, #FFE4EC 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.code-label {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 8px;
}

.code-value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 6px;
  color: var(--female-primary);
}

.pair-form {
  display: flex;
  gap: 12px;
}

.pair-form .input {
  flex: 1;
}

.pair-form .btn {
  white-space: nowrap;
}
</style>
