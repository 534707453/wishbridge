<template>
  <transition-group name="toast" tag="div" class="toast-container">
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      :class="['toast', `toast-${toast.type}`]"
    >
      <span class="toast-icon">{{ getIcon(toast.type) }}</span>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </transition-group>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const toasts = ref([])
let toastId = 0

function addToast(message, type = 'info', duration = 3000) {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}

function handleAppNotification(event) {
  addToast(event.detail.body, 'info')
}

onMounted(() => {
  window.addEventListener('app-notification', handleAppNotification)
  
  window.$toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info')
  }
})

onUnmounted(() => {
  window.removeEventListener('app-notification', handleAppNotification)
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(20px + var(--safe-area-top));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  width: calc(100% - 40px);
  max-width: 400px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px var(--shadow-lg);
  pointer-events: auto;
  animation: bounce-in 0.3s ease;
}

.toast-success {
  border-left: 4px solid #4CAF50;
}

.toast-error {
  border-left: 4px solid #F44336;
}

.toast-warning {
  border-left: 4px solid #FF9800;
}

.toast-info {
  border-left: 4px solid var(--female-primary);
}

.male-theme .toast-info {
  border-left-color: var(--male-primary);
}

.toast-icon {
  font-size: 18px;
}

.toast-success .toast-icon {
  color: #4CAF50;
}

.toast-error .toast-icon {
  color: #F44336;
}

.toast-warning .toast-icon {
  color: #FF9800;
}

.toast-info .toast-icon {
  color: var(--female-primary);
}

.male-theme .toast-info .toast-icon {
  color: var(--male-primary);
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
