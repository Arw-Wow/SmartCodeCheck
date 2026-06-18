import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import v2Api from '@/services/v2Api'
import { useWorkspaceStore } from '@/stores/workspace'

vi.mock('@/services/v2Api', () => ({
  default: {
    analyze: vi.fn(),
    getRuleSets: vi.fn(),
    getRun: vi.fn(),
    getRuns: vi.fn()
  }
}))

describe('workspace store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
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
    expect(store.privacyCodeProtected).toBe(false)
  })

  it('marks editor code as protected when restoring privacy-mode runs', () => {
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
    expect(store.privacyCodeProtected).toBe(true)

    store.restoreRunDetail({
      run: { id: 14, language: 'Python', score: 76, warnings: [], privacy_mode: false },
      issues: [],
      snapshot: {
        code_content: 'restored code',
        request_payload: { language: 'Python' },
        result_payload: {},
        privacy_mode: false
      }
    })

    expect(store.code).toBe('restored code')
    expect(store.privacyCodeProtected).toBe(false)
  })

  it('resets workspace state to defaults', () => {
    const store = useWorkspaceStore()
    store.code = 'changed'
    store.language = 'JavaScript'
    store.modelName = 'custom-local'
    store.selectedDimensions = ['security']
    store.generationInstruction = 'extra context'
    store.privacyMode = true
    store.result = { score: 88 }
    store.issues = [{ id: 'ISSUE-002' }]
    store.selectedRuleSetId = '9'
    store.privacyCodeProtected = true

    store.reset()

    expect(store.code).toBe('def run(user_input):\n    return eval(user_input)\n')
    expect(store.language).toBe('Python')
    expect(store.modelName).toBe('deepseek-v3.1')
    expect(store.selectedDimensions).toEqual(['correctness', 'security', 'maintainability', 'robustness'])
    expect(store.generationInstruction).toBe('')
    expect(store.privacyMode).toBe(false)
    expect(store.result).toBeNull()
    expect(store.issues).toEqual([])
    expect(store.selectedRuleSetId).toBe('')
    expect(store.privacyCodeProtected).toBe(false)
  })

  it('does not analyze protected privacy history code', async () => {
    const store = useWorkspaceStore()
    store.privacyCodeProtected = true
    store.code = 'current draft'

    await store.analyze()

    expect(v2Api.analyze).not.toHaveBeenCalled()
    expect(store.status).toBe('idle')
    expect(store.privacyCodeProtected).toBe(true)
    expect(store.notice).toContain('隐私代码已被保护')
  })
})
