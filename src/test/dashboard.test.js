import { describe, expect, it } from 'vitest'
import {
  dimensionRows,
  languageRows,
  modelRows,
  normalizeOverview,
  privacyRows,
  runRows,
  severityChartRows,
  sourceRows,
  statusRows,
  trendRows
} from '@/services/dashboard'

describe('dashboard transforms', () => {
  it('normalizes overview defaults', () => {
    expect(normalizeOverview({ total_runs: 3, average_score: 82.25, total_issues: 4 })).toMatchObject({
      totalRuns: 3,
      averageScore: 82.25,
      totalIssues: 4
    })
    expect(normalizeOverview()).toMatchObject({ totalRuns: 0, averageScore: 0, totalIssues: 0 })
    expect(normalizeOverview(null)).toMatchObject({ totalRuns: 0, averageScore: 0, totalIssues: 0 })
  })

  it('turns severity counts into sorted rows', () => {
    expect(severityChartRows({ severity_counts: { low: 1, high: 3 } })).toEqual([
      { severity: 'high', count: 3 },
      { severity: 'low', count: 1 }
    ])
    expect(severityChartRows({ severity_counts: null })).toEqual([])
  })

  it('turns dimension and source stats into dashboard rows', () => {
    expect(dimensionRows({ dimension_counts: { security: 2 }, dimension_scores: { security: 78 } })).toEqual([
      { dimension: 'security', count: 2, score: 78, grade: 'C' }
    ])
    expect(dimensionRows({ dimension_counts: null, dimension_scores: null })).toEqual([])
    expect(sourceRows({ source_counts: { llm: 1, static: 3 } })).toEqual([
      { source: 'static', count: 3 },
      { source: 'llm', count: 1 }
    ])
    expect(sourceRows({ source_counts: null })).toEqual([])
  })

  it('sorts trends by date', () => {
    expect(trendRows([{ date: '2026-06-02' }, { date: '2026-06-01' }]).map(row => row.date)).toEqual(['2026-06-01', '2026-06-02'])
    expect(trendRows(null)).toEqual([])
  })

  it('turns overview counts into distribution rows', () => {
    const overview = normalizeOverview({
      language_counts: { Python: 2, Go: 1 },
      status_counts: { completed: 2 },
      model_counts: { Default: 1, local: 3 },
      privacy_counts: { privacy: 1, stored: 2 }
    })
    expect(languageRows(overview)).toEqual([{ language: 'Python', count: 2 }, { language: 'Go', count: 1 }])
    expect(statusRows(overview)).toEqual([{ status: 'completed', count: 2 }])
    expect(modelRows(overview)).toEqual([{ model: 'local', count: 3 }, { model: 'Default', count: 1 }])
    expect(privacyRows(overview)).toEqual([{ mode: 'stored', count: 2 }, { mode: 'privacy', count: 1 }])
  })

  it('normalizes run rows for history restore', () => {
    const rows = runRows([
      { id: 1, language: 'Python', model_name: null, score: 91.5, status: 'completed', privacy_mode: true, created_at: '2026-06-01T00:00:00Z' },
      { id: 2, language: 'Go', model_name: 'local', score: null, status: 'failed', privacy_mode: false, created_at: '2026-06-02T00:00:00Z' }
    ])
    expect(rows.map(row => row.id)).toEqual([2, 1])
    expect(rows[0]).toMatchObject({ modelName: 'local', score: 0, privacyMode: false })
    expect(rows[1]).toMatchObject({ modelName: 'Default', score: 91.5, privacyMode: true })
    expect(runRows(null)).toEqual([])
  })
})
