<template>
  <div class="profile-page">
    <header class="page-header">
      <h1 class="page-title">我的</h1>
    </header>
    
    <div class="page-container">
      <div class="user-section">
        <div class="user-avatar">
          {{ user?.username?.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user?.username }}</h2>
          <span class="user-gender">{{ isFemale ? '👩 女生' : '👨 男生' }}</span>
        </div>
      </div>
      
      <div class="pair-section" v-if="partner">
        <div class="pair-info">
          <span class="pair-label">已配对</span>
          <span class="partner-name">{{ partner.username }}</span>
        </div>
        <button class="btn btn-secondary btn-sm" @click="handleUnbind">
          解除配对
        </button>
      </div>
      
      <div class="pair-section" v-else>
        <div class="pair-info">
          <span class="pair-label">我的配对码</span>
          <button class="pair-code-btn" @click="copyPairCode">
            <span class="pair-code">{{ user?.pair_code }}</span>
            <span class="copy-icon">{{ copied ? '✓' : '复制' }}</span>
          </button>
        </div>
      </div>
      
      <div class="menu-section">
        <button class="menu-item" @click="showPasswordModal = true">
          <span class="menu-icon">🔑</span>
          <span class="menu-text">修改密码</span>
          <span class="menu-arrow">›</span>
        </button>
      </div>
      
      <button class="btn btn-secondary logout-btn" @click="handleLogout">
        退出登录
      </button>
      
      <div class="app-info">
        <p>WishBridge 🌉 v1.0.0</p>
      </div>
    </div>
    
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal-content">
        <h3 class="modal-title">修改密码</h3>
        
        <div class="input-group">
          <label class="input-label">旧密码</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            class="input"
            placeholder="请输入旧密码"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">新密码</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="input"
            placeholder="请输入新密码（至少6位）"
          />
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showPasswordModal = false">取消</button>
          <button class="btn btn-primary" @click="handleChangePassword">确认</button>
        </div>
      </div>
    </div>
    
    <div v-if="showPairModal" class="modal-overlay" @click.self="showPairModal = false">
      <div class="modal-content">
        <h3 class="modal-title">绑定配对</h3>
        <p class="modal-desc">输入对方的配对码进行绑定</p>
        
        <input
          v-model="pairCode"
          type="text"
          class="input"
          placeholder="请输入配对码"
          maxlength="6"
          style="text-transform: uppercase; letter-spacing: 4px; text-align: center; font-size: 20px;"
        />
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showPairModal = false">取消</button>
          <button class="btn btn-primary" @click="handleBind">绑定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { disconnectSocket } from '@/services/socket'

const router = useRouter()
const authStore = useAuthStore()

const showPasswordModal = ref(false)
const showPairModal = ref(false)
const copied = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: ''
})
const pairCode = ref('')

const user = computed(() => authStore.user)
const partner = computed(() => authStore.partner)
const isFemale = computed(() => authStore.isFemale)

function copyPairCode() {
  if (!user.value?.pair_code) return
  
  navigator.clipboard.writeText(user.value.pair_code)
    .then(() => {
      copied.value = true
      window.$toast?.success('配对码已复制！')
      setTimeout(() => {
        copied.value = false
      }, 2000)
    })
    .catch(() => {
      window.$toast?.error('复制失败，请手动复制')
    })
}

async function handleChangePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    window.$toast?.error('请填写完整')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    window.$toast?.error('新密码至少6位')
    return
  }
  
  const result = await authStore.changePassword(
    passwordForm.value.oldPassword,
    passwordForm.value.newPassword
  )
  
  if (result.success) {
    window.$toast?.success('密码修改成功')
    showPasswordModal.value = false
    passwordForm.value = { oldPassword: '', newPassword: '' }
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
    showPairModal.value = false
    pairCode.value = ''
  } else {
    window.$toast?.error(result.error)
  }
}

async function handleUnbind() {
  if (!confirm('确定要解除配对吗？解除后双方都将断开连接。')) return
  
  const result = await authStore.unbindPair()
  
  if (result.success) {
    window.$toast?.success('已解除配对')
  } else {
    window.$toast?.error(result.error)
  }
}

function handleLogout() {
  if (!confirm('确定要退出登录吗？')) return
  
  disconnectSocket()
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg);
}

.page-header {
  padding: calc(16px + var(--safe-area-top)) 20px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border-light);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.page-container {
  padding: 20px;
  padding-bottom: calc(20px + var(--safe-area-bottom));
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: var(--primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-white);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.user-gender {
  font-size: 14px;
  color: var(--text-secondary);
}

.pair-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}

.pair-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pair-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.partner-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.pair-code-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pair-code-btn:active {
  transform: scale(0.98);
  background: var(--bg-hover);
}

.pair-code {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--primary);
}

.copy-icon {
  font-size: 13px;
  color: var(--text-secondary);
}

.menu-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.menu-item:active {
  background: var(--bg-hover);
}

.menu-icon {
  font-size: 20px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
}

.menu-arrow {
  font-size: 20px;
  color: var(--text-light);
}

.logout-btn {
  width: 100%;
  margin-bottom: 20px;
}

.app-info {
  text-align: center;
  padding: 16px;
  font-size: 13px;
  color: var(--text-light);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  background: var(--bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 360px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.modal-desc {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions .btn {
  flex: 1;
}
</style>
