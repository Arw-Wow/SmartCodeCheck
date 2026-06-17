<template>
  <section v-if="hasSummary" class="quality-summary">
    <div class="summary-header">
      <div>
        <p class="eyebrow">{{ analyzerLabel }}</p>
        <h2>质量概览</h2>
      </div>
      <span v-if="qualityGate" class="gate" :class="gateClass">{{ qualityGateLabel }}</span>
    </div>

    <div v-if="metricItems.length" class="metric-grid">
      <div v-for="item in metricItems" :key="item.key" class="metric-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <p v-if="projectKey" class="project-key">{{ projectKey }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  facts: { type: Object, default: null }
})

const LABELS = {
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

const RATING_LABELS = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E'
}

const facts = computed(() => props.facts || {})
const metrics = computed(() => facts.value.metrics || {})
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
const metricItems = computed(() => {
  return Object.entries(LABELS)
    .filter(([key]) => metrics.value[key] !== undefined && metrics.value[key] !== null && metrics.value[key] !== '')
    .map(([key, label]) => ({ key, label, value: formatMetric(key, metrics.value[key]) }))
})
const hasSummary = computed(() => {
  return Boolean(facts.value.analyzer || qualityGate.value || metricItems.value.length || projectKey.value)
})

function formatMetric(key, value) {
  if (['coverage', 'duplicated_lines_density'].includes(key)) return `${value}%`
  if (['reliability_rating', 'security_rating', 'sqale_rating'].includes(key)) return RATING_LABELS[value] || value
  return value
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

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.metric-item {
  min-width: 0;
  display: grid;
  gap: 3px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
}

.metric-item span {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-item strong {
  overflow: hidden;
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-key {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
