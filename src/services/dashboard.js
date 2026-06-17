export function normalizeOverview(data = {}) {
  const source = isRecord(data) ? data : {}
  return {
    totalRuns: source.total_runs || 0,
    averageScore: Number(source.average_score || 0),
    bestScore: Number(source.best_score || 0),
    latestScore: Number(source.latest_score || 0),
    totalIssues: Number(source.total_issues || 0),
    completedRuns: Number(source.completed_runs || 0),
    completionRate: Number(source.completion_rate || 0),
    averageDurationMs: Number(source.average_duration_ms || 0),
    averageIssuesPerRun: Number(source.average_issues_per_run || 0),
    severeIssueCount: Number(source.severe_issue_count || 0),
    languageCounts: isRecord(source.language_counts) ? source.language_counts : {},
    statusCounts: isRecord(source.status_counts) ? source.status_counts : {},
    modelCounts: isRecord(source.model_counts) ? source.model_counts : {},
    privacyCounts: isRecord(source.privacy_counts) ? source.privacy_counts : {},
    lastRunAt: source.last_run_at || ''
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
  const counts = isRecord(data?.severity_counts) ? data.severity_counts : {}
  return Object.entries(counts)
    .map(([severity, count]) => ({ severity, count }))
    .sort((a, b) => (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0) || b.count - a.count)
}

export function dimensionRows(data = {}) {
  const counts = isRecord(data?.dimension_counts) ? data.dimension_counts : {}
  const scores = isRecord(data?.dimension_scores) ? data.dimension_scores : {}
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
  const counts = isRecord(data?.source_counts) ? data.source_counts : {}
  return countRows(counts, 'source')
}

export function trendRows(data = []) {
  return (Array.isArray(data) ? [...data] : [])
    .map(row => ({
      ...row,
      score: Number(row.score || 0),
      issue_count: Number(row.issue_count || 0),
      duration_ms: Number(row.duration_ms || 0)
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || Number(a.run_id || 0) - Number(b.run_id || 0))
}

export function languageRows(data = {}) {
  const counts = isRecord(data?.languageCounts) ? data.languageCounts : data?.language_counts
  return countRows(counts, 'language')
}

export function statusRows(data = {}) {
  const counts = isRecord(data?.statusCounts) ? data.statusCounts : data?.status_counts
  return countRows(counts, 'status')
}

export function modelRows(data = {}) {
  const counts = isRecord(data?.modelCounts) ? data.modelCounts : data?.model_counts
  return countRows(counts, 'model')
}

export function privacyRows(data = {}) {
  const counts = isRecord(data?.privacyCounts) ? data.privacyCounts : data?.privacy_counts
  return countRows(counts, 'mode')
}

export function runRows(data = []) {
  return (Array.isArray(data) ? [...data] : [])
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

function countRows(counts = {}, key) {
  if (!isRecord(counts)) return []
  return Object.entries(counts)
    .map(([name, count]) => ({ [key]: name, count: Number(count || 0) }))
    .sort((a, b) => b.count - a.count || String(a[key]).localeCompare(String(b[key])))
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
