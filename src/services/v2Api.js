import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const v2Client = axios.create({
  baseURL: 'http://localhost:8000/api/v2',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

v2Client.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) config.headers.Authorization = `Bearer ${authStore.token}`
  return config
})

v2Client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore().logout()
    }
    return Promise.reject(error)
  }
)

export default {
  analyze(data, signal) {
    return v2Client.post('/analyze', data, { signal })
  },
  getModels() {
    return v2Client.get('/models')
  },
  createModel(data) {
    return v2Client.post('/models', data)
  },
  checkModel(id) {
    return v2Client.post(`/models/${id}/health-check`)
  },
  getPrompts() {
    return v2Client.get('/prompts')
  },
  createPrompt(data) {
    return v2Client.post('/prompts', data)
  }
}
