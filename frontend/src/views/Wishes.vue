<template>
  <div class="wishes-page">
    <header class="page-header">
      <h1 class="page-title">愿望清单</h1>
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab', { active: currentFilter === tab.value }]"
          @click="changeFilter(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </header>
    
    <div class="page-container">
      <div v-if="loading" class="loading-state">
        <span class="loading-icon">💫</span>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="filteredWishes.length === 0" class="empty-state">
        <span class="empty-icon">🎁</span>
        <span>{{ emptyText }}</span>
      </div>
      
      <div v-else class="wishes-list">
        <WishCard 
          v-for="wish in filteredWishes" 
          :key="wish.id" 
          :wish="wish"
        >
          <template #actions>
            <button 
              v-if="isMale && wish.status === 'pending' && wish.modify_status !== 'pending'"
              class="btn btn-primary"
              @click="markRealized(wish)"
            >
              实现 ✨
            </button>
            
            <button 
              v-if="isMale && wish.status === 'pending' && wish.modify_status !== 'pending'"
              class="btn btn-secondary"
              @click="showModifyModal(wish)"
            >
              申请修改
            </button>
            
            <template v-if="isFemale && wish.modify_status === 'pending'">
              <button 
                class="btn btn-primary"
                @click="respondModify(wish, true)"
              >
                同意 ✓
              </button>
              <button 
                class="btn btn-secondary"
                @click="respondModify(wish, false)"
              >
                拒绝
              </button>
            </template>
            
            <button 
              v-if="isFemale && wish.sender_id === user?.id"
              class="btn btn-secondary"
              @click="deleteWish(wish)"
            >
              删除
            </button>
          </template>
        </WishCard>
      </div>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">申请修改愿望</h3>
        <p class="modal-desc">请说明你想修改的原因</p>
        <textarea
          v-model="modifyReason"
          class="input"
          placeholder="我想这样修改..."
          rows="4"
          maxlength="200"
        ></textarea>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="submitModify">提交申请</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWishesStore } from '@/stores/wishes'
import WishCard from '@/components/WishCard.vue'

const authStore = useAuthStore()
const wishesStore = useWishesStore()

const currentFilter = ref('all')
const showModal = ref(false)
const selectedWish = ref(null)
const modifyReason = ref('')

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待实现', value: 'pending' },
  { label: '已实现', value: 'realized' }
]

const loading = computed(() => wishesStore.loading)
const user = computed(() => authStore.user)
const isMale = computed(() => authStore.isMale)
const isFemale = computed(() => authStore.isFemale)

const filteredWishes = computed(() => {
  if (currentFilter.value === 'all') {
    return wishesStore.wishes
  }
  return wishesStore.wishes.filter(w => w.status === currentFilter.value)
})

const emptyText = computed(() => {
  if (currentFilter.value === 'pending') {
    return isFemale.value ? '还没有待实现的愿望' : 'TA还没有提出愿望'
  }
  if (currentFilter.value === 'realized') {
    return '还没有已实现的愿望'
  }
  return isFemale.value ? '还没有发送愿望' : '还没有收到愿望'
})

function changeFilter(filter) {
  currentFilter.value = filter
}

async function markRealized(wish) {
  const result = await wishesStore.updateWishStatus(wish.id, 'realized')
  if (result.success) {
    window.$toast?.success('已标记为实现！🎉')
  } else {
    window.$toast?.error(result.error)
  }
}

function showModifyModal(wish) {
  selectedWish.value = wish
  modifyReason.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedWish.value = null
  modifyReason.value = ''
}

async function submitModify() {
  if (!modifyReason.value.trim()) {
    window.$toast?.error('请输入修改原因')
    return
  }
  
  const result = await wishesStore.requestModify(selectedWish.value.id, modifyReason.value)
  if (result.success) {
    window.$toast?.success('申请已发送')
    closeModal()
  } else {
    window.$toast?.error(result.error)
  }
}

async function respondModify(wish, accept) {
  const result = await wishesStore.respondModify(wish.id, accept)
  if (result.success) {
    window.$toast?.success(accept ? '已同意修改' : '已拒绝修改')
  } else {
    window.$toast?.error(result.error)
  }
}

async function deleteWish(wish) {
  if (!confirm('确定要删除这个愿望吗？')) return
  
  const result = await wishesStore.deleteWish(wish.id)
  if (result.success) {
    window.$toast?.success('已删除')
  } else {
    window.$toast?.error(result.error)
  }
}

onMounted(() => {
  wishesStore.fetchWishes()
})
</script>

<style scoped>
.wishes-page {
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
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab.active {
  background: var(--female-primary);
  color: var(--white);
}

.male-theme .tab.active {
  background: var(--male-primary);
}

.page-container {
  padding: 20px;
  padding-bottom: calc(100px + var(--safe-area-bottom));
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.loading-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.wishes-list {
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.modal-content textarea {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions .btn {
  flex: 1;
}
</style>
