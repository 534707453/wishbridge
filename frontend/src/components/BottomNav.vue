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
      <span class="nav-indicator"></span>
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 8px 0;
  padding-bottom: calc(8px + var(--safe-area-bottom));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--text-light);
  transition: all var(--transition-fast);
  position: relative;
  border-radius: 16px;
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-item.active {
  color: var(--female-primary);
}

body.male-theme .nav-item.active {
  color: var(--male-primary);
}

.nav-icon {
  font-size: 24px;
  transition: transform var(--transition-fast);
}

.nav-item.active .nav-icon {
  transform: scale(1.15);
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
}

.nav-indicator {
  position: absolute;
  bottom: -2px;
  width: 20px;
  height: 3px;
  background: var(--female-gradient);
  border-radius: 3px;
  opacity: 0;
  transform: scaleX(0);
  transition: all var(--transition-fast);
}

body.male-theme .nav-indicator {
  background: var(--male-gradient);
}

.nav-item.active .nav-indicator {
  opacity: 1;
  transform: scaleX(1);
}
</style>
