import { describe, expect, it } from 'vitest'
import { defaultEvaluationSampleId, evaluationModeLabel, evaluationStatusText, evaluationSummary } from '@/services/evaluations'

describe('evaluation helpers', () => {
  it('labels modes and statuses', () => {
    expect(evaluationModeLabel('fast')).toBe('快速分析')
    expect(evaluationModeLabel('smart')).toBe('智能分析')
    expect(evaluationModeLabel('deep')).toBe('深度分析')
    expect(evaluationModeLabel('custom')).toBe('custom')
    expect(evaluationStatusText('completed')).toBe('已完成')
    expect(evaluationStatusText('unknown')).toBe('unknown')
  })

  it('selects completed samples first', () => {
    expect(defaultEvaluationSampleId([{ id: 1, status: 'failed' }, { id: 2, status: 'completed' }])).toBe(2)
    expect(defaultEvaluationSampleId([{ id: 3, status: 'failed' }])).toBe(3)
    expect(defaultEvaluationSampleId([])).toBeNull()
  })

  it('normalizes summary numbers', () => {
    expect(evaluationSummary({ sample_count: 2, completed_count: 1, failed_count: 1, average_score: 88.5, issue_count: 3 })).toEqual({
      sampleCount: 2,
      completedCount: 1,
      failedCount: 1,
      averageScore: 88.5,
      issueCount: 3
    })
    expect(evaluationSummary()).toEqual({ sampleCount: 0, completedCount: 0, failedCount: 0, averageScore: 0, issueCount: 0 })
  })
})
