import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import router from '@/router'
import { useGlobalDataStore } from '@/stores/index'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref('')
    const user = ref(null)

    // 登录动作
    const login = async (username, password) => {
      try {
        const formData = new FormData()
        formData.append('username', username)
        formData.append('password', password)
        
        const res = await api.login(formData)
        token.value = res.data.access_token
        
        // 登录成功后获取用户信息
        await fetchUser()
        return true
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    }

    // 注册动作
    const register = async (username, password, email) => {
      try {
        await api.register({ username, password, email })
        return true
      } catch (error) {
        throw error
      }
    }

    // 获取用户信息
    const fetchUser = async () => {
      if (!token.value) return
      try {
        const res = await api.getMe()
        user.value = res.data
      } catch (error) {
        logout()
      }
    }

    // 登出动作
    const logout = () => {
      // 清除 Auth 信息
      token.value = ''
      user.value = null
      
      // 清除全局业务数据 (防止下一个用户看到)
      const globalStore = useGlobalDataStore()
      globalStore.resetState()

      // 跳转
      router.push('/login')
    }

    return {
      token,
      user,
      login,
      register,
      fetchUser,
      logout
    }
  },
  {
    // 持久化存储 Token，刷新页面不丢失
    persist: {
      key: 'auth-store',
      storage: localStorage,
      paths: ['token'] 
    }
  }
)
