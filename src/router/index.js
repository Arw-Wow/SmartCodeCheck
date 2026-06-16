import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGlobalDataStore } from '@/stores/index'
import HomeView from '@/views/HomeView.vue'
import DetectionView from '@/views/DetectionView.vue'
import ComparisonView from '@/views/ComparisonView.vue'
import WorkspaceView from '@/views/WorkspaceView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { 
    path: '/detection', 
    name: 'Detection', 
    component: DetectionView,
    meta: { requiresAuth: true } // 标记需要登录
  },
  {
    path: '/workspace',
    name: 'Workspace',
    component: WorkspaceView,
    meta: { requiresAuth: true }
  },
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
      try {
        await authStore.fetchUser()
      } catch (e) {}
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

export default router
