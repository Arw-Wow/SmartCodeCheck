import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const v2Client = axios.create({
  baseURL: 'http://localhost:8000/api/v2',
  timeout: 600000,
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
  },
  getRuleSets() {
    return v2Client.get('/rulesets')
  },
  createRuleSet(data) {
    return v2Client.post('/rulesets', data)
  },
  deleteRuleSet(id) {
    return v2Client.delete(`/rulesets/${id}`)
  },
  previewFix(data) {
    return v2Client.post('/fixes/preview', data)
  },
  applyFix(data) {
    return v2Client.post('/fixes/apply', data)
  },
  runValidation(data) {
    return v2Client.post('/validation/run', data)
  },
  createEvaluation(data) {
    return v2Client.post('/evaluations', data)
  },
  getEvaluations() {
    return v2Client.get('/evaluations')
  },
  getEvaluation(id) {
    return v2Client.get(`/evaluations/${id}`)
  },
  exportEvaluation(id, format = 'json') {
    return v2Client.get(`/evaluations/${id}/export`, { params: { format } })
  },
  getStatsOverview() {
    return v2Client.get('/stats/overview', { params: { _: Date.now() } })
  },
  getStatsIssues() {
    return v2Client.get('/stats/issues', { params: { _: Date.now() } })
  },
  getStatsTrends() {
    return v2Client.get('/stats/trends', { params: { _: Date.now() } })
  },
  getRuns() {
    return v2Client.get('/runs', { params: { _: Date.now() } })
  },
  getRun(id) {
    return v2Client.get(`/runs/${id}`)
  }
}
