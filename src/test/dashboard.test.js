import { describe, expect, it } from 'vitest'
import { normalizeOverview, severityChartRows, trendRows } from '@/services/dashboard'

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
})
