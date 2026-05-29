import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useMoodsStore = defineStore('moods', () => {
  const currentMood = ref(null)
  const partnerMood = ref(null)
  const history = ref([])
  const loading = ref(false)

  const MOOD_OPTIONS = [
    { emoji: '😊', label: '开心' },
    { emoji: '😢', label: '难过' },
    { emoji: '😡', label: '生气' },
    { emoji: '😴', label: '疲惫' },
    { emoji: '🤔', label: '思考' },
    { emoji: '🥰', label: '甜蜜' },
    { emoji: '😰', label: '焦虑' },
    { emoji: '😤', label: '委屈' }
  ]

  async function fetchCurrentMood() {
    try {
      const response = await api.get('/moods/current')
      if (response.data.success) {
        currentMood.value = response.data.data
      }
    } catch (error) {
      console.error('获取当前心情失败:', error)
    }
  }

  async function fetchPartnerMood() {
    try {
      const response = await api.get('/moods/partner')
      if (response.data.success) {
        partnerMood.value = response.data.data
      }
    } catch (error) {
      console.error('获取伴侣心情失败:', error)
    }
  }

  async function updateMood(mood, note = '') {
    loading.value = true
    try {
      const response = await api.post('/moods', { mood, note })
      if (response.data.success) {
        currentMood.value = response.data.data
        return { success: true }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || '更新失败' }
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory() {
    try {
      const response = await api.get('/moods/history')
      if (response.data.success) {
        history.value = response.data.data.moods
      }
    } catch (error) {
      console.error('获取心情历史失败:', error)
    }
  }

  function setPartnerMood(moodData) {
    partnerMood.value = {
      mood: moodData.mood,
      note: moodData.note,
      updated_at: moodData.updated_at
    }
  }

  return {
    currentMood,
    partnerMood,
    history,
    loading,
    MOOD_OPTIONS,
    fetchCurrentMood,
    fetchPartnerMood,
    updateMood,
    fetchHistory,
    setPartnerMood
  }
})
