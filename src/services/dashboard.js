export function normalizeOverview(data = {}) {
  return {
    totalRuns: data.total_runs || 0,
    averageScore: Number(data.average_score || 0)
  }
}

export function severityChartRows(data = {}) {
  const counts = data.severity_counts || {}
  return Object.entries(counts)
    .map(([severity, count]) => ({ severity, count }))
    .sort((a, b) => b.count - a.count)
}

export function trendRows(data = []) {
  return [...data].sort((a, b) => String(a.date).localeCompare(String(b.date)))
}
