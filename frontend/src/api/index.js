import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 情绪记录 API
export const emotionApi = {
  // 创建情绪记录
  create: (data) => api.post('/emotion-records', data),
  
  // 获取情绪记录列表
  getList: (params) => api.get('/emotion-records', { params }),
  
  // 获取周报
  getWeeklyReport: () => api.get('/emotion-records/weekly-report'),
}

// 正念练习 API
export const mindfulnessApi = {
  // 创建练习记录
  create: (data) => api.post('/mindfulness-sessions', data),
}

// 秘密树洞 API
export const treeholeApi = {
  // 创建条目
  create: (data) => api.post('/treehole-entries', data),
  
  // 获取已发布的条目
  getPublished: (params) => api.get('/treehole-entries', { params }),
}

// 知识库 API
export const knowledgeApi = {
  // 获取内容列表
  getList: (params) => api.get('/knowledge-contents', { params }),
}

export default api
