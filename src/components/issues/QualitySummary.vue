<template>
  <section v-if="hasSummary" class="quality-summary">
    <div class="summary-header">
      <div>
        <p class="eyebrow">{{ analyzerLabel }}</p>
        <h2>质量概览</h2>
      </div>
      <span v-if="qualityGate" class="gate" :class="gateClass">{{ qualityGateLabel }}</span>
    </div>

    <div v-if="dimensionRatings.length" class="dimension-grid">
      <div v-for="item in dimensionRatings" :key="item.dimension" class="dimension-item" :class="item.gradeClass">
        <span>{{ dimensionLabel(item.dimension) }}</span>
        <strong>{{ item.grade }}</strong>
        <small>{{ item.score }} / 100 · {{ item.issueCount }} 个问题</small>
      </div>
    </div>

    <div v-if="summaryItems.length" class="metric-grid">
      <div v-for="item in summaryItems" :key="item.key" class="metric-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small v-if="item.hint">{{ item.hint }}</small>
      </div>
    </div>

    <p v-if="projectKey" class="project-key">{{ projectKey }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  facts: { type: Object, default: null },
  issues: { type: Array, default: () => [] },
  dimensions: { type: Array, default: () => [] }
})

const STATIC_METRIC_LABELS = {
  bugs: 'Bugs',
  vulnerabilities: '漏洞',
  security_hotspots: '安全热点',
  code_smells: '异味',
  coverage: '覆盖率',
  duplicated_lines_density: '重复率',
  ncloc: '代码行',
  complexity: '复杂度',
  cognitive_complexity: '认知复杂度',
  reliability_rating: '可靠性',
  security_rating: '安全性',
  sqale_rating: '可维护性'
}

const DIMENSION_LABELS = {
  correctness: '正确性',
  security: '安全性',
  maintainability: '可维护性',
  efficiency: '执行效率',
  robustness: '鲁棒性',
  performance: '性能',
  readability: '可读性',
  style: '风格'
}

const SEVERITY_PENALTY = {
  critical: 25,
  high: 18,
  medium: 10,
  low: 4,
  info: 1
}

const RATING_LABELS = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E'
}

const facts = computed(() => props.facts || {})
const metrics = computed(() => facts.value.metrics || {})
const issues = computed(() => props.issues || [])
const analyzerLabel = computed(() => {
  const analyzer = facts.value.analyzer || 'builtin'
  if (analyzer.includes('sonarqube')) return 'SonarQube + 内置分析'
  return '内置静态分析'
})
const projectKey = computed(() => facts.value.project_key || '')
const qualityGate = computed(() => metrics.value.alert_status || facts.value.quality_gate || '')
const qualityGateLabel = computed(() => {
  if (!qualityGate.value) return ''
  if (qualityGate.value === 'OK') return '通过'
  if (qualityGate.value === 'ERROR') return '未通过'
  return qualityGate.value
})
const gateClass = computed(() => (qualityGate.value === 'OK' ? 'ok' : 'error'))
const staticMetricItems = computed(() => {
  const sonarItems = Object.entries(STATIC_METRIC_LABELS)
    .filter(([key]) => metrics.value[key] !== undefined && metrics.value[key] !== null && metrics.value[key] !== '')
    .map(([key, label]) => ({ key, label, value: formatMetric(key, metrics.value[key]) }))
  const builtinItems = [
    facts.value.function_count ? { key: 'function_count', label: '函数数', value: facts.value.function_count } : null,
    facts.value.class_count ? { key: 'class_count', label: '类数量', value: facts.value.class_count } : null,
    facts.value.cyclomatic_complexity ? { key: 'cyclomatic_complexity', label: '圈复杂度', value: facts.value.cyclomatic_complexity } : null,
    facts.value.max_nesting_depth ? { key: 'max_nesting_depth', label: '最大嵌套', value: facts.value.max_nesting_depth } : null,
    facts.value.risk_calls?.length ? { key: 'risk_calls', label: '风险调用', value: facts.value.risk_calls.length } : null
  ].filter(Boolean)
  return [...sonarItems, ...builtinItems].slice(0, 6)
})
const generatedItems = computed(() => {
  const severityCounts = countBy(issues.value, issue => issue.severity || 'info')
  const sourceCounts = countBy(issues.value, issue => issue.source || 'unknown')
  const dimensionCounts = countBy(issues.value, issue => issue.dimension || 'unknown')
  const topDimension = topEntry(dimensionCounts)
  const highRisk = (severityCounts.critical || 0) + (severityCounts.high || 0)
  const llmCount = (sourceCounts.llm || 0) + (sourceCounts['static+llm'] || 0)
  return [
    { key: 'issue_total', label: '问题总数', value: issues.value.length, hint: highRisk ? `${highRisk} 个高风险` : '未发现高风险' },
    { key: 'top_dimension', label: '主要方向', value: topDimension ? dimensionLabel(topDimension[0]) : '无', hint: topDimension ? `${topDimension[1]} 个问题` : '暂无问题' },
    { key: 'llm_findings', label: '模型补充', value: llmCount, hint: llmCount ? 'AI 生成或合并发现' : '无模型补充问题' }
  ]
})
const summaryItems = computed(() => [...generatedItems.value, ...staticMetricItems.value])
const dimensionRatings = computed(() => {
  const dimensions = props.dimensions?.length
    ? props.dimensions
    : [...new Set(issues.value.map(issue => issue.dimension).filter(Boolean))]
  return dimensions.map(dimension => {
    const dimensionIssues = issues.value.filter(issue => issue.dimension === dimension)
    const score = scoreIssues(dimensionIssues)
    return {
      dimension,
      score,
      grade: gradeFor(score),
      gradeClass: `grade-${gradeFor(score).toLowerCase()}`,
      issueCount: dimensionIssues.length
    }
  })
})
const hasSummary = computed(() => {
  return Boolean(facts.value.analyzer || qualityGate.value || summaryItems.value.length || dimensionRatings.value.length || projectKey.value)
})

function formatMetric(key, value) {
  if (['coverage', 'duplicated_lines_density'].includes(key)) return `${value}%`
  if (['reliability_rating', 'security_rating', 'sqale_rating'].includes(key)) return RATING_LABELS[value] || value
  return value
}

function countBy(items, getter) {
  return items.reduce((counts, item) => {
    const key = getter(item)
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}

function topEntry(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || null
}

function scoreIssues(items) {
  const penalty = items.reduce((sum, issue) => sum + (SEVERITY_PENALTY[issue.severity] || 1) * (issue.confidence || 1), 0)
  return Math.max(0, Math.round(100 - penalty))
}

function gradeFor(score) {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'E'
}

function dimensionLabel(value) {
  return DIMENSION_LABELS[value] || value
}
</script>

<style scoped>
.quality-summary {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}

.summary-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.eyebrow,
.project-key {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.74rem;
}

h2 {
  margin: 2px 0 0;
  font-size: 1rem;
}

.gate {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 0.72rem;
  font-weight: 700;
}

.gate.ok {
  color: #7ee787;
  background: rgba(35, 134, 54, 0.18);
}

.gate.error {
  color: #ff7b72;
  background: rgba(218, 54, 51, 0.16);
}

.metric-grid,
.dimension-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.dimension-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric-item,
.dimension-item {
  min-width: 0;
  display: grid;
  gap: 3px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
}

.dimension-item {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

.dimension-item small {
  grid-column: 1 / -1;
}

.metric-item span,
.dimension-item span,
.metric-item small,
.dimension-item small {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-item strong,
.dimension-item strong {
  overflow: hidden;
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dimension-item strong {
  font-size: 1.25rem;
  text-align: right;
}

.grade-a strong,
.grade-b strong {
  color: #7ee787;
}

.grade-c strong {
  color: #fbbf24;
}

.grade-d strong,
.grade-e strong {
  color: #ff7b72;
}

.project-key {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1280px) {
  .dimension-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .summary-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-grid,
  .dimension-grid {
    grid-template-columns: 1fr;
  }
}
</style>
