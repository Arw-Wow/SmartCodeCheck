export function normalizeOverview(data = {}) {
  return {
    totalRuns: data.total_runs || 0,
    averageScore: Number(data.average_score || 0),
    bestScore: Number(data.best_score || 0),
    latestScore: Number(data.latest_score || 0),
    totalIssues: Number(data.total_issues || 0),
    completedRuns: Number(data.completed_runs || 0),
    completionRate: Number(data.completion_rate || 0),
    averageDurationMs: Number(data.average_duration_ms || 0),
    lastRunAt: data.last_run_at || ''
  }
}

const SEVERITY_ORDER = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1
}

export function severityChartRows(data = {}) {
  const counts = data.severity_counts || {}
  return Object.entries(counts)
    .map(([severity, count]) => ({ severity, count }))
    .sort((a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0) || b.count - a.count)
}

export function dimensionRows(data = {}) {
  const counts = data.dimension_counts || {}
  const scores = data.dimension_scores || {}
  return Object.entries(counts)
    .map(([dimension, count]) => ({
      dimension,
      count,
      score: Number(scores[dimension] || 0),
      grade: gradeFor(Number(scores[dimension] || 0))
    }))
    .sort((a, b) => b.count - a.count || a.dimension.localeCompare(b.dimension))
}

export function sourceRows(data = {}) {
  const counts = data.source_counts || {}
  return Object.entries(counts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source))
}

export function trendRows(data = []) {
  return [...data].sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

export function runRows(data = []) {
  return [...data]
    .map(run => ({
      id: run.id,
      language: run.language || 'Unknown',
      modelName: run.model_name || 'Default',
      score: Number(run.score || 0),
      status: run.status || 'unknown',
      privacyMode: Boolean(run.privacy_mode),
      createdAt: run.created_at || ''
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}

export function gradeFor(score) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'E'
}
