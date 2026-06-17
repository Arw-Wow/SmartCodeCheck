<template>
  <main class="settings-page">
    <section class="page-head">
      <div>
        <h2>用户设置</h2>
        <p>管理账号资料、安全设置和新手教程进度。</p>
      </div>
    </section>

    <section class="settings-grid">
      <article class="settings-panel">
        <header>
          <h3>账号资料</h3>
          <span>{{ authStore.user?.username }}</span>
        </header>
        <label class="field">
          <span>用户名</span>
          <input v-model.trim="profileForm.username" autocomplete="username" />
        </label>
        <label class="field">
          <span>邮箱</span>
          <input v-model.trim="profileForm.email" type="email" autocomplete="email" placeholder="未绑定邮箱" />
        </label>
        <button class="primary-action" :disabled="profileSaving" @click="saveProfile">
          {{ profileSaving ? '保存中...' : '保存资料' }}
        </button>
      </article>

      <article class="settings-panel">
        <header>
          <h3>安全设置</h3>
          <span>修改密码</span>
        </header>
        <label class="field">
          <span>当前密码</span>
          <input v-model="passwordForm.current_password" type="password" autocomplete="current-password" />
        </label>
        <label class="field">
          <span>新密码</span>
          <input v-model="passwordForm.new_password" type="password" autocomplete="new-password" />
        </label>
        <button class="primary-action" :disabled="passwordSaving" @click="savePassword">
          {{ passwordSaving ? '修改中...' : '修改密码' }}
        </button>
      </article>

      <article class="settings-panel wide">
        <header>
          <div>
            <h3>教程与帮助</h3>
            <p>{{ tutorial.completedCount }} / {{ tutorial.definitions.length }} 个教程已完成</p>
          </div>
          <button class="secondary-action" @click="resetTutorials">重置全部教程</button>
        </header>

        <div class="tutorial-list">
          <div v-for="definition in tutorial.definitions" :key="definition.key" class="tutorial-row">
            <span>
              <strong>{{ definition.title }}</strong>
              <small>{{ tutorial.isCompleted(definition.key) ? '已完成' : '未完成' }}</small>
            </span>
            <button @click="replayTutorial(definition)">重新播放</button>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useTutorialStore } from '@/stores/tutorials'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const tutorial = useTutorialStore()

const profileSaving = ref(false)
const passwordSaving = ref(false)
const profileForm = reactive({ username: '', email: '' })
const passwordForm = reactive({ current_password: '', new_password: '' })

watch(
  () => authStore.user,
  (user) => {
    profileForm.username = user?.username || ''
    profileForm.email = user?.email || ''
    tutorial.hydrateFromUser(true)
  },
  { immediate: true }
)

onMounted(() => {
  tutorial.hydrateFromUser()
})

async function saveProfile() {
  if (!profileForm.username) return toast.warning('请输入用户名')
  profileSaving.value = true
  try {
    await authStore.updateProfile({
      username: profileForm.username,
      email: profileForm.email || null
    })
    toast.success('账号资料已保存')
  } catch (error) {
    toast.error(error.response?.data?.detail || error.message || '保存失败')
  } finally {
    profileSaving.value = false
  }
}

async function savePassword() {
  if (!passwordForm.current_password || !passwordForm.new_password) return toast.warning('请填写当前密码和新密码')
  passwordSaving.value = true
  try {
    await authStore.updatePassword({ ...passwordForm })
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    toast.success('密码已修改')
  } catch (error) {
    toast.error(error.response?.data?.detail || error.message || '修改失败')
  } finally {
    passwordSaving.value = false
  }
}

function resetTutorials() {
  if (!confirm('确定重置所有新手教程进度吗？')) return
  tutorial.resetAll()
  toast.success('教程进度已重置')
}

function replayTutorial(definition) {
  tutorial.requestReplay(definition.key)
  router.push({ name: definition.routeName })
}
</script>

<style scoped>
.settings-page {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.page-head h2,
.page-head p,
.settings-panel h3,
.settings-panel p {
  margin: 0;
}

.page-head p,
.settings-panel header span,
.settings-panel header p,
.tutorial-row small {
  color: var(--text-secondary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.settings-panel {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.035);
}

.settings-panel.wide {
  grid-column: 1 / -1;
}

.settings-panel header,
.tutorial-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span {
  color: var(--text-secondary);
  font-size: 0.86rem;
}

input,
button {
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0 10px;
}

button {
  font-weight: 700;
}

.primary-action {
  justify-self: start;
  border-color: rgba(47, 129, 247, 0.8);
  background: var(--primary-color);
  color: white;
}

.secondary-action {
  white-space: nowrap;
}

.tutorial-list {
  display: grid;
  gap: 8px;
}

.tutorial-row {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.16);
}

.tutorial-row span {
  display: grid;
  gap: 4px;
}

@media (max-width: 760px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .settings-panel header,
  .tutorial-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
