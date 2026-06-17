export const EVALUATION_MODES = [
  { id: 'fast', label: '快速分析', description: '只使用 SonarQube/静态分析' },
  { id: 'smart', label: '智能分析', description: '只使用 AI 直接分析源码' },
  { id: 'deep', label: '深度分析', description: '静态结果作为补充交给 AI' }
]

export function evaluationModeLabel(value) {
  return EVALUATION_MODES.find(mode => mode.id === value)?.label || value
}

export function evaluationStatusText(status) {
  return {
    queued: '排队中',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    canceled: '已取消'
  }[status] || status
}

export function defaultEvaluationSampleId(samples = []) {
  return samples.find(sample => sample.status === 'completed')?.id || samples[0]?.id || null
}

export function evaluationSummary(summary = {}) {
  return {
    sampleCount: Number(summary.sample_count || 0),
    completedCount: Number(summary.completed_count || 0),
    failedCount: Number(summary.failed_count || 0),
    averageScore: Number(summary.average_score || 0),
    issueCount: Number(summary.issue_count || 0)
  }
}
