<template>
  <div class="mood-page">
    <header class="page-header">
      <h1 class="page-title">{{ isFemale ? '我的心情' : 'TA的心情' }}</h1>
    </header>
    
    <div class="page-container">
      <div v-if="isFemale" class="mood-editor">
        <div class="editor-header">
          <span class="header-icon">💝</span>
          <span>现在心情怎么样？</span>
        </div>
        
        <MoodPicker 
          v-model="selectedMood"
          v-model:noteValue="moodNote"
        />
        
        <button 
          class="btn btn-primary update-btn" 
          :disabled="!selectedMood || updating"
          @click="handleUpdateMood"
        >
          <span v-if="updating">更新中...</span>
          <span v-else>更新心情</span>
        </button>
      </div>
      
      <div class="mood-display">
        <div class="current-mood" v-if="displayMood && displayMood.mood">
          <div class="mood-main">
            <span class="mood-emoji">{{ displayMood.mood }}</span>
            <div class="mood-info">
              <span class="mood-label">{{ getMoodLabel(displayMood.mood) }}</span>
              <span class="mood-time">{{ formatTime(displayMood.updated_at) }}</span>
            </div>
          </div>
          <p class="mood-note" v-if="displayMood.note">{{ displayMood.note }}</p>
        </div>
        
        <div class="mood-empty" v-else>
          <span class="empty-icon">🌸</span>
          <span>{{ isFemale ? '还没有设置心情' : 'TA还没有设置心情' }}</span>
        </div>
      </div>
      
      <div v-if="!isFemale" class="mood-hint">
        <span class="hint-icon">💡</span>
        <span>TA的心情会同步显示在这里</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMoodsStore } from '@/stores/moods'
import { getSocket } from '@/services/socket'
import MoodPicker from '@/components/MoodPicker.vue'

const authStore = useAuthStore()
const moodsStore = useMoodsStore()

const selectedMood = ref('')
const moodNote = ref('')
const updating = ref(false)

const isFemale = computed(() => authStore.isFemale)

const displayMood = computed(() => {
  return isFemale.value ? moodsStore.currentMood : moodsStore.partnerMood
})

function getMoodLabel(emoji) {
  const mood = moodsStore.MOOD_OPTIONS.find(m => m.emoji === emoji)
  return mood ? mood.label : ''
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚更新'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `今天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function handleUpdateMood() {
  if (!selectedMood.value) return
  
  updating.value = true
  
  const socket = getSocket()
  if (socket?.connected) {
    socket.emit('mood:update', { 
      mood: selectedMood.value,
      note: moodNote.value
    })
    
    setTimeout(() => {
      window.$toast?.success('心情已更新！')
      updating.value = false
    }, 500)
  } else {
    const result = await moodsStore.updateMood(selectedMood.value, moodNote.value)
    
    updating.value = false
    
    if (result.success) {
      window.$toast?.success('心情已更新！')
    } else {
      window.$toast?.error(result.error)
    }
  }
}

onMounted(async () => {
  await moodsStore.fetchCurrentMood()
  await moodsStore.fetchPartnerMood()
  
  if (moodsStore.currentMood?.mood) {
    selectedMood.value = moodsStore.currentMood.mood
    moodNote.value = moodsStore.currentMood.note || ''
  }
})
</script>

<style scoped>
.mood-page {
  min-height: 100vh;
  background: var(--female-bg);
}

.page-header {
  background: var(--white);
  padding: calc(20px + var(--safe-area-top)) 20px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-container {
  padding: 20px;
  padding-bottom: calc(100px + var(--safe-area-bottom));
}

.mood-editor {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow);
  margin-bottom: 20px;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.header-icon {
  font-size: 24px;
}

.update-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
}

.mood-display {
  margin-top: 20px;
}

.current-mood {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow);
}

.mood-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.mood-emoji {
  font-size: 64px;
}

.mood-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mood-label {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.mood-time {
  font-size: 12px;
  color: var(--text-light);
}

.mood-note {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 12px;
  background: var(--female-bg);
  border-radius: var(--radius-md);
}

.mood-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: var(--white);
  border-radius: var(--radius-lg);
  color: var(--text-light);
  box-shadow: 0 4px 20px var(--shadow);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.mood-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 16px;
  background: var(--male-bg);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-secondary);
}

.hint-icon {
  font-size: 20px;
}
</style>
