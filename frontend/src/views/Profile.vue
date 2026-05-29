<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="avatar">
        {{ user?.username?.charAt(0).toUpperCase() }}
      </div>
      <h2 class="username">{{ user?.username }}</h2>
      <span class="gender-badge">{{ isFemale ? '👩 女孩子' : '👨 男孩子' }}</span>
    </header>
    
    <div class="page-container">
      <div class="profile-section">
        <h3 class="section-title">账号信息</h3>
        
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ user?.username }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">我的配对码</span>
            <span class="info-value pair-code">{{ user?.pair_code }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">配对状态</span>
            <span :class="['info-value', { 'text-success': partner, 'text-warning': !partner }]">
              {{ partner ? `已与 ${partner.username} 配对` : '未配对' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <h3 class="section-title">设置</h3>
        
        <div class="menu-card">
          <button class="menu-item" @click="showPasswordModal = true">
            <span class="menu-icon">🔑</span>
            <span class="menu-text">修改密码</span>
            <span class="menu-arrow">→</span>
          </button>
          
          <button class="menu-item" @click="showPairModal = true" v-if="!partner">
            <span class="menu-icon">💝</span>
            <span class="menu-text">绑定配对</span>
            <span class="menu-arrow">→</span>
          </button>
          
          <button class="menu-item danger" @click="handleUnbind" v-if="partner">
            <span class="menu-icon">💔</span>
            <span class="menu-text">解除配对</span>
            <span class="menu-arrow">→</span>
          </button>
        </div>
      </div>
      
      <button class="btn btn-secondary logout-btn" @click="handleLogout">
        退出登录
      </button>
      
      <div class="app-info">
        <p>WishBridge 🌉 v1.0.0</p>
        <p>心愿桥 · 连接爱的桥梁</p>
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
const passwordForm = ref({
  oldPassword: '',
  newPassword: ''
})
const pairCode = ref('')

const user = computed(() => authStore.user)
const partner = computed(() => authStore.partner)
const isFemale = computed(() => authStore.isFemale)

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
  background: var(--female-bg);
}

.profile-header {
  background: linear-gradient(135deg, var(--female-primary) 0%, var(--female-secondary) 100%);
  padding: calc(40px + var(--safe-area-top)) 20px 40px;
  text-align: center;
  color: var(--white);
}

.avatar {
  width: 80px;
  height: 80px;
  background: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: var(--female-primary);
  margin: 0 auto 16px;
}

.username {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.gender-badge {
  font-size: 14px;
  opacity: 0.9;
}

.page-container {
  margin-top: -20px;
  padding: 20px;
  padding-bottom: calc(100px + var(--safe-area-bottom));
}

.profile-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-left: 4px;
}

.info-card,
.menu-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px var(--shadow);
  overflow: hidden;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.pair-code {
  letter-spacing: 2px;
  color: var(--female-primary);
}

.text-success {
  color: #4CAF50;
}

.text-warning {
  color: #FF9800;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  background: none;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f8f8f8;
}

.menu-item.danger .menu-text {
  color: #F44336;
}

.menu-item.danger .menu-icon {
  opacity: 0.7;
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
  font-size: 14px;
  color: var(--text-light);
}

.logout-btn {
  width: 100%;
  margin-top: 20px;
}

.app-info {
  text-align: center;
  margin-top: 32px;
  padding: 16px;
  font-size: 12px;
  color: var(--text-light);
}

.app-info p {
  margin: 4px 0;
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
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.modal-desc {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 20px;
}

.modal-content .input-group {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions .btn {
  flex: 1;
}
</style>
