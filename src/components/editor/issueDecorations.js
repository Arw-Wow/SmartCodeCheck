import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView, gutter, GutterMarker } from '@codemirror/view'

export const setIssuesEffect = StateEffect.define()

const severityClass = (severity) => `cm-issue-${severity || 'info'}`

export function issueLineRanges(doc, issues, enabledSeverities = null) {
  const ranges = []
  for (const issue of issues || []) {
    if (!issue.line_start) continue
    if (enabledSeverities && !enabledSeverities.has(issue.severity)) continue
    const startLine = Math.max(1, issue.line_start)
    const endLine = Math.max(startLine, issue.line_end || startLine)
    if (startLine > doc.lines) continue
    const from = doc.line(startLine).from
    const to = doc.line(Math.min(endLine, doc.lines)).to
    ranges.push({ from, to, issue })
  }
  return ranges
}

export function buildIssueDecorations(doc, issues, enabledSeverities = null) {
  const builder = new RangeSetBuilder()
  for (const range of issueLineRanges(doc, issues, enabledSeverities)) {
    builder.add(
      range.from,
      range.to,
      Decoration.mark({
        class: `cm-issue-line ${severityClass(range.issue.severity)}`,
        attributes: { title: range.issue.description || range.issue.id }
      })
    )
  }
  return builder.finish()
}

const issueField = StateField.define({
  create() {
    return Decoration.none
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setIssuesEffect)) {
        return buildIssueDecorations(transaction.state.doc, effect.value.issues, effect.value.enabledSeverities)
      }
    }
    return value.map(transaction.changes)
  },
  provide: field => EditorView.decorations.from(field)
})

class IssueMarker extends GutterMarker {
  constructor(issue) {
    super()
    this.issue = issue
  }

  toDOM() {
    const marker = document.createElement('span')
    marker.className = `cm-issue-gutter ${severityClass(this.issue.severity)}`
    marker.title = this.issue.description || this.issue.id
    marker.textContent = '!'
    return marker
  }
}

export function issueGutter(issues = []) {
  return gutter({
    class: 'cm-issue-gutter-wrap',
    markers(view) {
      const builder = new RangeSetBuilder()
      for (const issue of issues) {
        if (!issue.line_start || issue.line_start > view.state.doc.lines) continue
        const line = view.state.doc.line(issue.line_start)
        builder.add(line.from, line.from, new IssueMarker(issue))
      }
      return builder.finish()
    }
  })
}

export function issueDecorationsExtension() {
  return issueField
}
