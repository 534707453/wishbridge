import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('wishbridge_token') || null)
  const partner = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isFemale = computed(() => user.value?.gender === 'female')
  const isMale = computed(() => user.value?.gender === 'male')
  const isPaired = computed(() => !!partner.value)

  async function login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password })
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.user
        partner.value = response.data.data.user.partner
        localStorage.setItem('wishbridge_token', token.value)
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '登录失败' }
    }
  }

  async function register(data) {
    try {
      const response = await api.post('/auth/register', data)
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.user
        localStorage.setItem('wishbridge_token', token.value)
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '注册失败' }
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        user.value = response.data.data.user
        partner.value = response.data.data.user.partner
      }
    } catch (error) {
      logout()
    }
  }

  async function changePassword(oldPassword, newPassword) {
    try {
      const response = await api.put('/auth/password', { oldPassword, newPassword })
      return { success: response.data.success, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '修改失败' }
    }
  }

  async function bindPair(pairCode) {
    try {
      const response = await api.post('/pair/bind', { pair_code: pairCode })
      if (response.data.success) {
        partner.value = response.data.data.partner
        user.value = { ...user.value, partner: partner.value }
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '配对失败' }
    }
  }

  async function unbindPair() {
    try {
      const response = await api.delete('/pair/unbind')
      if (response.data.success) {
        partner.value = null
        user.value = { ...user.value, partner: null }
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '解除配对失败' }
    }
  }

  function logout() {
    user.value = null
    partner.value = null
    token.value = null
    localStorage.removeItem('wishbridge_token')
  }

  if (token.value) {
    fetchUser()
  }

  return {
    user,
    token,
    partner,
    isLoggedIn,
    isFemale,
    isMale,
    isPaired,
    login,
    register,
    fetchUser,
    changePassword,
    bindPair,
    unbindPair,
    logout
  }
})
