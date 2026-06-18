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
        <router-link to="/workspace" active-class="active" class="nav-link">
          <span class="link-content">工作台</span>
        </router-link>
        <router-link to="/comparison" active-class="active" class="nav-link">
          <span class="link-content">代码对比</span>
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

        <div v-else class="user-menu">
          <button class="user-pill" data-tour-id="header-user-menu" @click="menuOpen = !menuOpen">
            <div class="avatar-circle">
              {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="username">{{ authStore.user?.username }}</span>
            <span class="menu-caret" :class="{ open: menuOpen }">▼</span>
          </button>
          <div v-if="menuOpen" class="user-dropdown">
            <router-link to="/settings/account" class="dropdown-item" @click="menuOpen = false">
              用户设置
            </router-link>
            <button type="button" class="dropdown-item danger" @click="handleLogout">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    menuOpen.value = false
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
  align-items: center;
  height: 40px;
  width: min(1680px, calc(100% - 48px));
  max-width: none;
  padding: 0;
  margin: 0 auto;
}

/* --- 1. 左侧 Logo 区域 --- */
.logo-wrapper {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex: 1;      /* 占据左侧剩余空间 */
  min-width: 0; /* 防止极端情况下溢出 */
  margin-left: 30px;
}

.logo-img {
  height: 26px;
  max-width: min(298px, 100%);
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

@media (max-width: 760px) {
  .site-header {
    padding: 10px 0;
  }

  .header-inner {
    flex-wrap: wrap;
    row-gap: 10px;
    width: calc(100% - 32px);
  }

  .logo-wrapper {
    flex: 1 1 150px;
    margin-left: 0;
  }

  .logo-img {
    height: 22px;
    max-width: 180px;
  }

  .actions {
    flex: 0 0 auto;
    gap: 10px;
  }

  .main-nav {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .main-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    flex: 0 0 auto;
    font-size: 0.84rem;
  }

  .user-pill {
    gap: 8px;
    padding-left: 8px;
  }

  .username {
    max-width: 58px;
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
  margin-right: 30px;
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

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
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
  color: var(--text-primary);
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

.menu-caret {
  color: var(--text-secondary);
  font-size: 0.68rem;
  transition: transform 0.2s;
}

.menu-caret.open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 120;
  display: grid;
  min-width: 148px;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: rgba(13, 17, 23, 0.96);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.dropdown-item {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.88rem;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-item.danger {
  color: #ff8a8a;
}

.dropdown-item.danger:hover {
  background: rgba(218, 54, 51, 0.2);
  color: #ff6b6b;
}
</style>
