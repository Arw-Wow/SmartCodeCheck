<template>
  <main class="v2-page">
    <section class="page-head">
      <div>
        <h2>规则集</h2>
        <p>上传团队规范、课程评分标准或安全红线文档，把整份文档作为工作台分析时的检测标准。文档可以覆盖多个潜在方向，问题仍归类到工作台选择的检测维度。</p>
      </div>
      <router-link to="/workspace" class="secondary-link">去工作台使用</router-link>
    </section>

    <section class="usage-panel">
      <article>
        <strong>1. 上传文档</strong>
        <span>选择 Markdown、TXT、JSON、YAML 或 CSV 等文本规范文档，也可以直接粘贴正文。</span>
      </article>
      <article>
        <strong>2. 作为标准</strong>
        <span>规范文档会随分析请求传给模型，用来判断代码是否符合团队约定。</span>
      </article>
      <article>
        <strong>3. 在工作台启用</strong>
        <span>分析前从“规则集”下拉框选择，检测维度仍在工作台单独控制。</span>
      </article>
    </section>

    <section class="form-panel">
      <div class="form-row">
        <input v-model="draft.name" placeholder="规则集名称，例如：后端团队编码规范" />
        <label class="file-control">
          <input
            type="file"
            accept=".md,.markdown,.txt,.json,.jsonl,.yaml,.yml,.csv,.text"
            @change="handleFileUpload"
          />
          <span>{{ draft.fileName || '上传规范文档' }}</span>
        </label>
      </div>
      <textarea
        v-model="draft.content"
        placeholder="粘贴团队规范文档正文，例如命名约定、异常处理、日志规范、安全要求、提交质量标准等。"
      ></textarea>
      <div class="form-footer">
        <p>{{ documentStats }}</p>
        <button :disabled="loading" @click="createStandard">{{ loading ? '创建中...' : '新建规则集' }}</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section class="list">
      <article v-for="item in ruleSets" :key="item.id" class="row">
        <div>
          <strong>{{ item.name }}</strong>
          <span>{{ standardLabel(item) }}</span>
          <small v-if="standardExcerpt(item)">{{ standardExcerpt(item) }}</small>
        </div>
        <button @click="remove(item.id)">删除</button>
      </article>
      <p v-if="!ruleSets.length" class="empty">还没有规则集。先上传或粘贴规范文档，再到工作台选择使用。</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import v2Api from '@/services/v2Api'

const ruleSets = ref([])
const loading = ref(false)
const error = ref('')
const draft = reactive({
  name: '',
  content: '',
  fileName: ''
})

const documentStats = computed(() => {
  const length = draft.content.trim().length
  if (!length) return '支持上传或粘贴文本规范文档，正文会作为跨维度检测标准。'
  return `已载入 ${length} 个字符，将作为工作台分析的检测标准。`
})

async function load() {
  ruleSets.value = (await v2Api.getRuleSets()).data
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 1024 * 1024) {
    error.value = '规范文档不能超过 1MB'
    event.target.value = ''
    return
  }
  try {
    draft.content = await file.text()
    draft.fileName = file.name
    if (!draft.name.trim()) {
      draft.name = file.name.replace(/\.[^.]+$/, '') || file.name
    }
    error.value = ''
  } catch (err) {
    error.value = err.message || '读取规范文档失败'
  } finally {
    event.target.value = ''
  }
}

async function createStandard() {
  if (!draft.name.trim() || !draft.content.trim()) {
    error.value = '请填写规则集名称并上传或粘贴规范文档'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await v2Api.createRuleSet({
      name: draft.name.trim(),
      description: draft.fileName ? `上传自 ${draft.fileName}` : '从规范文档创建',
      visibility: 'private',
      standard_document: draft.content.trim(),
      document_title: draft.fileName || '团队规范文档'
    })
    draft.name = ''
    draft.content = ''
    draft.fileName = ''
    await load()
  } catch (err) {
    error.value = err.response?.data?.detail?.message || err.message
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  if (!confirm('确定删除这个规则集吗？')) return
  await v2Api.deleteRuleSet(id)
  await load()
}

function primaryRule(item) {
  return item.rules?.[0] || null
}

function standardLabel(item) {
  const rule = primaryRule(item)
  if (!rule) return '未包含规范文档'
  if (rule.dimension === 'standard') return rule.title || '团队规范文档'
  return `${item.rules?.length || 0} 条兼容规则`
}

function standardExcerpt(item) {
  const content = primaryRule(item)?.content || item.description || ''
  return content.length > 120 ? `${content.slice(0, 120)}...` : content
}

onMounted(load)
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head { display: flex; gap: 18px; align-items: flex-start; justify-content: space-between; }
.page-head h2 { margin: 0 0 8px; }
.page-head p { margin: 0; max-width: 780px; color: var(--text-secondary); line-height: 1.7; }
.secondary-link,
input,
button {
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,.06);
  color: var(--text-primary);
  padding: 0 10px;
}
.secondary-link { display: inline-flex; align-items: center; white-space: nowrap; }
.usage-panel { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.usage-panel article,
.form-panel,
.row {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: rgba(255,255,255,.035);
}
.usage-panel article { display: grid; gap: 6px; padding: 14px; }
.usage-panel span,
.row span,
.row small,
.empty { color: var(--text-secondary); font-size: .86rem; line-height: 1.5; }
.form-panel { display: grid; gap: 10px; padding: 14px; }
.form-row { display: flex; gap: 10px; align-items: center; }
.form-row input { flex: 1; min-width: 0; }
.file-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  max-width: 260px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,.06);
  color: var(--text-primary);
  padding: 0 10px;
  cursor: pointer;
}
.file-control input { display: none; }
.file-control span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
textarea {
  min-height: 220px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,.06);
  color: var(--text-primary);
  padding: 10px;
  resize: vertical;
}
.form-footer {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}
.form-footer p {
  color: var(--text-secondary);
  font-size: .86rem;
  line-height: 1.5;
  margin: 0;
}
.list { display: grid; gap: 8px; }
.row { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 12px; }
.row div { display: grid; gap: 4px; }
.error { color: #ff6b6b; margin: 0; }
.empty { margin: 6px 0; }
@media (max-width: 860px) {
  .page-head,
  .form-row,
  .form-footer,
  .row { align-items: stretch; flex-direction: column; }
  .usage-panel { grid-template-columns: 1fr; }
  .file-control { max-width: none; }
}
</style>
