import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { emotionApi } from '../api'

export const useEmotionStore = defineStore('emotion', () => {
  // 状态
  const currentRecord = reactive({
    mood: '',
    energyLevel: 50,
    sleepQuality: 3,
    stressSources: [],
    socialPreference: '',
    happyMoment: '',
    happyMomentType: 'text',
  })

  const records = ref([])
  const weeklyReport = ref(null)

  // Actions
  async function createRecord(recordData) {
    try {
      const response = await emotionApi.create(recordData)
      records.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('创建情绪记录失败:', error)
      throw error
    }
  }

  async function fetchRecords(params = {}) {
    try {
      const response = await emotionApi.getList(params)
      records.value = response.data
      return response.data
    } catch (error) {
      console.error('获取情绪记录失败:', error)
      throw error
    }
  }

  async function fetchWeeklyReport(params = {}) {
    try {
      const response = await emotionApi.getWeeklyReport(params)
      weeklyReport.value = response.data
      return response.data
    } catch (error) {
      console.error('获取周报失败:', error)
      throw error
    }
  }

  function setCurrentRecord(record) {
    Object.assign(currentRecord, record)
  }

  function resetCurrentRecord() {
    Object.assign(currentRecord, {
      mood: '',
      energyLevel: 50,
      sleepQuality: 3,
      stressSources: [],
      socialPreference: '',
      happyMoment: '',
      happyMomentType: 'text',
    })
  }

  return {
    currentRecord,
    records,
    weeklyReport,
    createRecord,
    fetchRecords,
    fetchWeeklyReport,
    setCurrentRecord,
    resetCurrentRecord,
  }
})
