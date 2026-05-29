import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useWishesStore = defineStore('wishes', () => {
  const wishes = ref([])
  const loading = ref(false)
  const pagination = ref({ page: 1, limit: 20, total: 0 })

  async function fetchWishes(status = 'all', page = 1) {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.append('status', status)
      params.append('page', page)
      params.append('limit', pagination.value.limit)
      
      const response = await api.get(`/wishes?${params.toString()}`)
      if (response.data.success) {
        wishes.value = response.data.data.wishes
        pagination.value = response.data.data.pagination
      }
    } catch (error) {
      console.error('获取愿望列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function sendWish(content) {
    try {
      const response = await api.post('/wishes', { content })
      if (response.data.success) {
        wishes.value.unshift(response.data.data.wish)
        return { success: true, wish: response.data.data.wish }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '发送失败' }
    }
  }

  async function updateWishStatus(wishId, status) {
    try {
      const response = await api.put(`/wishes/${wishId}/status`, { status })
      if (response.data.success) {
        const index = wishes.value.findIndex(w => w.id === wishId)
        if (index !== -1) {
          wishes.value[index] = response.data.data.wish
        }
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '更新失败' }
    }
  }

  async function requestModify(wishId, reason) {
    try {
      const response = await api.put(`/wishes/${wishId}/modify`, { reason })
      if (response.data.success) {
        const index = wishes.value.findIndex(w => w.id === wishId)
        if (index !== -1) {
          wishes.value[index].modify_status = 'pending'
          wishes.value[index].modify_request = reason
        }
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '申请失败' }
    }
  }

  async function respondModify(wishId, accept) {
    try {
      const response = await api.put(`/wishes/${wishId}/modify/respond`, { accept })
      if (response.data.success) {
        const index = wishes.value.findIndex(w => w.id === wishId)
        if (index !== -1) {
          wishes.value[index].modify_status = response.data.data.modify_status
        }
        return { success: true, accept }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '响应失败' }
    }
  }

  async function deleteWish(wishId) {
    try {
      const response = await api.delete(`/wishes/${wishId}`)
      if (response.data.success) {
        wishes.value = wishes.value.filter(w => w.id !== wishId)
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '删除失败' }
    }
  }

  function addWish(wish) {
    const exists = wishes.value.find(w => w.id === wish.id)
    if (!exists) {
      wishes.value.unshift(wish)
    }
  }

  function updateWish(updatedWish) {
    const index = wishes.value.findIndex(w => w.id === updatedWish.id)
    if (index !== -1) {
      wishes.value[index] = updatedWish
    }
  }

  return {
    wishes,
    loading,
    pagination,
    fetchWishes,
    sendWish,
    updateWishStatus,
    requestModify,
    respondModify,
    deleteWish,
    addWish,
    updateWish
  }
})
