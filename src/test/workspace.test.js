import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkspaceStore } from '@/stores/workspace'

describe('workspace store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('restores run detail with code and issues', () => {
    const store = useWorkspaceStore()
    store.restoreRunDetail({
      run: { id: 12, language: 'Python', score: 83, warnings: ['SonarScanner completed for project `smartcodecheck-workbench`.', 'LLM analysis failed: timeout'], privacy_mode: false },
      issues: [{ id: 'ISSUE-001', severity: 'high', dimension: 'security', source: 'static' }],
      snapshot: {
        code_content: 'print(1)\n',
        request_payload: { language: 'Python', rule_set_id: 7 },
        result_payload: { facts: { language: 'Python' } },
        privacy_mode: false
      }
    })

    expect(store.code).toBe('print(1)\n')
    expect(store.lastRunId).toBe(12)
    expect(store.selectedRuleSetId).toBe('7')
    expect(store.visibleIssues).toHaveLength(1)
    expect(store.result.warnings).toEqual(['LLM analysis failed: timeout'])
    expect(store.notice).toBe('已恢复第 12 次分析。')
  })

  it('does not clear current code when restoring privacy-mode runs', () => {
    const store = useWorkspaceStore()
    store.code = 'current draft'
    store.restoreRunDetail({
      run: { id: 13, language: 'Python', score: 90, warnings: [], privacy_mode: true },
      issues: [],
      snapshot: {
        code_content: null,
        request_payload: { language: 'Python' },
        result_payload: {},
        privacy_mode: true
      }
    })

    expect(store.code).toBe('current draft')
    expect(store.notice).toContain('隐私模式')
  })
})
