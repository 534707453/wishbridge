<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-wrapper">
          <span class="logo-icon">🌉</span>
        </div>
        <h1 class="app-name">WishBridge</h1>
        <p class="app-slogan">心愿桥 · 连接爱的桥梁</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label class="input-label">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="input"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        
        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="btn-loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </span>
          <span v-else>登 录</span>
        </button>
      </form>
      
      <div class="login-footer">
        <span class="footer-text">还没有账号？</span>
        <router-link to="/register" class="footer-link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { initSocket } from '@/services/socket'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)

function showToast(type, message) {
  if (window.$toast && typeof window.$toast[type] === 'function') {
    window.$toast[type](message)
  } else {
    alert(message)
  }
}

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    showToast('error', '请填写用户名和密码')
    return
  }
  
  loading.value = true
  
  const result = await authStore.login(form.value.username, form.value.password)
  
  loading.value = false
  
  if (result.success) {
    showToast('success', '登录成功')
    setTimeout(() => {
      initSocket()
      router.push('/home')
    }, 500)
  } else {
    showToast('error', result.error)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  animation: fade-in-up 0.6s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  display: inline-block;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 64px;
  display: block;
}

.app-name {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.app-slogan {
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

.login-form {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 28px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: loading-bounce 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(1) { animation-delay: 0s; }
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.login-footer {
  text-align: center;
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
}

.footer-text {
  color: var(--text-secondary);
}

.footer-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}
</style>
