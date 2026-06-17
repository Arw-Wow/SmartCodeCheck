<template>
  <div class="detection-view">
    <div class="ambient-bg">
      <div class="glow-spot spot-1"></div>
      <div class="glow-spot spot-2"></div>
    </div>

    <div class="workspace-container">
      
      <aside class="panel-left glass-panel">
        <div class="panel-header">
          <h3>🛠️ 检测配置</h3>
        </div>
        
        <div class="scroll-content">
          <div class="config-item">
            <label class="config-label">编程语言</label>
            <div class="custom-select-wrapper">
              <select v-model="store.detection.language">
                <option value="Auto">自动检测</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Go">Go</option>
              </select>
            </div>
          </div>

          <div class="config-item">
            <label class="config-label">模型选择</label>
            <div class="custom-select-wrapper">
              <select v-model="store.detection.modelName">
                <option value="deepseek-v3.1">DeepSeek V3.1</option>
                <option value="qwen3-coder-plus">Qwen3 Coder+</option>
                <option value="gpt-5-mini">GPT-5 Mini</option>
                <option value="gpt-5">GPT-5</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                <option value="my-finetuned-model">官方微调模型</option>
                <option value="custom-local">自定义本地模型 (Ollama/vLLM)</option>
              </select>
            </div>
          </div>
          
          <transition name="fade-fast">
            <div v-if="store.detection.modelName === 'custom-local'" class="local-config-box">
              <div class="sub-form-item">
                <label>API Base URL</label>
                <input 
                  v-model="store.detection.localConfig.base_url" 
                  placeholder="http://localhost:11434/v1"
                />
              </div>
              <div class="sub-form-item">
                <label>Model Name</label>
                <input 
                  v-model="store.detection.localConfig.model_name" 
                  placeholder="e.g. llama3, qwen2.5"
                />
              </div>
              <div class="sub-form-item">
                <label>API Key (Optional)</label>
                <input 
                  v-model="store.detection.localConfig.api_key" 
                  type="password"
                  placeholder="默认 EMPTY"
                />
              </div>
            </div>
          </transition>
          
          <div class="config-item">
            <label class="config-label">检测维度</label>
            <div class="dim-selector-wrapper">
              <DimensionSelector v-model="store.detection.selectedDimensions" />
            </div>
          </div>

          <details class="advanced-tools">
            <summary>进阶工具</summary>
            <div class="tool-links">
              <router-link to="/evaluations" class="tool-link">
                <span>批量评测</span>
                <small>上传或粘贴 JSONL，批量跑样本</small>
              </router-link>
              <router-link to="/rulesets" class="tool-link">
                <span>规范文档管理</span>
                <small>上传课程规范、团队约定和安全红线文档</small>
              </router-link>
            </div>
          </details>
        </div>

        <div class="panel-footer">
          <button 
            v-if="!isAnalyzing"
            @click="handleAnalyze" 
            class="btn-action primary"
          >
            <span class="icon">⚡</span>深度分析
          </button>
          <button 
            v-else
            @click="handleStop" 
            class="btn-action danger pulsate"
          >
            <span class="icon">🛑</span> 终止生成
          </button>
          <p v-if="errorMessage" class="error-tip">{{ errorMessage }}</p>
        </div>
      </aside>

      <main class="panel-center">
         <div class="instruction-wrapper">
          <details class="instruction-accordion">
            <summary>
              <span class="summary-icon">📝</span> 
              <span>附加生成指令 / Context</span>
              <span class="sub-text">(可选)</span>
            </summary>
            <div class="accordion-content">
              <textarea
                v-model="store.detection.generationInstruction"
                placeholder="在此输入额外的上下文信息或具体指令，例如：'请生成一段 Hello world 的 python 代码。'"
              ></textarea>
            </div>
          </details>
        </div>

        <div class="editor-frame">
          <CodeEditor 
            v-model="store.detection.code" 
            :language="store.detection.language" 
          />
        </div>
      </main>

      <aside class="panel-right glass-panel">
         <div class="tabs-nav">
          <button 
            :class="['tab-item', { active: activeTab === 'result' }]"
            @click="activeTab = 'result'"
          >
            📊 分析报告
          </button>
          <button 
            :class="['tab-item', { active: activeTab === 'history' }]"
            @click="loadHistory"
          >
            🕒 历史记录
          </button>
        </div>

        <div class="scroll-content result-content">
          <transition name="fade-fast" mode="out-in">
            <div v-if="activeTab === 'result'" key="result">
              
              <div v-if="store.detection.results" class="result-toolbar">
                <span class="toolbar-title">检测完成</span>
                <div class="btn-group">
                  <button @click="exportJSON" title="导出 JSON">JSON</button>
                  <button @click="exportMD" title="导出 Markdown">MD</button>
                </div>
              </div>

              <div v-if="!store.detection.results && !isAnalyzing" class="empty-placeholder">
                <div class="empty-icon">👋</div>
                <p>配置参数并点击左侧<br>“深度分析”按钮</p>
              </div>

              <div v-if="isAnalyzing" class="loading-placeholder">
                <div class="loader-ring"></div>
                <p>AI 正在逐行扫描代码...</p>
                <span class="loading-sub">各维度深度分析中...</span>
              </div>

              <div v-if="store.detection.results" class="report-body">
                <div class="score-card-modern" :class="getScoreColorClass(store.detection.results.score)">
                  <div class="score-ring">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                      <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path class="circle" :stroke-dasharray="store.detection.results.score + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="score-number">{{ store.detection.results.score }}</div>
                  </div>
                  <div class="score-label">综合评分</div>
                </div>
                
                <div class="issue-timeline">
                  <div 
                    v-for="(issue, index) in store.detection.results.issues" 
                    :key="index" 
                    class="issue-card"
                    :class="issue.type.toLowerCase()"
                  >
                    <div class="issue-top">
                      <span class="badge">{{ issue.type }}</span>
                      <span class="dim-name">{{ issue.dimension }}</span>
                      <span v-if="issue.line" class="line-num">Ln {{ issue.line }}</span>
                    </div>
                    <div class="issue-desc">{{ issue.description }}</div>
                    <div class="issue-suggest">
                      <span class="icon">💡</span> {{ issue.suggestion }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else key="history" class="history-wrapper">
              <HistoryList 
                :records="store.historyList" 
                :loading="historyLoading"
                @restore="handleRestore"
                @delete="handleDeleteHistory"
              />
            </div>
          </transition>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGlobalDataStore } from '@/stores/index'
import { useToastStore } from '@/stores/toast'
import api from '@/api'
import DimensionSelector from '@/components/analysis/DimensionSelector.vue'
import CodeEditor from '@/components/analysis/CodeEditor.vue'
import HistoryList from '@/components/common/HistoryList.vue'
import { downloadFile, generateDetectionMarkdown } from '@/utils/export'

const store = useGlobalDataStore()
const toast = useToastStore()

const isAnalyzing = ref(false)
const errorMessage = ref('')
const activeTab = ref('result')
const historyLoading = ref(false)
let abortController = null 

const handleAnalyze = async () => {
  if (!store.detection.code.trim()) return toast.warning('请输入需要检测的代码')
  if (store.detection.selectedDimensions.length === 0) return toast.warning('请至少选择一个检测维度')

  isAnalyzing.value = true
  store.detection.results = null
  errorMessage.value = ''
  activeTab.value = 'result'
  
  abortController = new AbortController()

  try {
    // 构造请求 Payload
    const payload = {
      code_content: store.detection.code,
      language: store.detection.language,
      dimensions: store.detection.selectedDimensions,
      custom_definitions: store.customDefinitions,
      generation_instruction: store.detection.generationInstruction?.trim() || undefined,
      // 动态判断是否使用本地配置
      model_name: store.detection.modelName === 'custom-local' ? undefined : store.detection.modelName,
      local_config: store.detection.modelName === 'custom-local' ? store.detection.localConfig : undefined
    }

    const response = await api.analyzeCode(payload, abortController.signal)
    store.detection.results = response.data

    store.saveToHistory('detection').then(() => {
      toast.success('分析完成，已自动保存')
    }).catch(err => console.error(err))
    
  } catch (error) {
    if (error.name === 'CanceledError' || error.message === 'canceled') {
      errorMessage.value = '已终止'
    } else {
      console.error(error)
      errorMessage.value = '分析失败: ' + (error.response?.data?.detail || error.message)
      toast.error('分析请求失败')
    }
  } finally {
    isAnalyzing.value = false
    abortController = null
  }
}

const handleStop = () => {
  if (abortController) abortController.abort()
}

const loadHistory = async () => {
  activeTab.value = 'history'
  historyLoading.value = true
  await store.fetchHistory('detection')
  historyLoading.value = false
}

const handleRestore = (record) => {
  if (confirm('恢复历史记录将覆盖当前编辑器内容，确定吗？')) {
    store.restoreHistory(record)
    activeTab.value = 'result'
    toast.success('历史记录已恢复')
  }
}

const handleDeleteHistory = async (id) => {
  await store.removeHistory(id, 'detection')
  toast.success('删除成功')
}

const exportJSON = () => {
  const data = JSON.stringify(store.detection.results, null, 2)
  downloadFile(data, `audit_report_${Date.now()}.json`, 'application/json')
}

const exportMD = () => {
  const md = generateDetectionMarkdown(store.detection.results, store.detection.language)
  downloadFile(md, `audit_report_${Date.now()}.md`, 'text/markdown')
}

const getScoreColorClass = (score) => {
  if (score >= 90) return 'score-high'
  if (score >= 70) return 'score-mid'
  return 'score-low'
}
</script>

<style scoped>
.detection-view {
  position: relative;
  height: calc(100vh - 64px); /* 减去 Header 高度 */
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
}

.workspace-container {
  display: grid;
  grid-template-columns: 280px 1fr 340px;
  gap: 16px;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

/* --- 背景光效 --- */
.ambient-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;
}
.glow-spot {
  position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15;
}
.spot-1 { top: -10%; left: -10%; width: 50vw; height: 50vw; background: var(--primary-color); }
.spot-2 { bottom: -10%; right: -10%; width: 40vw; height: 40vw; background: var(--accent-color); }

/* --- 通用面板样式 --- */
.glass-panel {
  background: rgba(22, 27, 34, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.panel-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px; }

.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.scroll-content::-webkit-scrollbar { width: 6px; }
.scroll-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.scroll-content::-webkit-scrollbar-track { background: transparent; }

/* --- 左侧面板：配置 --- */
.config-item { margin-bottom: 24px; }
.config-label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; font-weight: 500; }

.custom-select-wrapper {
  position: relative;
}
.custom-select-wrapper select {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-color);
  color: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  appearance: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.custom-select-wrapper select:focus {
  border-color: var(--primary-color);
  outline: none;
  background: rgba(0,0,0,0.5);
}
/* 自定义箭头 */
.custom-select-wrapper::after {
  content: "▼";
  font-size: 0.7rem;
  color: var(--text-secondary);
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.advanced-tools {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.18);
  padding: 10px 12px;
}

.advanced-tools summary {
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 600;
}

.tool-links {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.tool-link {
  display: grid;
  gap: 3px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.tool-link:hover {
  border-color: rgba(59, 130, 246, 0.55);
  background: rgba(59, 130, 246, 0.12);
}

.tool-link span {
  font-size: 0.86rem;
  font-weight: 700;
}

.tool-link small {
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1.45;
}

.panel-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0,0,0,0.2);
}

.btn-action {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 0.95rem;
}
.btn-action.primary { background: var(--primary-color); color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.btn-action.primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-action.danger { background: rgba(218, 54, 51, 0.15); color: #ff6b6b; border: 1px solid rgba(218, 54, 51, 0.3); }
.btn-action.danger:hover { background: rgba(218, 54, 51, 0.25); }

.pulsate { animation: pulse-red 2s infinite; }
@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); } }

.error-tip { color: #ff6b6b; font-size: 0.8rem; text-align: center; margin-top: 8px; }

/* --- 中间：编辑器 --- */
.panel-center {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0; /* 防止 Flex 子项溢出 */
}

.instruction-wrapper summary {
  list-style: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: rgba(22, 27, 34, 0.6);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}
.instruction-wrapper summary:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.2); }
.summary-icon { opacity: 0.7; }
.sub-text { font-size: 0.75rem; opacity: 0.5; margin-left: auto; }

.accordion-content { margin-top: 6px; }
.accordion-content textarea {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 10px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.9rem;
  box-sizing: border-box;
}
.accordion-content textarea:focus { border-color: var(--primary-color); outline: none; background: rgba(0,0,0,0.5); }

.editor-frame {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

/* --- 右侧：结果 --- */
.tabs-nav {
  display: flex;
  background: rgba(0,0,0,0.2);
  padding: 4px;
}
.tab-item {
  flex: 1;
  padding: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}
.tab-item:hover { color: var(--text-primary); }
.tab-item.active { color: var(--primary-color); border-bottom-color: var(--primary-color); background: rgba(255,255,255,0.02); }

.empty-placeholder, .loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: var(--text-secondary);
}
.empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
.loading-placeholder p { margin: 16px 0 4px; font-weight: 500; color: var(--text-primary); }
.loading-sub { font-size: 0.8rem; opacity: 0.6; }

.loader-ring {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 结果工具栏 */
.result-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border-color);
}
.toolbar-title { font-size: 0.85rem; font-weight: bold; color: var(--success); display: flex; align-items: center; gap: 4px; }
.toolbar-title::before { content: "●"; font-size: 0.6rem; }
.btn-group button {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 6px;
  transition: all 0.2s;
}
.btn-group button:hover { background: rgba(59, 130, 246, 0.1); color: var(--primary-color); border-color: var(--primary-color); }

/* 综合评分环形图 */
.score-card-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
}
.score-ring { position: relative; width: 100px; height: 100px; }
.circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 100%; }
.circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 2.5; }
.circle { fill: none; stroke-width: 2.5; stroke-linecap: round; animation: progress 1s ease-out forwards; }
.score-number {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 2rem; font-weight: 800; color: #fff;
}
.score-label { margin-top: 10px; font-size: 0.9rem; opacity: 0.7; }

/* 评分颜色 */
.score-high .circle { stroke: var(--success); } .score-high .score-number { color: var(--success); }
.score-mid .circle { stroke: #F59E0B; } .score-mid .score-number { color: #F59E0B; }
.score-low .circle { stroke: var(--danger); } .score-low .score-number { color: var(--danger); }

/* 问题列表卡片 */
.issue-timeline { display: flex; flex-direction: column; gap: 12px; }
.issue-card {
  background: rgba(0,0,0,0.2);
  border-left: 3px solid transparent;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
}
.issue-card.error { border-left-color: var(--danger); background: linear-gradient(90deg, rgba(218,54,51,0.05) 0%, transparent 100%); }
.issue-card.warning { border-left-color: #F59E0B; background: linear-gradient(90deg, rgba(245,158,11,0.05) 0%, transparent 100%); }
.issue-card.info { border-left-color: var(--primary-color); }

.issue-top { display: flex; align-items: center; margin-bottom: 6px; font-size: 0.8rem; }
.badge { padding: 1px 5px; border-radius: 3px; font-weight: bold; margin-right: 8px; text-transform: uppercase; font-size: 0.7rem; }
.error .badge { background: var(--danger); color: white; }
.warning .badge { background: #F59E0B; color: black; }
.info .badge { background: var(--primary-color); color: white; }

.dim-name { color: var(--text-secondary); margin-right: auto; }
.line-num { font-family: monospace; background: rgba(255,255,255,0.1); padding: 1px 4px; border-radius: 3px; }

.issue-desc { line-height: 1.5; margin-bottom: 8px; color: #eee; }
.issue-suggest { font-size: 0.85rem; color: #8B949E; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 4px; display: flex; gap: 6px; }

/* 动画 */
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes progress { 0% { stroke-dasharray: 0 100; } }
.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 0.2s; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }

/* 本地配置输入框样式 */
.local-config-box {
  background: rgba(0,0,0,0.2);
  border: 1px dashed var(--border-color);
  padding: 12px;
  border-radius: 8px;
  margin-top: -16px; /* 紧贴上一项 */
  margin-bottom: 24px;
}
.sub-form-item { margin-bottom: 10px; }
.sub-form-item label { display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px; }
.sub-form-item input {
  width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color);
  color: white; padding: 6px 8px; border-radius: 4px; font-size: 0.85rem;
  box-sizing: border-box;
}
.sub-form-item input:focus { border-color: var(--primary-color); outline: none; }
</style>
