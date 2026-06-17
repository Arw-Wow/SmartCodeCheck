import { describe, expect, it } from 'vitest'
import { normalizeOverview, runRows, severityChartRows, trendRows } from '@/services/dashboard'

describe('dashboard transforms', () => {
  it('normalizes overview defaults', () => {
    expect(normalizeOverview({ total_runs: 3, average_score: 82.25 })).toEqual({ totalRuns: 3, averageScore: 82.25 })
    expect(normalizeOverview()).toEqual({ totalRuns: 0, averageScore: 0 })
  })

  it('turns severity counts into sorted rows', () => {
    expect(severityChartRows({ severity_counts: { low: 1, high: 3 } })).toEqual([
      { severity: 'high', count: 3 },
      { severity: 'low', count: 1 }
    ])
  })

  it('sorts trends by date', () => {
    expect(trendRows([{ date: '2026-06-02' }, { date: '2026-06-01' }]).map(row => row.date)).toEqual(['2026-06-01', '2026-06-02'])
  })

  it('normalizes run rows for history restore', () => {
    const rows = runRows([
      { id: 1, language: 'Python', model_name: null, score: 91.5, status: 'completed', privacy_mode: true, created_at: '2026-06-01T00:00:00Z' },
      { id: 2, language: 'Go', model_name: 'local', score: null, status: 'failed', privacy_mode: false, created_at: '2026-06-02T00:00:00Z' }
    ])
    expect(rows.map(row => row.id)).toEqual([2, 1])
    expect(rows[0]).toMatchObject({ modelName: 'local', score: 0, privacyMode: false })
    expect(rows[1]).toMatchObject({ modelName: 'Default', score: 91.5, privacyMode: true })
  })
})
