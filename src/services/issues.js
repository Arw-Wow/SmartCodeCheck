const SEVERITY_ORDER = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1
}

export function filterIssues(issues, filters = {}) {
  const severities = new Set(filters.severities || [])
  const dimensions = new Set(filters.dimensions || [])
  const sources = new Set(filters.sources || [])

  return (issues || []).filter(issue => {
    if (severities.size && !severities.has(issue.severity)) return false
    if (dimensions.size && !dimensions.has(issue.dimension)) return false
    if (sources.size && !sources.has(issue.source)) return false
    return true
  })
}

export function sortIssues(issues) {
  return [...(issues || [])].sort((a, b) => {
    const severityDelta = (SEVERITY_ORDER[b.severity] || 0) - (SEVERITY_ORDER[a.severity] || 0)
    if (severityDelta) return severityDelta
    return (a.line_start || Number.MAX_SAFE_INTEGER) - (b.line_start || Number.MAX_SAFE_INTEGER)
  })
}

export function issueFilterOptions(issues) {
  const placeholderValues = new Set(['severity', 'dimension', 'source'])
  const values = (key) => [
    ...new Set(
      (issues || [])
        .map(issue => issue[key])
        .filter(value => value && !placeholderValues.has(String(value).toLowerCase()))
    )
  ].sort()
  return {
    severities: values('severity'),
    dimensions: values('dimension'),
    sources: values('source')
  }
}
