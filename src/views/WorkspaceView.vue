<template>
  <div class="workspace-v2">
    <section class="toolbar">
      <div class="toolbar-group">
        <label>
          <span>语言</span>
          <select v-model="workspace.language">
            <option>Python</option>
            <option>JavaScript</option>
            <option>Java</option>
            <option>C++</option>
            <option>Go</option>
          </select>
        </label>
        <label>
          <span>规则集</span>
          <select v-model="workspace.selectedRuleSetId">
            <option value="">不使用规则集</option>
            <option v-for="item in workspace.ruleSets" :key="item.id" :value="String(item.id)">
              {{ item.name }}
            </option>
          </select>
        </label>
        <router-link to="/rulesets" class="manage-link">管理规则集</router-link>
      </div>
      <button class="analyze-btn" :disabled="workspace.isAnalyzing" @click="workspace.analyze">
        {{ workspace.isAnalyzing ? '分析中...' : '开始分析' }}
      </button>
      <span v-if="workspace.result" class="score">评分 {{ workspace.result.score }}</span>
      <span v-if="workspace.notice" class="notice">{{ workspace.notice }}</span>
      <span v-if="workspace.ruleSetsError" class="error">{{ workspace.ruleSetsError }}</span>
      <span v-if="workspace.error" class="error">{{ workspace.error }}</span>
    </section>

    <section class="workspace-grid">
      <div class="editor-shell">
        <div class="editor-header">
          <div class="window-controls">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="editor-title">代码工作台</div>
          <div class="lang-indicator">{{ workspace.language }}</div>
        </div>
        <SmartCodeEditor
          ref="editor"
          v-model="workspace.code"
          :language="workspace.language"
          :issues="workspace.visibleIssues"
          :enabled-severities="workspace.enabledSeverities"
        />
      </div>
      <aside>
        <IssueList
          :issues="workspace.visibleIssues"
          :all-issues="workspace.issues"
          :filters="workspace.filters"
          @update:filters="workspace.setFilters"
          @select="focusIssue"
        />
      </aside>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SmartCodeEditor from '@/components/editor/SmartCodeEditor.vue'
import IssueList from '@/components/issues/IssueList.vue'
import { useWorkspaceStore } from '@/stores/workspace'

const editor = ref(null)
const route = useRoute()
const workspace = useWorkspaceStore()

onMounted(() => {
  workspace.loadRuleSets()
  restoreFromRoute(route.query.runId)
})

watch(
  () => route.query.runId,
  (runId) => restoreFromRoute(runId)
)

function focusIssue(issue) {
  const line = workspace.selectIssue(issue)
  if (line) editor.value?.focusLine(line)
}

function restoreFromRoute(runId) {
  if (!runId) return
  const normalized = Number(runId)
  if (!Number.isFinite(normalized) || normalized === workspace.lastRunId) return
  workspace.loadRun(normalized)
}
</script>

<style scoped>
.workspace-v2 {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(22, 27, 34, 0.75);
  overflow-x: auto;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.toolbar select,
.toolbar button,
.manage-link {
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0 12px;
}

.toolbar select {
  min-width: 132px;
}

.manage-link {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: 0.86rem;
}

.manage-link:hover {
  border-color: var(--primary-color);
}

.analyze-btn {
  margin-left: auto;
  min-width: 104px;
  background: var(--primary-color) !important;
  color: #fff !important;
  font-weight: 700;
}

.analyze-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.workspace-grid {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 12px;
}

.editor-shell {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0d0d0d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.editor-header {
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 10px;
  background: #1e1e1e;
  border-bottom: 1px solid #2b2b2b;
}

.window-controls {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.red { background: #ff5f56; }
.yellow { background: #ffbd2e; }
.green { background: #27c93f; }

.editor-title {
  color: var(--text-primary);
  font-size: 0.86rem;
  font-weight: 700;
}

.lang-indicator {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-family: monospace;
  font-size: 0.72rem;
}

.workspace-grid aside {
  overflow: auto;
}

.score {
  color: var(--success-color);
}

.notice {
  color: var(--text-secondary);
}

.error {
  color: #ff6b6b;
}

@media (max-width: 980px) {
  .workspace-v2 {
    height: auto;
    min-height: calc(100vh - 64px);
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .editor-shell {
    min-height: 520px;
  }

  .analyze-btn {
    margin-left: 0;
  }
}
</style>
