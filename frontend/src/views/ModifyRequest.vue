<template>
  <div class="modify-request-page">
    <header class="page-header">
      <router-link to="/wishes" class="back-btn">←</router-link>
      <h1 class="page-title">修改申请</h1>
    </header>
    
    <div class="page-container">
      <div class="request-card" v-if="wish">
        <div class="original-wish">
          <h3 class="card-label">原愿望</h3>
          <p class="wish-content">{{ wish.content }}</p>
        </div>
        
        <div class="modify-reason">
          <h3 class="card-label">修改原因</h3>
          <p class="reason-content">{{ wish.modify_request }}</p>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary accept-btn" @click="handleResponse(true)">
            <span class="btn-icon">✓</span>
            同意修改
          </button>
          <button class="btn btn-secondary reject-btn" @click="handleResponse(false)">
            <span class="btn-icon">✕</span>
            拒绝
          </button>
        </div>
      </div>
      
      <div class="loading-state" v-else>
        <span class="loading-icon">💫</span>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWishesStore } from '@/stores/wishes'

const route = useRoute()
const router = useRouter()
const wishesStore = useWishesStore()

const wish = ref(null)

async function handleResponse(accept) {
  if (!wish.value) return
  
  const result = await wishesStore.respondModify(wish.value.id, accept)
  
  if (result.success) {
    window.$toast?.success(accept ? '已同意修改' : '已拒绝')
    router.push('/wishes')
  } else {
    window.$toast?.error(result.error)
  }
}

onMounted(() => {
  const wishId = parseInt(route.params.id)
  wish.value = wishesStore.wishes.find(w => w.id === wishId)
  
  if (!wish.value) {
    router.push('/wishes')
  }
})
</script>

<style scoped>
.modify-request-page {
  min-height: 100vh;
  background: var(--female-bg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--white);
  padding: calc(20px + var(--safe-area-top)) 20px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--female-bg);
  border-radius: var(--radius-full);
  text-decoration: none;
  font-size: 20px;
  color: var(--text-primary);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.page-container {
  padding: 20px;
}

.request-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 4px 20px var(--shadow);
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.original-wish {
  padding-bottom: 20px;
  border-bottom: 1px dashed #e0e0e0;
  margin-bottom: 20px;
}

.wish-content {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  padding: 12px;
  background: var(--female-bg);
  border-radius: var(--radius-md);
}

.modify-reason {
  margin-bottom: 24px;
}

.reason-content {
  font-size: 16px;
  line-height: 1.6;
  color: #E65100;
  padding: 12px;
  background: #FFF3E0;
  border-radius: var(--radius-md);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.accept-btn,
.reject-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
}

.btn-icon {
  font-size: 18px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
