import axios from 'axios'
import { resolveApiBaseUrl } from './base-url.js'

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

// 从环境变量获取 API 基础 URL
// 开发环境：/api/v1（相对路径，代理到后端）
// 生产环境：完整的后端 URL
const API_BASE_URL = resolveApiBaseUrl(env.VITE_API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加 token
api.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('xinqing_token')
    const adminToken = localStorage.getItem('xinqing_admin_token')
    const token = config.url?.startsWith('/admin/') ? adminToken : userToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：处理 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config?.url?.startsWith('/admin/')) {
        localStorage.removeItem('xinqing_admin_token')
        localStorage.removeItem('xinqing_admin_user')
      } else {
        localStorage.removeItem('xinqing_token')
        localStorage.removeItem('xinqing_user')
      }
    }
    return Promise.reject(error)
  }
)

// 情绪记录 API
export const emotionApi = {
  // 创建情绪记录
  create: (data) => api.post('/emotion-records', data),

  // 获取情绪记录列表
  getList: (params) => api.get('/emotion-records', { params }),

  // 获取周报
  getWeeklyReport: () => api.get('/emotion-records/weekly-report'),

  // 提交详细心理分析
  submitAssessment: (data) => api.post('/psychological-assessments', data),
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

  // 删除条目
  delete: (id) => api.delete(`/treehole-entries/${id}`),
}

// 知识库 API
export const knowledgeApi = {
  getDailyQuote: () => api.get('/public/daily-quote'),
  getList: (params) => api.get('/public/knowledge-contents', { params }),
  getTopics: () => api.get('/public/knowledge-topics'),
}

// 用户认证 API
export const authApi = {
  // 注册
  register: (data) => api.post('/auth/register', data),

  // 登录
  login: (data) => api.post('/auth/login', data),

  // 获取当前用户信息
  getMe: () => api.get('/auth/me'),

  requestPasswordReset: (data) => api.post('/auth/password-reset/request', data),

  confirmPasswordReset: (data) => api.post('/auth/password-reset/confirm', data),
}

// 后台管理员认证 API
export const adminApi = {
  login: (data) => api.post('/admin/login', data),
  getMe: () => api.get('/admin/me'),
}

export const adminContentApi = {
  getDailyQuotes: () => api.get('/admin/daily-quotes'),
  createDailyQuote: (data) => api.post('/admin/daily-quotes', data),
  updateDailyQuote: (id, data) => api.put(`/admin/daily-quotes/${id}`, data),
  deleteDailyQuote: (id) => api.delete(`/admin/daily-quotes/${id}`),
  getKnowledgeContents: () => api.get('/admin/knowledge-contents'),
  createKnowledgeContent: (data) => api.post('/admin/knowledge-contents', data),
  updateKnowledgeContent: (id, data) => api.put(`/admin/knowledge-contents/${id}`, data),
  deleteKnowledgeContent: (id) => api.delete(`/admin/knowledge-contents/${id}`),
  getKnowledgeTopics: () => api.get('/admin/knowledge-topics'),
  createKnowledgeTopic: (data) => api.post('/admin/knowledge-topics', data),
  updateKnowledgeTopic: (id, data) => api.put(`/admin/knowledge-topics/${id}`, data),
  deleteKnowledgeTopic: (id) => api.delete(`/admin/knowledge-topics/${id}`),
}

// 游戏 API
export const gamesApi = {
  // 获取所有游戏进度
  getProgress: () => api.get('/games/progress'),

  // 获取单个游戏进度
  getProgressByType: (gameType) => api.get(`/games/progress/${gameType}`),

  // 更新游戏进度
  updateProgress: (gameType, data) => api.post(`/games/progress/${gameType}`, data),

  // 同步本地数据到服务器
  sync: (data) => api.post('/games/sync', data),

  // 记录游戏会话
  recordSession: (data) => api.post('/games/record', data),
}

export default api

// 导出 API 基础 URL，用于调试
if (env.DEV) {
  console.log('🔧 开发环境：使用相对路径', API_BASE_URL)
} else {
  console.log('🚀 生产环境：使用完整 URL', API_BASE_URL)
}
