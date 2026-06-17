import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView, gutter, GutterMarker } from '@codemirror/view'

export const setIssuesEffect = StateEffect.define()

const severityClass = (severity) => `cm-issue-${severity || 'info'}`
const EMPTY_ISSUE_STATE = { issues: [], enabledSeverities: null }

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
  return ranges.sort(compareRanges)
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

const issuePayloadField = StateField.define({
  create() {
    return EMPTY_ISSUE_STATE
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setIssuesEffect)) {
        return {
          issues: effect.value.issues || [],
          enabledSeverities: effect.value.enabledSeverities || null
        }
      }
    }
    return value
  }
})

const issueDecorationField = StateField.define({
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
      const payload = view.state.field(issuePayloadField, false) || EMPTY_ISSUE_STATE
      const activeIssues = payload.issues?.length ? payload.issues : issues
      const builder = new RangeSetBuilder()
      const lineMarkers = []
      for (const issue of activeIssues || []) {
        if (!issue.line_start) continue
        const lineNumber = Math.max(1, Number(issue.line_start))
        if (!Number.isFinite(lineNumber) || lineNumber > view.state.doc.lines) continue
        if (payload.enabledSeverities && !payload.enabledSeverities.has(issue.severity)) continue
        const line = view.state.doc.line(lineNumber)
        lineMarkers.push({ from: line.from, issue })
      }
      for (const marker of lineMarkers.sort(compareMarkers)) {
        builder.add(marker.from, marker.from, new IssueMarker(marker.issue))
      }
      return builder.finish()
    }
  })
}

export function issueDecorationsExtension() {
  return [issuePayloadField, issueDecorationField]
}

function compareRanges(a, b) {
  return a.from - b.from || a.to - b.to || String(a.issue?.id || '').localeCompare(String(b.issue?.id || ''))
}

function compareMarkers(a, b) {
  return a.from - b.from || String(a.issue?.id || '').localeCompare(String(b.issue?.id || ''))
}
