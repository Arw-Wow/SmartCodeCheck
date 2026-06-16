<template>
  <div class="workspace-v2">
    <section class="toolbar">
      <select v-model="language">
        <option>Python</option>
        <option>JavaScript</option>
        <option>Java</option>
        <option>C++</option>
        <option>Go</option>
      </select>
      <button :disabled="isAnalyzing" @click="analyze">Analyze</button>
      <span v-if="result" class="score">Score {{ result.score }}</span>
      <span v-if="error" class="error">{{ error }}</span>
    </section>

    <section class="workspace-grid">
      <SmartCodeEditor
        ref="editor"
        v-model="code"
        :language="language"
        :issues="visibleIssues"
        :enabled-severities="enabledSeverities"
      />
      <aside>
        <IssueList
          :issues="visibleIssues"
          :filters="filters"
          @update:filters="filters = $event"
          @select="focusIssue"
        />
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import v2Api from '@/services/v2Api'
import SmartCodeEditor from '@/components/editor/SmartCodeEditor.vue'
import IssueList from '@/components/issues/IssueList.vue'
import { useEditorIssues } from '@/composables/useEditorIssues'

const code = ref('def run(user_input):\n    return eval(user_input)\n')
const language = ref('Python')
const result = ref(null)
const error = ref('')
const isAnalyzing = ref(false)
const editor = ref(null)
const { issues, filters, visibleIssues, enabledSeverities, selectIssue } = useEditorIssues([])

const dimensions = computed(() => ['correctness', 'security', 'maintainability', 'robustness'])

async function analyze() {
  error.value = ''
  isAnalyzing.value = true
  try {
    const response = await v2Api.analyze({
      code_content: code.value,
      language: language.value,
      dimensions: dimensions.value
    })
    result.value = response.data
    issues.value = response.data.issues || []
  } catch (err) {
    error.value = err.response?.data?.detail?.message || err.message
  } finally {
    isAnalyzing.value = false
  }
}

function focusIssue(issue) {
  const line = selectIssue(issue)
  if (line) editor.value?.focusLine(line)
}
</script>

<style scoped>
.workspace-v2 {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar select,
.toolbar button {
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  padding: 0 12px;
}

.workspace-grid {
  min-height: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 12px;
}

.workspace-grid aside {
  overflow: auto;
}

.score {
  color: var(--success-color);
}

.error {
  color: #ff6b6b;
}
</style>
