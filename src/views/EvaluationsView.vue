<template>
  <main class="v2-page">
    <section class="page-head">
      <div>
        <h2>批量检测</h2>
        <p>支持 JSONL、多行 JSON 对象或 JSON 数组；每条样本至少包含 `id`、`language`、`code` 字段。</p>
      </div>
      <button class="primary-action" :disabled="submitting" @click="submit">
        {{ submitting ? '检测中...' : '运行 JSONL' }}
      </button>
    </section>

    <section class="config-panel">
      <div class="mode-row">
        <button
          v-for="mode in modes"
          :key="mode.id"
          type="button"
          :class="['mode-option', { active: analysisMode === mode.id }]"
          @click="analysisMode = mode.id"
        >
          <strong>{{ mode.label }}</strong>
          <span>{{ mode.description }}</span>
        </button>
      </div>

      <div class="config-grid">
        <label v-if="analysisMode !== 'fast'" class="field">
          <span>模型选择</span>
          <select v-model="modelName">
            <option value="deepseek-v3.1">DeepSeek V3.1</option>
            <option value="qwen3-coder-plus">Qwen3 Coder+</option>
            <option value="gpt-5-mini">GPT-5 Mini</option>
            <option value="gpt-5">GPT-5</option>
            <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
            <option value="custom-local">自定义本地模型</option>
          </select>
        </label>
        <label v-if="analysisMode !== 'fast' && modelName === 'custom-local'" class="field">
          <span>API Base URL</span>
          <input v-model="localConfig.base_url" placeholder="http://localhost:11434/v1" />
        </label>
        <label v-if="analysisMode !== 'fast' && modelName === 'custom-local'" class="field">
          <span>Model Name</span>
          <input v-model="localConfig.model_name" placeholder="llama3" />
        </label>
        <label v-if="analysisMode !== 'fast' && modelName === 'custom-local'" class="field">
          <span>API Key</span>
          <input v-model="localConfig.api_key" type="password" placeholder="EMPTY" />
        </label>
      </div>

      <div class="dimension-block">
        <DimensionSelector v-model="selectedDimensions" />
      </div>

      <label class="instruction-field">
        <span>附加指令</span>
        <textarea v-model="generationInstruction" placeholder="可选：给所有样本追加统一上下文或检测要求。"></textarea>
      </label>
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
      <textarea v-model="jsonl" placeholder='{"id":"sample-1","language":"Python","prompt":"","code":"print(1)"}
{
  "id": "sample-2",
  "language": "Python",
  "code": "print(2)"
}'></textarea>
      <div class="hint-row">
        <span>{{ sampleCount }} 条样本</span>
        <span v-if="message" class="message">{{ message }}</span>
        <span v-if="error" class="error">{{ error }}</span>
      </div>
      <div v-if="submitting" class="waiting-box">
        <div class="progress-track"><span></span></div>
        <p>正在逐条检测，请耐心等待。样本较多或使用 AI 分析时可能需要更长时间。</p>
      </div>
    </section>

    <section class="workspace-grid">
      <aside class="history-panel">
        <div class="section-title">
          <strong>批量历史</strong>
          <button type="button" @click="load">刷新</button>
        </div>
        <button
          v-for="task in tasks"
          :key="task.id"
          type="button"
          :class="['task-row', { active: detail?.id === task.id }]"
          @click="openTask(task.id)"
        >
          <span>
            <strong>{{ task.name }}</strong>
            <small>{{ modeLabel(task.analysis_mode) }} · {{ statusText(task.status) }} · {{ task.progress }}%</small>
          </span>
          <b>{{ task.summary_payload?.average_score ?? '--' }}</b>
        </button>
        <p v-if="!tasks.length" class="empty">还没有批量检测任务。</p>
      </aside>

      <section class="detail-panel">
        <div v-if="!detail" class="empty detail-empty">选择一个批量历史查看报告。</div>
        <template v-else>
          <div class="detail-head">
            <div>
              <h3>{{ detail.name }}</h3>
              <p>{{ modeLabel(detail.analysis_mode) }} · {{ formatDate(detail.created_at) }}</p>
            </div>
            <div class="export-actions">
              <button type="button" @click="exportTask('json')">JSON</button>
              <button type="button" @click="exportTask('csv')">CSV</button>
            </div>
          </div>

          <div class="summary-strip">
            <span><b>{{ summaryDisplay.sampleCount }}</b><small>样本</small></span>
            <span><b>{{ summaryDisplay.completedCount }}</b><small>完成</small></span>
            <span><b>{{ summaryDisplay.failedCount }}</b><small>失败</small></span>
            <span><b>{{ summaryDisplay.averageScore }}</b><small>平均分</small></span>
            <span><b>{{ summaryDisplay.issueCount }}</b><small>问题</small></span>
          </div>

          <div class="sample-layout">
            <div class="sample-list">
              <button
                v-for="sample in detail.samples"
                :key="sample.id"
                type="button"
                :class="['sample-row', { active: selectedSampleId === sample.id, failed: sample.status === 'failed' }]"
                @click="selectSample(sample.id)"
              >
                <span>
                  <strong>{{ sample.sample_id }}</strong>
                  <small>{{ sample.language }} · {{ statusText(sample.status) }}</small>
                </span>
                <b>{{ sample.result?.score ?? '--' }}</b>
              </button>
            </div>

            <div class="sample-report">
              <div v-if="!selectedSample" class="empty">请选择样本。</div>
              <template v-else-if="selectedSample.status === 'failed'">
                <h4>{{ selectedSample.sample_id }}</h4>
                <p class="error">{{ selectedSample.error_summary || '样本检测失败' }}</p>
              </template>
              <template v-else>
                <div class="sample-head">
                  <div>
                    <h4>{{ selectedSample.sample_id }}</h4>
                    <p>{{ selectedSample.language }} · {{ selectedReport.provider || 'static' }}</p>
                  </div>
                  <strong>{{ selectedReport.score }}</strong>
                </div>

                <QualitySummary
                  :facts="selectedReport.facts"
                  :issues="selectedIssues"
                  :dimensions="detail.config_payload?.dimensions || selectedDimensions"
                />

                <section v-if="selectedReport.warnings?.length" class="warning-list">
                  <strong>分析提示</strong>
                  <p v-for="warning in selectedReport.warnings" :key="warning">{{ warning }}</p>
                </section>

                <IssueList
                  :issues="visibleIssues"
                  :all-issues="selectedIssues"
                  :filters="filters"
                  @update:filters="filters = $event"
                />
              </template>
            </div>
          </div>
        </template>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import DimensionSelector from '@/components/analysis/DimensionSelector.vue'
import IssueList from '@/components/issues/IssueList.vue'
import QualitySummary from '@/components/issues/QualitySummary.vue'
import { EVALUATION_MODES, defaultEvaluationSampleId, evaluationModeLabel, evaluationStatusText, evaluationSummary } from '@/services/evaluations'
import { filterIssues, sortIssues } from '@/services/issues'
import v2Api from '@/services/v2Api'
import { downloadFile } from '@/utils/export'

const DEFAULT_DIMENSIONS = ['correctness', 'security', 'maintainability', 'robustness']
const DEFAULT_LOCAL_CONFIG = () => ({
  base_url: 'http://localhost:11434/v1',
  api_key: 'EMPTY',
  model_name: 'llama3'
})

const modes = EVALUATION_MODES

const jsonl = ref('{"id":"sample-1","language":"Python","prompt":"","code":"def run(x):\\n    return eval(x)"}')
const tasks = ref([])
const detail = ref(null)
const selectedSampleId = ref(null)
const fileInput = ref(null)
const fileName = ref('')
const submitting = ref(false)
const error = ref('')
const message = ref('')
const analysisMode = ref('deep')
const selectedDimensions = ref([...DEFAULT_DIMENSIONS])
const generationInstruction = ref('')
const modelName = ref('deepseek-v3.1')
const localConfig = ref(DEFAULT_LOCAL_CONFIG())
const filters = ref({ severities: [], dimensions: [], sources: [] })

const sampleCount = computed(() => countJsonSamples(jsonl.value))
const summary = computed(() => detail.value?.summary_payload || {})
const summaryDisplay = computed(() => evaluationSummary(summary.value))
const selectedSample = computed(() => detail.value?.samples?.find(sample => sample.id === selectedSampleId.value) || null)
const selectedReport = computed(() => selectedSample.value?.result?.issue_summary || {})
const selectedIssues = computed(() => selectedReport.value?.issues || [])
const visibleIssues = computed(() => sortIssues(filterIssues(selectedIssues.value, filters.value)))

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
  if (!selectedDimensions.value.length) {
    error.value = '请至少选择一个检测维度'
    return
  }
  submitting.value = true
  error.value = ''
  message.value = '任务已提交，正在逐条检测...'
  try {
    const response = await v2Api.createEvaluation({
      name: `批量检测-${Date.now()}`,
      jsonl: jsonl.value,
      analysis_mode: analysisMode.value,
      dimensions: selectedDimensions.value,
      generation_instruction: generationInstruction.value?.trim() || undefined,
      model_name: analysisMode.value === 'fast' || modelName.value === 'custom-local' ? undefined : modelName.value,
      local_config: analysisMode.value !== 'fast' && modelName.value === 'custom-local' ? localConfig.value : undefined
    })
    message.value = `已完成 ${response.data.sample_count || sampleCount.value} 条样本`
    await load()
    await openTask(response.data.id)
  } catch (err) {
    error.value = err.response?.data?.detail?.message || err.message
  } finally {
    submitting.value = false
  }
}

async function openTask(id) {
  error.value = ''
  try {
    detail.value = (await v2Api.getEvaluation(id)).data
    selectedSampleId.value = defaultEvaluationSampleId(detail.value.samples)
    filters.value = { severities: [], dimensions: [], sources: [] }
  } catch (err) {
    error.value = err.response?.data?.detail?.message || err.message
  }
}

function selectSample(id) {
  selectedSampleId.value = id
  filters.value = { severities: [], dimensions: [], sources: [] }
}

async function exportTask(format) {
  if (!detail.value) return
  const response = await v2Api.exportEvaluation(detail.value.id, format)
  const timestamp = Date.now()
  if (format === 'csv') {
    downloadFile(response.data, `batch_report_${detail.value.id}_${timestamp}.csv`, 'text/csv')
    return
  }
  downloadFile(JSON.stringify(response.data, null, 2), `batch_report_${detail.value.id}_${timestamp}.json`, 'application/json')
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
    message.value = '文件已载入，可以运行检测'
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

function countJsonSamples(value) {
  const text = value.trim()
  if (!text) return 0
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed.length : 1
  } catch {
    return countTopLevelObjects(text)
  }
}

function countTopLevelObjects(text) {
  let count = 0
  let depth = 0
  let inString = false
  let escaped = false
  let objectStarted = false

  for (const char of text) {
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }
    if (char === '{') {
      if (depth === 0) objectStarted = true
      depth += 1
      continue
    }
    if (char === '}' && depth > 0) {
      depth -= 1
      if (depth === 0 && objectStarted) {
        count += 1
        objectStarted = false
      }
    }
  }

  return count
}

function statusText(status) {
  return evaluationStatusText(status)
}

function modeLabel(value) {
  return evaluationModeLabel(value)
}

function formatDate(value) {
  if (!value) return '未知时间'
  return new Date(value).toLocaleString()
}

onMounted(load)
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head, .upload-row, .hint-row, .section-title, .detail-head, .sample-head { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
.page-head h2, .detail-head h3, .sample-head h4 { margin: 0 0 6px; }
.page-head p, .detail-head p, .sample-head p { margin: 0; color: var(--text-secondary); font-size: .86rem; }
.config-panel, .jsonl-panel, .history-panel, .detail-panel { border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; background: rgba(255,255,255,.035); }
.mode-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.mode-option, .task-row, .sample-row { text-align: left; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(255,255,255,.04); color: var(--text-primary); }
.mode-option { display: grid; gap: 4px; min-height: 70px; padding: 10px; }
.mode-option span, .task-row small, .sample-row small, .empty { color: var(--text-secondary); font-size: .82rem; }
.mode-option.active, .task-row.active, .sample-row.active { border-color: rgba(59,130,246,.7); background: rgba(59,130,246,.12); }
.config-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.field, .instruction-field { display: grid; gap: 6px; color: var(--text-secondary); font-size: .82rem; }
.field select, .field input, .instruction-field textarea, .jsonl-panel > textarea { width: 100%; box-sizing: border-box; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 9px 10px; }
.dimension-block { margin-top: 12px; }
.instruction-field { margin-top: 12px; }
.instruction-field textarea { min-height: 76px; resize: vertical; }
.jsonl-panel > textarea { min-height: 180px; font-family: 'Fira Code', Consolas, monospace; line-height: 1.55; resize: vertical; }
button, .file-picker { min-height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 0 10px; }
button:disabled { cursor: wait; opacity: .65; }
.primary-action { background: rgba(59,130,246,.22); border-color: rgba(59,130,246,.55); font-weight: 700; }
.file-picker { display: inline-flex; align-items: center; cursor: pointer; }
.file-picker input { display: none; }
.message { color: var(--success-color); }
.error { color: #ff6b6b; }
.waiting-box { display: grid; gap: 8px; color: var(--text-secondary); font-size: .86rem; }
.waiting-box p { margin: 0; }
.progress-track { height: 6px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.08); }
.progress-track span { display: block; width: 38%; height: 100%; border-radius: inherit; background: #3b82f6; animation: progress-slide 1.2s infinite ease-in-out; }
.workspace-grid { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 14px; align-items: start; }
.history-panel, .detail-panel { display: grid; gap: 10px; }
.task-row, .sample-row { display: flex; justify-content: space-between; gap: 10px; padding: 10px; }
.task-row span, .sample-row span { display: grid; gap: 4px; min-width: 0; }
.task-row strong, .sample-row strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.summary-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.summary-strip span { display: grid; gap: 2px; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(255,255,255,.04); }
.summary-strip b { font-size: 1.2rem; }
.summary-strip small { color: var(--text-secondary); }
.sample-layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 12px; align-items: start; }
.sample-list { display: grid; gap: 8px; }
.sample-row.failed { border-color: rgba(255,107,107,.45); }
.sample-report { display: grid; gap: 12px; min-width: 0; }
.sample-head > strong { font-size: 2rem; }
.warning-list { display: grid; gap: 4px; padding: 10px; border: 1px solid rgba(234,179,8,.35); border-radius: 6px; background: rgba(234,179,8,.08); }
.warning-list p { margin: 0; color: var(--text-secondary); }
.detail-empty { min-height: 160px; display: grid; place-items: center; }
@keyframes progress-slide {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(85%); }
  100% { transform: translateX(280%); }
}
@media (max-width: 980px) {
  .mode-row, .config-grid, .workspace-grid, .sample-layout, .summary-strip { grid-template-columns: 1fr; }
  .page-head, .upload-row, .hint-row, .detail-head { align-items: stretch; flex-direction: column; }
}
</style>
