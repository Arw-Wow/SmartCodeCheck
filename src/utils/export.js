// src/utils/export.js

/**
 * 导出文本文件 (JSON, Markdown, TXT)
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} type - MIME type (e.g., 'application/json')
 */
export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 将检测结果转换为 Markdown 格式
 */
export function generateDetectionMarkdown(result, language) {
  let md = `# 代码质量检测报告\n\n`
  md += `**检测时间**: ${new Date().toLocaleString()}\n`
  md += `**语言**: ${language}\n`
  md += `**综合评分**: ${result.score}\n\n`
  
  md += `## 详细问题列表\n`
  result.issues.forEach((issue, index) => {
    md += `### ${index + 1}. [${issue.type}] ${issue.dimension}\n`
    md += `- **描述**: ${issue.description}\n`
    if (issue.line) md += `- **位置**: Line ${issue.line}\n`
    md += `- **建议**: ${issue.suggestion}\n\n`
  })
  
  return md
}

/**
 * 将 v2 工作台结果转换为 Markdown 格式
 */
export function generateWorkspaceMarkdown(result, language) {
  let md = `# 工作台代码质量分析报告\n\n`
  md += `**检测时间**: ${new Date().toLocaleString()}\n`
  md += `**语言**: ${language}\n`
  md += `**综合评分**: ${result.score}\n\n`

  if (result.facts?.analyzer) {
    md += `## 静态分析概览\n`
    md += `- **分析器**: ${result.facts.analyzer}\n`
    if (result.facts.quality_gate) md += `- **质量门禁**: ${result.facts.quality_gate}\n`
    if (result.facts.project_key) md += `- **项目 Key**: ${result.facts.project_key}\n`
    md += `\n`
  }

  if (result.warnings?.length) {
    md += `## 分析提示\n`
    result.warnings.forEach(warning => {
      md += `- ${warning}\n`
    })
    md += `\n`
  }

  md += `## 问题列表\n`
  ;(result.issues || []).forEach((issue, index) => {
    md += `### ${index + 1}. [${issue.severity}] ${issue.dimension}\n`
    md += `- **来源**: ${issue.source}\n`
    md += `- **描述**: ${issue.description}\n`
    if (issue.line_start) md += `- **位置**: Line ${issue.line_start}${issue.line_end && issue.line_end !== issue.line_start ? `-${issue.line_end}` : ''}\n`
    if (issue.evidence?.length) md += `- **证据**: ${issue.evidence.join('; ')}\n`
    if (issue.impact) md += `- **影响**: ${issue.impact}\n`
    md += `- **建议**: ${issue.suggestion}\n\n`
  })

  return md
}

/**
 * 将对比结果转换为 Markdown 格式
 */
export function generateComparisonMarkdown(result, language) {
  let md = `# 代码质量对比报告\n\n`
  md += `**检测时间**: ${new Date().toLocaleString()}\n`
  md += `**语言**: ${language}\n\n`
  
  md += `## 🏆 总结\n${result.summary}\n\n`
  
  md += `## 评分对比\n`
  md += `| 维度 | 代码 A | 代码 B |\n|---|---|---|\n`
  md += `| **综合** | **${result.score_a}** | **${result.score_b}** |\n`
  
  for (const [dim, scores] of Object.entries(result.dimension_scores)) {
    md += `| ${dim} | ${scores[0]} | ${scores[1]} |\n`
  }
  
  return md
}
