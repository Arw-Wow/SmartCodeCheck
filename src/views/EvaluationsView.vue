<template>
  <main class="v2-page">
    <section class="page-head">
      <div>
        <h2>批量评测</h2>
        <p>用于一次性评测多条样本。每行是一个 JSON 对象，至少包含 `id`、`language`、`code` 字段。</p>
      </div>
      <button :disabled="submitting" @click="submit">{{ submitting ? '运行中...' : '运行 JSONL' }}</button>
    </section>

    <section class="jsonl-panel">
      <div class="upload-row">
        <label class="file-picker">
          上传 JSONL
          <input ref="fileInput" type="file" accept=".jsonl,.txt,application/jsonl,text/plain" @change="handleFileSelect" />
        </label>
        <span v-if="fileName">{{ fileName }}</span>
        <button type="button" @click="clearJsonl">清空</button>
      </div>
      <textarea v-model="jsonl" placeholder='{"id":"sample-1","language":"Python","prompt":"","code":"print(1)"}'></textarea>
      <div class="hint-row">
        <span>{{ sampleCount }} 条样本</span>
        <span v-if="message" class="message">{{ message }}</span>
        <span v-if="error" class="error">{{ error }}</span>
      </div>
    </section>

    <section class="list">
      <article v-for="task in tasks" :key="task.id" class="row">
        <strong>{{ task.name }}</strong>
        <span>{{ statusText(task.status) }} · {{ task.progress }}%</span>
      </article>
      <p v-if="!tasks.length" class="empty">还没有评测任务。</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import v2Api from '@/services/v2Api'

const jsonl = ref('{"id":"sample-1","language":"Python","prompt":"","code":"print(1)"}')
const tasks = ref([])
const fileInput = ref(null)
const fileName = ref('')
const submitting = ref(false)
const error = ref('')
const message = ref('')

const sampleCount = computed(() => jsonl.value.split(/\r?\n/).filter(line => line.trim()).length)

async function load() {
  try {
    tasks.value = (await v2Api.getEvaluations()).data
  } catch (err) {
    error.value = err.response?.data?.detail?.message || err.message
  }
}

async function submit() {
  if (!jsonl.value.trim()) {
    error.value = '请先粘贴或上传 JSONL 内容'
    return
  }
  submitting.value = true
  error.value = ''
  message.value = ''
  try {
    const response = await v2Api.createEvaluation({ name: `批量评测-${Date.now()}`, jsonl: jsonl.value })
    message.value = `已完成 ${response.data.sample_count || sampleCount.value} 条样本`
    await load()
  } catch (err) {
    error.value = err.response?.data?.detail?.message || err.message
  } finally {
    submitting.value = false
  }
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.jsonl') && !file.name.toLowerCase().endsWith('.txt')) {
    error.value = '请上传 .jsonl 或 .txt 文件'
    event.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    jsonl.value = String(reader.result || '')
    fileName.value = file.name
    error.value = ''
    message.value = '文件已载入，可以运行评测'
  }
  reader.onerror = () => {
    error.value = '文件读取失败'
  }
  reader.readAsText(file)
  event.target.value = ''
}

function clearJsonl() {
  jsonl.value = ''
  fileName.value = ''
  message.value = ''
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function statusText(status) {
  return {
    queued: '排队中',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    canceled: '已取消'
  }[status] || status
}

onMounted(load)
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head, .row, .upload-row, .hint-row { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
.page-head h2 { margin: 0 0 8px; }
.page-head p { margin: 0; color: var(--text-secondary); }
.jsonl-panel { display: grid; gap: 10px; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; background: rgba(255,255,255,.035); }
textarea { min-height: 220px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 10px; font-family: 'Fira Code', Consolas, monospace; line-height: 1.55; }
button,
.file-picker { height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 0 10px; }
button:disabled { cursor: wait; opacity: .65; }
.file-picker { display: inline-flex; align-items: center; cursor: pointer; }
.file-picker input { display: none; }
.list { display: grid; gap: 8px; }
.row { padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; }
.hint-row,
.upload-row span,
.empty { color: var(--text-secondary); font-size: .86rem; }
.message { color: var(--success-color); }
.error { color: #ff6b6b; }
@media (max-width: 760px) {
  .page-head,
  .upload-row,
  .hint-row,
  .row { align-items: stretch; flex-direction: column; }
}
</style>
