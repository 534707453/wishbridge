<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">{{ icon }}</div>
      <h1 class="error-title">{{ title }}</h1>
      <p class="error-message">{{ displayMessage }}</p>
      
      <div class="server-info">
        <span class="info-label">服务器地址</span>
        <span class="info-value">{{ serverUrl }}</span>
      </div>
      
      <div class="error-actions">
        <button class="btn btn-primary" @click="retry" :disabled="loading">
          <span v-if="loading">检查中...</span>
          <span v-else>重新连接</span>
        </button>
      </div>
      
      <div class="tips">
        <h4>排查步骤</h4>
        <ul>
          <li>检查手机网络连接</li>
          <li>确认后端服务已在 Termux 中启动</li>
          <li>检查 FRP 内网穿透是否正常运行</li>
          <li>等待几秒后重试</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE } from '@/services/api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const serverUrl = computed(() => API_BASE)

const errorType = computed(() => route.query.type || 'server-error')
const routeMessage = computed(() => route.query.message || '')

const icon = computed(() => {
  switch (errorType.value) {
    case 'offline': return '📡'
    case 'server-error': return '🔧'
    case 'timeout': return '⏱️'
    default: return '⚠️'
  }
})

const title = computed(() => {
  switch (errorType.value) {
    case 'offline': return '网络已断开'
    case 'server-error': return '服务器连接失败'
    case 'timeout': return '连接超时'
    default: return '连接失败'
  }
})

const displayMessage = computed(() => {
  if (routeMessage.value) return routeMessage.value
  
  switch (errorType.value) {
    case 'offline': return '请检查您的网络连接'
    case 'server-error': return '无法连接到服务器，请确认服务已启动'
    case 'timeout': return '服务器响应超时，请稍后重试'
    default: return '连接失败，请检查网络和服务器状态'
  }
})

async function retry() {
  loading.value = true
  
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      router.push('/home')
    }
  } catch (e) {
    console.log('Still cannot connect')
  }
  
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 20px;
}

.error-container {
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: fade-in 0.3s ease;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.error-message {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.server-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
}

.info-label {
  font-size: 12px;
  color: var(--text-light);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-all;
}

.error-actions {
  margin-bottom: 32px;
}

.error-actions .btn {
  width: 100%;
  padding: 14px;
}

.tips {
  text-align: left;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.tips h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tips li::before {
  content: '•';
  position: absolute;
  left: 6px;
  color: var(--primary);
}
</style>
