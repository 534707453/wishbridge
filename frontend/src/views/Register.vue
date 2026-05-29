<template>
  <div class="register-page">
    <div class="register-bg">
      <div class="bg-decoration"></div>
    </div>
    
    <div class="register-container">
      <div class="register-header">
        <router-link to="/login" class="back-btn">←</router-link>
        <h1 class="title">创建账号</h1>
      </div>
      
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="input-group">
          <label class="input-label">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="input"
            placeholder="设置用户名"
            maxlength="20"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="设置密码（至少6位）"
            autocomplete="new-password"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="input"
            placeholder="再次输入密码"
            autocomplete="new-password"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">我是</label>
          <div class="gender-select">
            <button
              type="button"
              :class="['gender-option', { active: form.gender === 'female' }]"
              @click="form.gender = 'female'"
            >
              <span class="gender-icon">👩</span>
              <span>女孩子</span>
            </button>
            <button
              type="button"
              :class="['gender-option', { active: form.gender === 'male' }]"
              @click="form.gender = 'male'"
            >
              <span class="gender-icon">👨</span>
              <span>男孩子</span>
            </button>
          </div>
        </div>
        
        <div class="input-group">
          <label class="input-label">配对码（可选）</label>
          <input
            v-model="form.pair_code"
            type="text"
            class="input"
            placeholder="输入对方的配对码进行绑定"
            maxlength="6"
          />
          <p class="input-hint">配对码用于与伴侣建立连接</p>
        </div>
        
        <button type="submit" class="btn btn-primary register-btn" :disabled="loading">
          <span v-if="loading" class="loading">注册中...</span>
          <span v-else>注 册</span>
        </button>
      </form>
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
  password: '',
  confirmPassword: '',
  gender: '',
  pair_code: ''
})

const loading = ref(false)

async function handleRegister() {
  if (!form.value.username || !form.value.password || !form.value.gender) {
    window.$toast?.error('请填写完整信息')
    return
  }
  
  if (form.value.password.length < 6) {
    window.$toast?.error('密码至少6位')
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    window.$toast?.error('两次密码不一致')
    return
  }
  
  loading.value = true
  
  const result = await authStore.register({
    username: form.value.username,
    password: form.value.password,
    gender: form.value.gender,
    pair_code: form.value.pair_code || undefined
  })
  
  loading.value = false
  
  if (result.success) {
    initSocket()
    window.$toast?.success('注册成功')
    router.push('/home')
  } else {
    window.$toast?.error(result.error)
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--female-bg) 0%, #FFE4EC 100%);
  padding: 20px;
  position: relative;
}

.register-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-decoration {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 107, 157, 0.15) 0%, transparent 70%);
  top: -200px;
  left: -200px;
  border-radius: 50%;
}

.register-container {
  max-width: 400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.register-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-top: 20px;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border-radius: var(--radius-full);
  text-decoration: none;
  font-size: 20px;
  color: var(--text-primary);
  box-shadow: 0 2px 10px var(--shadow);
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.register-form {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  box-shadow: 0 8px 32px var(--shadow);
}

.gender-select {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.gender-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: var(--female-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 14px;
  color: var(--text-secondary);
}

.gender-option:active {
  transform: scale(0.98);
}

.gender-option.active {
  border-color: var(--female-primary);
  background: var(--white);
  color: var(--female-primary);
}

.gender-icon {
  font-size: 32px;
}

.register-btn {
  width: 100%;
  margin-top: 8px;
  padding: 16px;
  font-size: 18px;
}

.input-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-light);
}
</style>
