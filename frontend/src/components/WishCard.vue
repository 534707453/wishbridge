<template>
  <div class="wish-card animate-fade-in-up" :class="{ 'is-realized': wish.status === 'realized' }">
    <div class="card-header">
      <div class="card-info">
        <span class="sender-avatar">{{ wish.sender?.username?.charAt(0) }}</span>
        <div class="card-meta">
          <span class="sender-name">{{ wish.sender?.username }}</span>
          <span class="card-time">{{ formatTime(wish.created_at) }}</span>
        </div>
      </div>
      <span :class="['tag', getStatusClass(wish)]">
        {{ getStatusText(wish) }}
      </span>
    </div>
    
    <div class="card-content">
      {{ wish.content }}
    </div>
    
    <div v-if="wish.modify_status === 'pending'" class="modify-notice">
      <span class="notice-icon">💬</span>
      <div class="notice-content">
        <span class="notice-title">修改申请</span>
        <span class="notice-text">{{ wish.modify_request }}</span>
      </div>
    </div>
    
    <div class="card-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wish: {
    type: Object,
    required: true
  }
})

function formatTime(time) {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function getStatusClass(wish) {
  if (wish.modify_status === 'pending') return 'tag-pending-request'
  return wish.status === 'realized' ? 'tag-realized' : 'tag-pending'
}

function getStatusText(wish) {
  if (wish.modify_status === 'pending') return '待处理'
  return wish.status === 'realized' ? '已实现' : '待实现'
}
</script>

<style scoped>
.wish-card {
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.wish-card.is-realized {
  opacity: 0.85;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sender-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sender-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-time {
  font-size: 12px;
  color: var(--text-light);
}

.card-content {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 12px;
  word-break: break-word;
}

.modify-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background: #FFF3E0;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.notice-icon {
  font-size: 20px;
}

.notice-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-title {
  font-size: 12px;
  font-weight: 600;
  color: #E65100;
}

.notice-text {
  font-size: 13px;
  color: #BF360C;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
