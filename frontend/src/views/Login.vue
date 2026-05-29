<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-blur"></div>
    </div>
    
    <div class="login-container">
      <div class="login-header">
        <div class="logo-wrapper">
          <span class="logo-icon">🌉</span>
          <div class="logo-glow"></div>
        </div>
        <h1 class="app-name">WishBridge</h1>
        <p class="app-slogan">心愿桥 · 连接爱的桥梁</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-wrapper">
          <div class="input-icon">👤</div>
          <input
            v-model="form.username"
            type="text"
            class="input"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        
        <div class="input-wrapper">
          <div class="input-icon">🔒</div>
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
      
      <div class="decoration">
        <div class="deco-heart heart-1">💕</div>
        <div class="deco-heart heart-2">💖</div>
        <div class="deco-heart heart-3">💗</div>
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
  background: linear-gradient(135deg, #FFE4EC 0%, #FFF5F8 50%, #FFF0F3 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 107, 157, 0.4) 0%, transparent 70%);
  top: -100px;
  right: -50px;
  animation: float 6s ease-in-out infinite;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(196, 69, 105, 0.3) 0%, transparent 70%);
  bottom: -50px;
  left: -100px;
  animation: float 8s ease-in-out infinite reverse;
}

.bg-blur {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 70%, rgba(255, 107, 157, 0.1) 0%, transparent 50%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  animation: fade-in-up 0.6s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 72px;
  display: block;
  animation: float 3s ease-in-out infinite;
}

.logo-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(255, 107, 157, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  z-index: -1;
  animation: pulse 2s ease-in-out infinite;
}

.app-name {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.app-slogan {
  font-size: 14px;
  color: var(--text-light);
  letter-spacing: 2px;
}

.login-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px 28px;
  box-shadow: 
    0 8px 32px rgba(255, 107, 157, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.input-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  z-index: 1;
}

.input-wrapper .input {
  padding-left: 50px;
  background: rgba(255, 240, 243, 0.5);
  border: 2px solid transparent;
}

.input-wrapper .input:focus {
  background: rgba(255, 255, 255, 1);
  border-color: var(--female-primary);
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  padding: 16px;
  font-size: 18px;
  letter-spacing: 4px;
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
  color: var(--female-primary);
  text-decoration: none;
  font-weight: 600;
}

.decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.deco-heart {
  position: absolute;
  font-size: 24px;
  opacity: 0.4;
  animation: float 4s ease-in-out infinite;
}

.heart-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.heart-2 {
  top: 25%;
  right: 15%;
  animation-delay: 1s;
  font-size: 20px;
}

.heart-3 {
  bottom: 20%;
  right: 10%;
  animation-delay: 2s;
  font-size: 18px;
}
</style>
