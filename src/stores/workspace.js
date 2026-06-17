import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import v2Api from '@/services/v2Api'
import { filterIssues, sortIssues } from '@/services/issues'

const DEFAULT_CODE = 'def run(user_input):\n    return eval(user_input)\n'
const DEFAULT_FILTERS = () => ({ severities: [], dimensions: [], sources: [] })
const DEFAULT_DIMENSIONS = ['correctness', 'security', 'maintainability', 'robustness']

export const useWorkspaceStore = defineStore('workspace-v2', () => {
  const code = ref(DEFAULT_CODE)
  const language = ref('Python')
  const result = ref(null)
  const issues = ref([])
  const filters = ref(DEFAULT_FILTERS())
  const status = ref('idle')
  const error = ref('')
  const notice = ref('')
  const selectedIssueId = ref(null)
  const lastRunId = ref(null)
  const ruleSets = ref([])
  const selectedRuleSetId = ref('')
  const ruleSetsError = ref('')

  const isAnalyzing = computed(() => status.value === 'analyzing')
  const visibleIssues = computed(() => sortIssues(filterIssues(issues.value, filters.value)))
  const enabledSeverities = computed(() => {
    if (!filters.value.severities?.length) return null
    return new Set(filters.value.severities)
  })

  async function analyze() {
    error.value = ''
    notice.value = ''
    status.value = 'analyzing'
    try {
      const response = await v2Api.analyze({
        code_content: code.value,
        language: language.value,
        dimensions: DEFAULT_DIMENSIONS,
        rule_set_id: selectedRuleSetId.value ? Number(selectedRuleSetId.value) : undefined
      })
      applyAnalysisResult(response.data)
      notice.value = `分析完成，综合评分 ${response.data.score}。`
      status.value = 'success'
      notifyStatsChanged()
    } catch (err) {
      error.value = err.response?.data?.detail?.message || err.message
      status.value = 'error'
    }
  }

  async function loadRuleSets() {
    ruleSetsError.value = ''
    try {
      const response = await v2Api.getRuleSets()
      ruleSets.value = response.data || []
    } catch (err) {
      ruleSetsError.value = err.response?.data?.detail?.message || err.message
    }
  }

  async function loadRun(runId) {
    error.value = ''
    notice.value = ''
    status.value = 'loading'
    try {
      const response = await v2Api.getRun(runId)
      restoreRunDetail(response.data)
      status.value = 'restored'
    } catch (err) {
      error.value = err.response?.data?.detail?.message || err.message
      status.value = 'error'
    }
  }

  function applyAnalysisResult(data) {
    result.value = data
    issues.value = data.issues || []
    lastRunId.value = data.run_id || null
  }

  function restoreRunDetail(detail) {
    const snapshot = detail.snapshot || {}
    const requestPayload = snapshot.request_payload || {}
    const resultPayload = snapshot.result_payload || {}
    const restoredIssues = detail.issues || resultPayload.issues || []

    if (snapshot.code_content !== null && snapshot.code_content !== undefined) {
      code.value = snapshot.code_content
      notice.value = `已恢复第 ${detail.run.id} 次分析。`
    } else {
      notice.value = `第 ${detail.run.id} 次分析为隐私模式，仅恢复结果，不覆盖当前代码。`
    }

    language.value = requestPayload.language || detail.run.language || language.value
    selectedRuleSetId.value = requestPayload.rule_set_id ? String(requestPayload.rule_set_id) : ''
    result.value = {
      run_id: detail.run.id,
      score: detail.run.score,
      issues: restoredIssues,
      facts: resultPayload.facts || null,
      warnings: detail.run.warnings || [],
      provider: resultPayload.provider || 'restored'
    }
    issues.value = restoredIssues
    filters.value = DEFAULT_FILTERS()
    lastRunId.value = detail.run.id
  }

  function setFilters(nextFilters) {
    filters.value = {
      severities: nextFilters?.severities || [],
      dimensions: nextFilters?.dimensions || [],
      sources: nextFilters?.sources || []
    }
  }

  function selectIssue(issue) {
    selectedIssueId.value = issue?.id || null
    return issue?.line_start || null
  }

  function reset() {
    code.value = DEFAULT_CODE
    language.value = 'Python'
    result.value = null
    issues.value = []
    filters.value = DEFAULT_FILTERS()
    status.value = 'idle'
    error.value = ''
    notice.value = ''
    selectedIssueId.value = null
    lastRunId.value = null
    selectedRuleSetId.value = ''
    ruleSetsError.value = ''
  }

  function notifyStatsChanged() {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('analysis-runs-updated', { detail: { runId: lastRunId.value } }))
  }

  return {
    code,
    language,
    result,
    issues,
    filters,
    status,
    error,
    notice,
    selectedIssueId,
    lastRunId,
    ruleSets,
    selectedRuleSetId,
    ruleSetsError,
    isAnalyzing,
    visibleIssues,
    enabledSeverities,
    analyze,
    loadRuleSets,
    loadRun,
    applyAnalysisResult,
    restoreRunDetail,
    setFilters,
    selectIssue,
    reset
  }
})
