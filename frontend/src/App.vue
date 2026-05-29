<template>
  <div :class="['app-wrapper', { 'male-theme': isMale }]">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <BottomNav v-if="isLoggedIn" />
    
    <Toast />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { initSocket, requestNotificationPermission } from '@/services/socket'
import BottomNav from '@/components/BottomNav.vue'
import Toast from '@/components/Toast.vue'

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isMale = computed(() => authStore.isMale)

function updateStatusBarColor() {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isMale.value ? '#6C5CE7' : '#FF6B9D')
  }
  
  if (typeof Android !== 'undefined' && Android.setStatusBarColor) {
    Android.setStatusBarColor(isMale.value ? '#6C5CE7' : '#FF6B9D')
  }
}

onMounted(() => {
  if (authStore.token) {
    initSocket()
    requestNotificationPermission()
  }
  updateStatusBarColor()
})

watch(() => authStore.token, (newToken) => {
  if (newToken) {
    initSocket()
    requestNotificationPermission()
  }
})

watch(isMale, () => {
  updateStatusBarColor()
})
</script>

<style scoped>
.app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--female-bg);
  transition: background var(--transition-normal);
}

.app-wrapper.male-theme {
  background: var(--male-bg);
}
</style>
