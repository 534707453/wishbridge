<template>
  <Teleport to="body">
    <div v-if="showError && !showReconnecting" class="error-banner" @click="goToErrorPage">
      <div class="banner-content">
        <span class="banner-icon">⚠️</span>
        <span class="banner-text">{{ errorMessage }}</span>
      </div>
      <button class="banner-close" @click.stop="dismissError">✕</button>
    </div>
    
    <div v-if="showReconnecting" class="reconnecting-overlay">
      <div class="reconnecting-content">
        <div class="spinner"></div>
        <span class="reconnecting-text">{{ reconnectText }}</span>
        <span class="reconnecting-subtext" v-if="serverUrl">{{ serverUrl }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, inject } from 'vue';
import { useRouter } from 'vue-router';
import { checkServerStatus, API_BASE } from '@/services/api';
import { logger } from '@/services/logger';

const router = useRouter();

const showError = ref(false);
const showReconnecting = ref(false);
const errorMessage = ref('');
const errorType = ref('offline');
const reconnectText = ref('正在连接服务器...');
const serverUrl = ref(API_BASE);

let reconnectAttempts = 0;
let reconnectTimer = null;
let networkCheckInterval = null;

function dismissError() {
  showError.value = false;
}

function goToErrorPage() {
  router.push({
    name: 'ServerError',
    query: { 
      type: errorType.value,
      message: errorMessage.value
    }
  });
}

async function retryConnection() {
  showError.value = false;
  await performConnectionTest();
}

async function performConnectionTest() {
  showReconnecting.value = true;
  reconnectText.value = '正在连接服务器...';
  
  const result = await checkServerStatus();
  
  showReconnecting.value = false;
  
  if (!result.success) {
    reconnectAttempts++;
    errorMessage.value = result.error;
    
    if (errorMessage.value.includes('网络') || errorMessage.value.includes('断开')) {
      errorType.value = 'offline';
    } else if (errorMessage.value.includes('超时')) {
      errorType.value = 'timeout';
    } else {
      errorType.value = 'server-error';
    }
    
    showError.value = true;
    
    if (reconnectAttempts < 3) {
      reconnectTimer = setTimeout(() => {
        performConnectionTest();
      }, 5000);
    }
  } else {
    reconnectAttempts = 0;
    showError.value = false;
    if (window.$toast) {
      window.$toast.success('连接成功！');
    }
  }
}

function handleOnline() {
  performConnectionTest();
}

function handleOffline() {
  errorType.value = 'offline';
  errorMessage.value = '网络已断开';
  showError.value = true;
  showReconnecting.value = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
}

function handleGlobalError(event) {
  const error = event.error || event;
  console.error('全局错误:', error);
  logger.error('全局错误', error);
}

provide('retryConnection', retryConnection);
provide('checkConnection', performConnectionTest);
provide('showError', (type, message) => {
  errorType.value = type || 'server-error';
  errorMessage.value = message || '连接失败';
  showError.value = true;
});

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的 Promise 拒绝:', event.reason);
    logger.error('未处理的 Promise 拒绝', event.reason);
  });
  
  window.$retryConnection = retryConnection;
  
  setTimeout(() => {
    performConnectionTest();
  }, 1500);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('error', handleGlobalError);
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
  }
});
</script>

<style scoped>
.error-banner {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: 12px;
  right: 12px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  cursor: pointer;
  animation: slide-down 0.3s ease;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-icon {
  font-size: 18px;
}

.banner-text {
  font-size: 14px;
  font-weight: 500;
  color: #DC2626;
}

.banner-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #DC2626;
  cursor: pointer;
  opacity: 0.7;
}

.banner-close:hover {
  opacity: 1;
}

.reconnecting-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 9998;
}

.reconnecting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.reconnecting-text {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.reconnecting-subtext {
  font-size: 13px;
  color: #6B7280;
}
</style>
