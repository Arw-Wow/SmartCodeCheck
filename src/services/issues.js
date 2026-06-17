const SEVERITY_ORDER = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1
}

export function filterIssues(issues, filters = {}) {
  const severities = normalizedSet(filters.severities)
  const dimensions = normalizedSet(filters.dimensions)
  const sources = normalizedSet(filters.sources)

  return (issues || []).filter(issue => {
    if (severities.size && !hasAnyValue(issueValues(issue, 'severity'), severities)) return false
    if (dimensions.size && !hasAnyValue(issueValues(issue, 'dimension'), dimensions)) return false
    if (sources.size && !hasAnyValue(issueValues(issue, 'source'), sources)) return false
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
        .flatMap(issue => issueValues(issue, key))
        .filter(value => value && !placeholderValues.has(String(value).toLowerCase()))
    )
  ].sort()
  return {
    severities: values('severity'),
    dimensions: values('dimension'),
    sources: values('source')
  }
}

function normalizedSet(values = []) {
  return new Set((values || []).map(normalizeValue).filter(Boolean))
}

function hasAnyValue(values, allowed) {
  return values.some(value => allowed.has(normalizeValue(value)))
}

function issueValues(issue, key) {
  if (!issue) return []
  const candidates = {
    severity: [issue.severity, issue.level],
    dimension: [issue.dimension, issue.dimensions, issue.target_dimension, issue.target_dimensions, issue.category],
    source: [issue.source, issue.sources, issue.provider, issue.analyzer]
  }[key] || [issue[key]]
  return candidates.flatMap(value => Array.isArray(value) ? value : [value]).filter(value => value !== undefined && value !== null && value !== '')
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase()
}
