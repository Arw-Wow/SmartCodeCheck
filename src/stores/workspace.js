import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import v2Api from '@/services/v2Api'
import { filterIssues, sortIssues } from '@/services/issues'
import { runRows } from '@/services/dashboard'
import { useGlobalDataStore } from '@/stores/index'

const DEFAULT_CODE = 'def run(user_input):\n    return eval(user_input)\n'
const DEFAULT_FILTERS = () => ({ severities: [], dimensions: [], sources: [] })
const DEFAULT_DIMENSIONS = ['correctness', 'security', 'maintainability', 'robustness']
const DEFAULT_LOCAL_CONFIG = () => ({
  base_url: 'http://localhost:11434/v1',
  api_key: 'EMPTY',
  model_name: 'llama3'
})

export const useWorkspaceStore = defineStore('workspace-v2', () => {
  const globalStore = useGlobalDataStore()
  const code = ref(DEFAULT_CODE)
  const language = ref('Python')
  const modelName = ref('deepseek-v3.1')
  const selectedDimensions = ref([...DEFAULT_DIMENSIONS])
  const generationInstruction = ref('')
  const localConfig = ref(DEFAULT_LOCAL_CONFIG())
  const privacyMode = ref(false)
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
  const runs = ref([])
  const historyLoading = ref(false)
  const privacyCodeProtected = ref(false)

  const isAnalyzing = computed(() => status.value === 'analyzing')
  const isLoading = computed(() => status.value === 'loading')
  const visibleIssues = computed(() => sortIssues(filterIssues(issues.value, filters.value)))
  const enabledSeverities = computed(() => {
    if (!filters.value.severities?.length) return null
    return new Set(filters.value.severities)
  })

  async function analyze(signal) {
    error.value = ''
    notice.value = ''
    privacyCodeProtected.value = false
    status.value = 'analyzing'
    try {
      const response = await v2Api.analyze({
        code_content: code.value,
        language: language.value,
        dimensions: selectedDimensions.value,
        custom_definitions: globalStore.customDefinitions,
        generation_instruction: generationInstruction.value?.trim() || undefined,
        model_name: modelName.value === 'custom-local' ? undefined : modelName.value,
        local_config: modelName.value === 'custom-local' ? localConfig.value : undefined,
        rule_set_id: selectedRuleSetId.value ? Number(selectedRuleSetId.value) : undefined,
        privacy_mode: privacyMode.value
      }, signal)
      applyAnalysisResult(response.data)
      notice.value = `分析完成，综合评分 ${response.data.score}。`
      status.value = 'success'
      notifyStatsChanged()
      loadRuns().catch(() => {})
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        notice.value = '已终止本次分析。'
        status.value = 'idle'
        return
      }
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

  async function loadRuns() {
    historyLoading.value = true
    try {
      const response = await v2Api.getRuns()
      runs.value = runRows(response.data)
    } finally {
      historyLoading.value = false
    }
  }

  function applyAnalysisResult(data) {
    privacyCodeProtected.value = false
    result.value = { ...data, warnings: visibleWarnings(data.warnings) }
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
      privacyCodeProtected.value = false
      notice.value = `已恢复第 ${detail.run.id} 次分析。`
    } else {
      privacyCodeProtected.value = true
      notice.value = `第 ${detail.run.id} 次分析为隐私模式，仅恢复结果，不覆盖当前代码。`
    }

    language.value = requestPayload.language || detail.run.language || language.value
    selectedDimensions.value = requestPayload.dimensions?.length ? requestPayload.dimensions : [...DEFAULT_DIMENSIONS]
    generationInstruction.value = requestPayload.generation_instruction || ''
    modelName.value = requestPayload.local_config ? 'custom-local' : (requestPayload.model_name || detail.run.model_name || modelName.value)
    if (requestPayload.local_config) {
      localConfig.value = { ...DEFAULT_LOCAL_CONFIG(), ...requestPayload.local_config }
      if (localConfig.value.api_key === '<redacted>') localConfig.value.api_key = 'EMPTY'
    }
    privacyMode.value = Boolean(requestPayload.privacy_mode || detail.run.privacy_mode)
    selectedRuleSetId.value = requestPayload.rule_set_id ? String(requestPayload.rule_set_id) : ''
    result.value = {
      run_id: detail.run.id,
      score: detail.run.score,
      issues: restoredIssues,
      facts: resultPayload.facts || null,
      warnings: visibleWarnings(detail.run.warnings || resultPayload.warnings),
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
    modelName.value = 'deepseek-v3.1'
    selectedDimensions.value = [...DEFAULT_DIMENSIONS]
    generationInstruction.value = ''
    localConfig.value = DEFAULT_LOCAL_CONFIG()
    privacyMode.value = false
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
    runs.value = []
    historyLoading.value = false
    privacyCodeProtected.value = false
  }

  function notifyStatsChanged() {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('analysis-runs-updated', { detail: { runId: lastRunId.value } }))
  }

  function visibleWarnings(warnings = []) {
    return (warnings || []).filter(warning => !/^SonarScanner completed for project `.+`\.$/.test(String(warning)))
  }

  return {
    code,
    language,
    modelName,
    selectedDimensions,
    generationInstruction,
    localConfig,
    privacyMode,
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
    runs,
    historyLoading,
    privacyCodeProtected,
    isAnalyzing,
    isLoading,
    visibleIssues,
    enabledSeverities,
    analyze,
    loadRuleSets,
    loadRun,
    loadRuns,
    applyAnalysisResult,
    restoreRunDetail,
    setFilters,
    selectIssue,
    reset
  }
})
