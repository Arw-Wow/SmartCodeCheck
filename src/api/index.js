import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1', 
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json'
  }
})

// --- 请求拦截器：自动携带 Token ---
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- 响应拦截器：处理 401 过期 ---
apiClient.interceptors.response.use(
  response => response,
  error => {
    const authStore = useAuthStore()
    
    // 如果是 401 未授权，且不是在登录页面，则强制登出
    if (error.response && error.response.status === 401) {
      authStore.logout()
    }
    
    // 用户主动取消
    if (error.name === 'CanceledError') {
      console.log('Request canceled by user')
    } else {
      console.error('API Error:', error)
    }
    return Promise.reject(error)
  }
)

export default {
  // --- Auth 接口 ---
  login(formData) {
    return apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  register(data) {
    return apiClient.post('/auth/register', data)
  },
  getMe() {
    return apiClient.get('/auth/me')
  },
  updateMe(data) {
    return apiClient.patch('/auth/me', data)
  },
  updatePassword(data) {
    return apiClient.patch('/auth/me/password', data)
  },
  updateTutorialProgress(data) {
    return apiClient.put('/auth/me/tutorial-progress', data)
  },

  // --- 维度管理接口 ---
  getDimensions() {
    return apiClient.get('/dimensions/')
  },
  createDimension(data) {
    // data: { name, description }
    return apiClient.post('/dimensions/', data)
  },
  deleteDimension(name) {
    return apiClient.delete(`/dimensions/${encodeURIComponent(name)}`)
  },

  // --- 历史记录接口 ---
  getHistory(type) {
    return apiClient.get('/history/', { params: { type } })
  },
  createHistory(data) {
    // data: { type: 'detection' | 'comparison', data: Object }
    return apiClient.post('/history/', data)
  },
  deleteHistory(id) {
    return apiClient.delete(`/history/${id}`)
  },

  // --- 业务接口 ---
  analyzeCode(data, signal) {
    return apiClient.post('/analyze', data, { signal }) 
  },
  compareCodes(data, signal) {
    return apiClient.post('/compare', data, { signal }) 
  }
}
