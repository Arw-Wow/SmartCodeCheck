import { describe, expect, it } from 'vitest'
import { Text } from '@codemirror/state'
import { filterIssues, issueFilterOptions, sortIssues } from '@/services/issues'
import { buildIssueDecorations, issueLineRanges } from '@/components/editor/issueDecorations'

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

  it('filters issue aliases and array fields from restored payloads', () => {
    const restored = [
      { id: '4', severity: 'High', target_dimensions: ['Security'], sources: ['Static'], line_start: 2 },
      { id: '5', level: 'low', category: 'style', provider: 'llm' }
    ]
    expect(filterIssues(restored, { severities: ['high'], dimensions: ['security'], sources: ['static'] })).toEqual([restored[0]])
  })

  it('sorts by severity then line', () => {
    expect(sortIssues(issues).map(issue => issue.id)).toEqual(['2', '3', '1'])
  })

  it('builds filter options from real issue values only', () => {
    const options = issueFilterOptions([
      ...issues,
      { id: 'placeholder', severity: 'Severity', dimension: 'Dimension', source: 'Source' }
    ])
    expect(options).toEqual({
      severities: ['high', 'low', 'medium'],
      dimensions: ['security', 'style'],
      sources: ['llm', 'static', 'validation']
    })
  })

  it('maps issue lines to CodeMirror ranges and skips missing lines', () => {
    const doc = Text.of(['a', 'b', 'c', 'd'])
    const ranges = issueLineRanges(doc, issues)
    expect(ranges).toHaveLength(2)
    expect(ranges[0].from).toBe(0)
    expect(ranges[0].to).toBe(1)
    expect(ranges[1].from).toBe(4)
    expect(ranges[1].to).toBe(7)
  })

  it('builds CodeMirror decorations from unsorted display issues', () => {
    const doc = Text.of(['a', 'b', 'c', 'd'])
    const unsortedByLine = [
      { id: 'later-high', severity: 'high', line_start: 4, line_end: 4 },
      { id: 'earlier-low', severity: 'low', line_start: 1, line_end: 1 }
    ]

    expect(() => buildIssueDecorations(doc, unsortedByLine)).not.toThrow()
    expect(issueLineRanges(doc, unsortedByLine).map(range => range.issue.id)).toEqual(['earlier-low', 'later-high'])
  })
})
