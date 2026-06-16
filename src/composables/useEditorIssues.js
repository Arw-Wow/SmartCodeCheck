import { computed, ref } from 'vue'
import { filterIssues, sortIssues } from '@/services/issues'

export function useEditorIssues(initialIssues = []) {
  const issues = ref(initialIssues)
  const filters = ref({ severities: [], dimensions: [], sources: [] })
  const selectedIssueId = ref(null)

  const visibleIssues = computed(() => sortIssues(filterIssues(issues.value, filters.value)))
  const enabledSeverities = computed(() => {
    if (!filters.value.severities?.length) return null
    return new Set(filters.value.severities)
  })

  const selectIssue = (issue) => {
    selectedIssueId.value = issue?.id || null
    return issue?.line_start || null
  }

  return {
    issues,
    filters,
    visibleIssues,
    enabledSeverities,
    selectedIssueId,
    selectIssue
  }
}
