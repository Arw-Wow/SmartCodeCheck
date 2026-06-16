import { describe, expect, it } from 'vitest'
import { Text } from '@codemirror/state'
import { filterIssues, sortIssues } from '@/services/issues'
import { issueLineRanges } from '@/components/editor/issueDecorations'

const issues = [
  { id: '1', severity: 'low', dimension: 'style', source: 'llm', line_start: 3, line_end: 4 },
  { id: '2', severity: 'high', dimension: 'security', source: 'static', line_start: 1, line_end: 1 },
  { id: '3', severity: 'medium', dimension: 'security', source: 'validation' }
]

describe('issue utilities', () => {
  it('filters by severity dimension and source', () => {
    const result = filterIssues(issues, {
      severities: ['high'],
      dimensions: ['security'],
      sources: ['static']
    })
    expect(result).toEqual([issues[1]])
  })

  it('sorts by severity then line', () => {
    expect(sortIssues(issues).map(issue => issue.id)).toEqual(['2', '3', '1'])
  })

  it('maps issue lines to CodeMirror ranges and skips missing lines', () => {
    const doc = Text.of(['a', 'b', 'c', 'd'])
    const ranges = issueLineRanges(doc, issues)
    expect(ranges).toHaveLength(2)
    expect(ranges[0].from).toBe(4)
    expect(ranges[0].to).toBe(7)
  })
})
