<template>
  <nav class="bottom-nav">
    <router-link 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: $route.path === item.path }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const navItems = computed(() => {
  if (authStore.isFemale) {
    return [
      { path: '/home', icon: '🏠', label: '首页' },
      { path: '/wishes', icon: '🎁', label: '愿望' },
      { path: '/send-wish', icon: '✨', label: '发送' },
      { path: '/mood', icon: '💝', label: '心情' },
      { path: '/profile', icon: '👤', label: '我的' }
    ]
  } else {
    return [
      { path: '/home', icon: '🏠', label: '首页' },
      { path: '/wishes', icon: '🎁', label: '愿望' },
      { path: '/mood', icon: '💝', label: '心情' },
      { path: '/profile', icon: '👤', label: '我的' }
    ]
  }
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--bg);
  padding: 8px 0;
  padding-bottom: calc(8px + var(--safe-area-bottom));
  box-shadow: 0 -1px 0 var(--border-light);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  text-decoration: none;
  color: var(--text-light);
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
}

.nav-item:active {
  transform: scale(0.96);
}

.nav-item.active {
  color: var(--primary);
  background: var(--bg-secondary);
}

.nav-icon {
  font-size: 22px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
}
</style>
