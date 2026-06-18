<template>
  <div class="workspace-view">
    <div class="workspace-container">
      <aside class="panel-left glass-panel" data-tour-id="workspace-config">
        <div class="panel-header">
          <h3>检测配置</h3>
        </div>

        <div class="scroll-content">
          <div class="config-item">
            <label class="config-label">编程语言</label>
            <div class="custom-select-wrapper">
              <select v-model="workspace.language">
                <option value="Auto">自动检测</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Go">Go</option>
              </select>
            </div>
          </div>

          <div class="config-item">
            <label class="config-label">模型选择</label>
            <div class="custom-select-wrapper">
              <select v-model="workspace.modelName">
                <option value="deepseek-v3.1">DeepSeek V3.1</option>
                <option value="qwen3-coder-plus">Qwen3 Coder+</option>
                <option value="gpt-5-mini">GPT-5 Mini</option>
                <option value="gpt-5">GPT-5</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                <option value="my-finetuned-model">官方微调模型</option>
                <option value="custom-local">自定义本地模型</option>
              </select>
            </div>
          </div>

          <div v-if="workspace.modelName === 'custom-local'" class="local-config-box">
            <label>
              <span>API Base URL</span>
              <input v-model="workspace.localConfig.base_url" placeholder="http://localhost:11434/v1" />
            </label>
            <label>
              <span>Model Name</span>
              <input v-model="workspace.localConfig.model_name" placeholder="llama3, qwen2.5" />
            </label>
            <label>
              <span>API Key</span>
              <input v-model="workspace.localConfig.api_key" type="password" placeholder="EMPTY" />
            </label>
          </div>

          <div class="config-item">
            <label class="config-label">检测维度</label>
            <DimensionSelector v-model="workspace.selectedDimensions" />
          </div>

          <div class="config-item">
            <label class="config-label">规范文档规则集</label>
            <div class="custom-select-wrapper">
              <select v-model="workspace.selectedRuleSetId">
                <option value="">不使用规范文档</option>
                <option v-for="item in workspace.ruleSets" :key="item.id" :value="String(item.id)">
                  {{ item.name }}
                </option>
              </select>
            </div>
            <router-link to="/rulesets" class="inline-link">管理规范文档</router-link>
            <p v-if="workspace.ruleSetsError" class="error-tip">{{ workspace.ruleSetsError }}</p>
          </div>

          <label class="privacy-toggle">
            <input v-model="workspace.privacyMode" type="checkbox" />
            <span>隐私模式：历史记录不保存源码</span>
          </label>

          <details class="advanced-tools">
            <summary>进阶工具</summary>
            <div class="tool-links">
              <router-link to="/evaluations" class="tool-link">
                <span>批量评测</span>
                <small>上传或粘贴 JSONL，批量跑样本</small>
              </router-link>
              <router-link to="/settings/models" class="tool-link">
                <span>模型配置</span>
                <small>维护可复用的本地或云端模型</small>
              </router-link>
            </div>
          </details>
        </div>

        <div class="panel-footer">
          <div class="action-row">
            <button
              v-if="!workspace.isAnalyzing"
              class="btn-action primary"
              data-tour-id="workspace-analyze"
              :disabled="workspace.privacyCodeProtected"
              :title="workspace.privacyCodeProtected ? '隐私代码已被保护，不能运行深度分析' : ''"
              @click="handleAnalyze"
            >
              深度分析
            </button>
            <button v-else class="btn-action danger pulsate" @click="handleStop">
              终止分析
            </button>
            <button class="btn-action secondary" @click="handleReset">
              重置
            </button>
          </div>
          <p v-if="workspace.error" class="error-tip">{{ workspace.error }}</p>
          <p v-if="workspace.notice" class="notice-tip">{{ workspace.notice }}</p>
        </div>
      </aside>

      <main class="panel-center">
        <details class="instruction-accordion">
          <summary>
            <span>附加生成指令 / Context</span>
            <span class="sub-text">可选</span>
          </summary>
          <textarea
            v-model="workspace.generationInstruction"
            placeholder="输入额外上下文或生成要求，例如：这段代码来自用户输入处理函数。"
          ></textarea>
        </details>

        <CodeEditor
          ref="editor"
          v-model="workspace.code"
          class="workspace-code-editor"
          data-tour-id="workspace-editor"
          :language="workspace.language"
          :issues="workspace.visibleIssues"
          :enabled-severities="workspace.enabledSeverities"
          :privacy-protected="workspace.privacyCodeProtected"
        />
      </main>

      <aside class="panel-right glass-panel" data-tour-id="workspace-results">
        <div class="tabs-nav">
          <button :class="['tab-item', { active: activeTab === 'result' }]" @click="activeTab = 'result'">
            分析结果
          </button>
          <button :class="['tab-item', { active: activeTab === 'history' }]" @click="openHistory">
            历史记录
          </button>
        </div>

        <div class="scroll-content result-content">
          <section v-if="activeTab === 'result'" class="result-panel">
            <div v-if="workspace.result" class="result-toolbar">
              <span>检测完成</span>
              <div class="btn-group">
                <button @click="exportJSON">JSON</button>
                <button @click="exportMD">MD</button>
              </div>
            </div>

            <div v-if="!workspace.result && !workspace.isAnalyzing && !workspace.isLoading" class="empty-placeholder">
              <p>配置参数并点击“深度分析”</p>
            </div>

            <div v-if="workspace.isAnalyzing || workspace.isLoading" class="loading-placeholder">
              <div class="loader-ring"></div>
              <p>{{ workspace.isLoading ? '正在恢复历史记录...' : '静态分析与 AI 检测中...' }}</p>
            </div>

            <template v-if="workspace.result">
              <div class="score-card-modern" :class="getScoreColorClass(workspace.result.score)">
                <div class="score-number">{{ workspace.result.score }}</div>
                <div class="score-label">综合评分</div>
              </div>

              <QualitySummary
                :facts="workspace.result.facts"
                :issues="workspace.issues"
                :dimensions="workspace.selectedDimensions"
              />

              <section v-if="workspace.result.warnings?.length" class="warning-list">
                <strong>分析提示</strong>
                <p v-for="warning in workspace.result.warnings" :key="warning">{{ warning }}</p>
              </section>

              <IssueList
                :issues="workspace.visibleIssues"
                :all-issues="workspace.issues"
                :filters="workspace.filters"
                @update:filters="workspace.setFilters"
                @select="focusIssue"
              />
            </template>
          </section>

          <section v-else class="history-panel">
            <div v-if="workspace.historyLoading" class="empty-placeholder">
              <p>正在加载历史记录...</p>
            </div>
            <div v-else-if="!workspace.runs.length" class="empty-placeholder">
              <p>暂无历史分析</p>
            </div>
            <template v-else>
              <button
                v-for="run in workspace.runs"
                :key="run.id"
                class="run-row"
                @click="restoreRun(run.id)"
              >
                <span>
                  <strong>#{{ run.id }} · {{ run.language }}</strong>
                  <small>{{ formatDate(run.createdAt) }} · {{ run.modelName }}</small>
                </span>
                <b>{{ run.score }}</b>
                <em>{{ run.privacyMode ? '恢复结果' : '恢复现场' }}</em>
              </button>
            </template>
          </section>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DimensionSelector from '@/components/analysis/DimensionSelector.vue'
import CodeEditor from '@/components/analysis/CodeEditor.vue'
import IssueList from '@/components/issues/IssueList.vue'
import QualitySummary from '@/components/issues/QualitySummary.vue'
import { useToastStore } from '@/stores/toast'
import { useWorkspaceStore } from '@/stores/workspace'
import { downloadFile, generateWorkspaceMarkdown } from '@/utils/export'

const editor = ref(null)
const route = useRoute()
const toast = useToastStore()
const workspace = useWorkspaceStore()
const activeTab = ref('result')
let abortController = null

onMounted(() => {
  workspace.loadRuleSets()
  workspace.loadRuns()
  restoreFromRoute(route.query.runId)
})

watch(
  () => route.query.runId,
  (runId) => restoreFromRoute(runId)
)

async function handleAnalyze() {
  if (workspace.privacyCodeProtected) return toast.warning('隐私代码已被保护，请先重置或恢复包含源码的历史记录后再分析')
  if (!workspace.code.trim()) return toast.warning('请输入需要检测的代码')
  if (!workspace.selectedDimensions.length) return toast.warning('请至少选择一个检测维度')
  activeTab.value = 'result'
  abortController = new AbortController()
  await workspace.analyze(abortController.signal)
  abortController = null
  if (workspace.status === 'success') toast.success('分析完成')
}

function handleStop() {
  abortController?.abort()
}

function handleReset() {
  abortController?.abort()
  abortController = null
  activeTab.value = 'result'
  workspace.reset()
  workspace.loadRuleSets()
  toast.success('工作台已重置')
}

async function openHistory() {
  activeTab.value = 'history'
  await workspace.loadRuns()
}

async function restoreRun(runId) {
  activeTab.value = 'result'
  await workspace.loadRun(runId)
  if (!workspace.error) toast.success('历史记录已恢复')
}

function focusIssue(issue) {
  if (workspace.privacyCodeProtected) return
  const line = workspace.selectIssue(issue)
  if (line) editor.value?.focusLine(line)
}

function restoreFromRoute(runId) {
  if (!runId) return
  const normalized = Number(runId)
  if (!Number.isFinite(normalized) || normalized === workspace.lastRunId) return
  workspace.loadRun(normalized)
}

function exportJSON() {
  downloadFile(JSON.stringify(workspace.result, null, 2), `workspace_report_${Date.now()}.json`, 'application/json')
}

function exportMD() {
  downloadFile(generateWorkspaceMarkdown(workspace.result, workspace.language), `workspace_report_${Date.now()}.md`, 'text/markdown')
}

function formatDate(value) {
  if (!value) return '未知时间'
  return new Date(value).toLocaleString()
}

function getScoreColorClass(score) {
  if (score >= 90) return 'score-high'
  if (score >= 70) return 'score-mid'
  return 'score-low'
}
</script>

<style scoped>
.workspace-view {
  height: calc(100vh - 64px);
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}

.workspace-container {
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr) 380px;
  gap: 16px;
  height: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.glass-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(22, 27, 34, 0.78);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
}

.panel-header,
.panel-footer {
  padding: 16px;
  border-color: rgba(255, 255, 255, 0.06);
}

.panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.18);
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
}

.scroll-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.config-item {
  margin-bottom: 22px;
}

.config-label,
.local-config-box span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 600;
}

.custom-select-wrapper select,
.local-config-box input,
.instruction-accordion textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.28);
  color: var(--text-primary);
}

.custom-select-wrapper select,
.local-config-box input {
  height: 38px;
  padding: 0 10px;
}

.custom-select-wrapper select {
  color-scheme: dark;
}

.custom-select-wrapper select:focus {
  border-color: rgba(59, 130, 246, 0.72);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.14);
  outline: none;
}

.custom-select-wrapper select option {
  background: #111827;
  color: #e6edf3;
  font-size: 0.9rem;
}

.custom-select-wrapper select option:checked {
  background: #1f6feb;
  color: #ffffff;
}

.local-config-box,
.advanced-tools,
.warning-list {
  display: grid;
  gap: 10px;
  margin-bottom: 22px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.18);
}

.privacy-toggle {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 22px;
  color: var(--text-secondary);
  font-size: 0.84rem;
  line-height: 1.45;
}

.inline-link {
  display: inline-flex;
  margin-top: 8px;
  color: var(--primary-color);
  font-size: 0.84rem;
}

.advanced-tools summary {
  cursor: pointer;
  font-weight: 700;
}

.tool-links {
  display: grid;
  gap: 8px;
}

.tool-link {
  display: grid;
  gap: 3px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.tool-link small,
.notice-tip,
.warning-list p,
.run-row small,
.run-row em {
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.action-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 82px;
  gap: 8px;
}

.btn-action {
  width: 100%;
  min-height: 42px;
  border-radius: 6px;
  font-weight: 700;
}

.btn-action.primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-action.danger {
  border: 1px solid rgba(218, 54, 51, 0.35);
  background: rgba(218, 54, 51, 0.18);
  color: #ff7b72;
}

.btn-action.secondary {
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(148, 163, 184, 0.12);
  color: var(--text-primary);
}

.btn-action:disabled {
  cursor: not-allowed;
  filter: grayscale(0.35);
  opacity: 0.5;
}

.error-tip {
  margin: 8px 0 0;
  color: #ff7b72;
  font-size: 0.8rem;
}

.notice-tip {
  margin: 8px 0 0;
}

.panel-center {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
}

.instruction-accordion summary {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  list-style: none;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: rgba(22, 27, 34, 0.75);
  color: var(--text-secondary);
  font-size: 0.86rem;
}

.sub-text {
  margin-left: auto;
  font-size: 0.76rem;
}

.instruction-accordion textarea {
  min-height: 92px;
  margin-top: 8px;
  padding: 10px;
  resize: vertical;
}

.workspace-code-editor {
  min-height: 0;
  flex: 1;
}

.tabs-nav {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 8px;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-item {
  min-height: 34px;
  border-radius: 6px;
  color: var(--text-secondary);
  background: transparent;
}

.tab-item.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.18);
}

.result-panel,
.history-panel {
  display: grid;
  gap: 12px;
}

.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-group {
  display: flex;
  gap: 6px;
}

.btn-group button {
  min-height: 30px;
  border-radius: 6px;
  padding: 0 9px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.empty-placeholder,
.loading-placeholder {
  display: grid;
  place-items: center;
  min-height: 180px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  text-align: center;
}

.loader-ring {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.score-card-modern {
  display: grid;
  place-items: center;
  gap: 4px;
  padding: 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.score-number {
  font-size: 2.6rem;
  font-weight: 800;
}

.score-high .score-number { color: #7ee787; }
.score-mid .score-number { color: #fbbf24; }
.score-low .score-number { color: #ff7b72; }

.score-label {
  color: var(--text-secondary);
  font-size: 0.84rem;
}

.warning-list strong {
  font-size: 0.86rem;
}

.warning-list p {
  margin: 0;
  line-height: 1.45;
}

.run-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px 76px;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.035));
  color: var(--text-primary);
  text-align: left;
}

.run-row:hover {
  border-color: var(--primary-color);
  background: rgba(47, 129, 247, 0.09);
}

.run-row span {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.run-row strong,
.run-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.run-row b {
  color: #7ee787;
  text-align: right;
}

.run-row em {
  font-style: normal;
  text-align: right;
}

@media (max-width: 1180px) {
  .workspace-view {
    height: auto;
    overflow: visible;
    padding: 12px;
  }

  .workspace-container {
    grid-template-columns: 1fr;
  }

  .glass-panel {
    overflow: visible;
  }

  .scroll-content {
    overflow: visible;
  }

  .workspace-code-editor {
    min-height: 560px;
  }
}

@media (max-width: 760px) {
  .workspace-view {
    padding: 10px;
  }

  .workspace-container {
    gap: 12px;
  }

  .panel-header,
  .panel-footer,
  .scroll-content {
    padding: 12px;
  }

  .workspace-code-editor {
    min-height: 430px;
  }

  .tabs-nav {
    padding: 6px;
  }

  .result-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .score-card-modern {
    padding: 14px;
  }

  .score-number {
    font-size: 2.25rem;
  }

  .run-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .run-row em {
    grid-column: 1 / -1;
    text-align: left;
  }
}
</style>
