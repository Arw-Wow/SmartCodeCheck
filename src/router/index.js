import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGlobalDataStore } from '@/stores/index'
import HomeView from '@/views/HomeView.vue'
import ComparisonView from '@/views/ComparisonView.vue'
import WorkspaceView from '@/views/WorkspaceView.vue'
import DetectionView from '@/views/DetectionView.vue'
import RuleSetsView from '@/views/RuleSetsView.vue'
import EvaluationsView from '@/views/EvaluationsView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ModelSettingsView from '@/views/ModelSettingsView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/detection', name: 'Detection', component: DetectionView, meta: { requiresAuth: true } },
  {
    path: '/workspace',
    name: 'Workspace',
    component: WorkspaceView,
    meta: { requiresAuth: true }
  },
  { path: '/rulesets', name: 'RuleSets', component: RuleSetsView, meta: { requiresAuth: true } },
  { path: '/evaluations', name: 'Evaluations', component: EvaluationsView, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/settings/models', name: 'ModelSettings', component: ModelSettingsView, meta: { requiresAuth: true } },
  { 
    path: '/comparison', 
    name: 'Comparison', 
    component: ComparisonView,
    meta: { requiresAuth: true } // 标记需要登录
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// --- 全局前置守卫 ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const globalStore = useGlobalDataStore() // 引入 GlobalStore
  
  // 如果用户已登录但没有用户信息
  if (authStore.token) {
    if (!authStore.user) {
      const authenticated = await withTimeout(authStore.fetchUser(), 3000, true)
      if (!authenticated && to.meta.requiresAuth) {
        next('/login')
        return
      }
    }
    
    // 如果已登录，且自定义维度为空，拉取维度
    // 这里为了实时性，采用简单的静默拉取。只要有 Token 就尝试静默拉取一次，保证数据最新
    globalStore.fetchDefinitions().catch(() => {})
  }

  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
  } else {
    next()
  }
})

function withTimeout(promise, timeoutMs, fallbackValue) {
  return Promise.race([
    promise,
    new Promise(resolve => globalThis.setTimeout(() => resolve(fallbackValue), timeoutMs))
  ])
}

export default router
