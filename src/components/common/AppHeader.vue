<template>
  <header class="site-header glass-effect">
    <div class="container header-inner">
      <router-link to="/" class="logo-wrapper">
        <img src="@/assets/logo.png" alt="SmartCodeCheck" class="logo-img" />
      </router-link>
      <nav class="main-nav">
        <router-link to="/" active-class="active" class="nav-link">
          <span class="link-content">首页</span>
        </router-link>
        <router-link to="/comparison" active-class="active" class="nav-link">
          <span class="link-content">代码对比</span>
        </router-link>
        <router-link to="/workspace" active-class="active" class="nav-link">
          <span class="link-content">工作台</span>
        </router-link>
        <router-link to="/dashboard" active-class="active" class="nav-link">
          <span class="link-content">统计</span>
        </router-link>
      </nav>

      <div class="actions">
        <template v-if="!authStore.token">
          <router-link to="/login" class="btn-ghost">登录</router-link>
          <router-link to="/register" class="btn-primary-glow">注册</router-link>
        </template>

        <div v-else class="user-pill">
          <div class="avatar-circle">
            {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <span class="username">{{ authStore.user?.username }}</span>
          <div class="divider-vertical"></div>
          <button @click="handleLogout" class="btn-logout" title="退出登录">
            <span class="icon">➜</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 0;
  transition: all 0.3s ease;
}

.glass-effect {
  background: rgba(13, 17, 23, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.header-inner {
  display: flex;
  /*Dn justify-content: space-between;  <-- 移除这个，改用 flex: 1 控制 */
  align-items: center;
  height: 40px;
}

/* --- 1. 左侧 Logo 区域 --- */
.logo-wrapper {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex: 1;      /* 占据左侧剩余空间 */
  min-width: 0; /* 防止极端情况下溢出 */
  margin-left: -10px;
}

.logo-img {
  height: 26px;
  width: auto;
  transition: transform 0.3s ease;
}

.logo-wrapper:hover .logo-img {
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
}

/* --- 2. 中间导航 --- */
.main-nav {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  /* 确保中间不被拉伸，保持自然宽度 */
  flex-shrink: 0; 
  max-width: 100%;
  /* 左右 margin 设为 auto 也是一种居中策略，但在 flex:1 布局下不需要 */
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  white-space: nowrap; /* 防止文字换行 */
}

@media (max-width: 1100px) {
  .header-inner {
    height: auto;
    gap: 10px;
  }

  .main-nav {
    overflow-x: auto;
  }

  .nav-link {
    padding: 6px 10px;
  }
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.active {
  color: #fff;
  background: var(--primary-color);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

/* --- 3. 右侧操作区 --- */
.actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;                   /* 占据右侧剩余空间 */
  justify-content: flex-end; /* 内容靠右对齐 */
  min-width: 0;
}

.btn-ghost {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s;
  white-space: nowrap;
}
.btn-ghost:hover { color: var(--text-primary); }

.btn-primary-glow {
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.btn-primary-glow:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

/* User Pill */
.user-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid var(--border-color);
  padding: 4px 6px 4px 12px;
  border-radius: 30px;
  transition: all 0.3s;
}

.user-pill:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(30, 30, 30, 0.8);
}

.avatar-circle {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #FF6B6B, #EE5253);
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.username {
  font-size: 0.85rem;
  color: var(--text-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.divider-vertical {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.1);
}

.btn-logout {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-logout:hover {
  background: rgba(218, 54, 51, 0.2);
  color: #ff6b6b;
}
</style>
