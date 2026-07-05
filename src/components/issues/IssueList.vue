<template>
  <div class="issue-list">
    <div class="issue-filters">
      <details class="filter-menu" name="issue-filter">
        <summary>
          <span class="filter-title">严重程度</span>
          <span class="filter-value">{{ labelFor(filters.severities, severityLabel) }}</span>
        </summary>
        <div class="filter-options">
          <label><input type="checkbox" :checked="!filters.severities.length" @change="clearFilter('severities')" /> 全部</label>
          <label v-for="item in options.severities" :key="item">
            <input type="checkbox" :checked="filters.severities.includes(item)" @change="toggleFilter('severities', item)" />
            {{ severityLabel(item) }}
          </label>
        </div>
      </details>
      <details class="filter-menu" name="issue-filter">
        <summary>
          <span class="filter-title">维度</span>
          <span class="filter-value">{{ labelFor(filters.dimensions, dimensionLabel) }}</span>
        </summary>
        <div class="filter-options">
          <label><input type="checkbox" :checked="!filters.dimensions.length" @change="clearFilter('dimensions')" /> 全部</label>
          <label v-for="item in options.dimensions" :key="item" :title="item">
            <input type="checkbox" :checked="filters.dimensions.includes(item)" @change="toggleFilter('dimensions', item)" />
            {{ dimensionLabel(item) }}
          </label>
        </div>
      </details>
      <details class="filter-menu" name="issue-filter">
        <summary>
          <span class="filter-title">来源</span>
          <span class="filter-value">{{ labelFor(filters.sources, sourceLabel) }}</span>
        </summary>
        <div class="filter-options">
          <label><input type="checkbox" :checked="!filters.sources.length" @change="clearFilter('sources')" /> 全部</label>
          <label v-for="item in options.sources" :key="item">
            <input type="checkbox" :checked="filters.sources.includes(item)" @change="toggleFilter('sources', item)" />
            {{ sourceLabel(item) }}
          </label>
        </div>
      </details>
    </div>

    <p v-if="!issues.length" class="empty-state">当前筛选条件下没有问题。</p>

    <div class="issue-rows">
      <button
        v-for="issue in issues"
        :key="issue.id"
        class="issue-row"
        :class="severityClass(issue)"
        :title="issue.description || issue.id"
        @click="emit('select', issue)"
      >
        <span class="issue-head">
          <span class="issue-identity">
            <span class="severity-dot" aria-hidden="true"></span>
            <strong>{{ issue.id }}</strong>
          </span>
          <span class="severity-pill">{{ severityLabel(issue.severity) }}</span>
        </span>

        <span class="issue-description">{{ issue.description }}</span>

        <span v-if="issue.suggestion" class="issue-suggestion">
          <span class="suggestion-label">建议</span>
          <span>{{ issue.suggestion }}</span>
        </span>

        <span class="issue-meta-row">
          <span class="meta-chip">{{ dimensionLabel(issue.dimension) }}</span>
          <span class="meta-chip">{{ sourceLabel(issue.source) }}</span>
          <span v-if="issue.confidence !== undefined && issue.confidence !== null" class="meta-chip">
            置信 {{ confidenceLabel(issue.confidence) }}
          </span>
          <span v-if="lineLabel(issue)" class="issue-line">{{ lineLabel(issue) }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { issueFilterOptions } from '@/services/issues'

const props = defineProps({
  issues: { type: Array, default: () => [] },
  allIssues: { type: Array, default: null },
  filters: { type: Object, default: () => ({ severities: [], dimensions: [], sources: [] }) }
})

const emit = defineEmits(['select', 'update:filters'])
const options = computed(() => issueFilterOptions(props.allIssues || props.issues))

function labelFor(values = [], formatter = value => value) {
  if (!values.length) return '全部'
  if (values.length === 1) return formatter(values[0])
  return `已选 ${values.length} 项`
}

function clearFilter(key) {
  emit('update:filters', { ...props.filters, [key]: [] })
}

function toggleFilter(key, value) {
  const values = new Set(props.filters[key] || [])
  if (values.has(value)) values.delete(value)
  else values.add(value)
  emit('update:filters', { ...props.filters, [key]: [...values] })
}

function severityLabel(value) {
  return {
    critical: '致命',
    high: '高',
    medium: '中',
    low: '低',
    info: '提示'
  }[value] || value
}

function dimensionLabel(value) {
  return {
    correctness: '正确性',
    security: '安全性',
    maintainability: '可维护性',
    efficiency: '执行效率',
    robustness: '鲁棒性',
    readability: '可读性',
    style: '代码风格'
  }[value] || value
}

function sourceLabel(value) {
  return {
    static: '静态分析',
    llm: 'AI 分析',
    'static+llm': '静态+AI',
    validation: '验证'
  }[value] || value
}

function severityClass(issue) {
  return `severity-${normalizeSeverity(issue?.severity)}`
}

function normalizeSeverity(value) {
  const severity = String(value || 'info').trim().toLowerCase()
  return ['critical', 'high', 'medium', 'low', 'info'].includes(severity) ? severity : 'info'
}

function lineLabel(issue) {
  const start = Number(issue?.line_start)
  const end = Number(issue?.line_end)
  if (!start) return ''
  if (end && end !== start) return `Ln ${start}-${end}`
  return `Ln ${start}`
}

function confidenceLabel(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return value
  return `${Math.round(Math.max(0, Math.min(1, numeric)) * 100)}%`
}
</script>

<style scoped>
.issue-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.issue-filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  position: sticky;
  top: 0;
  z-index: 8;
  padding-bottom: 6px;
  background: linear-gradient(180deg, #161b22 0%, rgba(22, 27, 34, 0.92) 78%, rgba(22, 27, 34, 0) 100%);
}

.filter-menu,
.issue-row {
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  border-radius: 6px;
}

.filter-menu {
  position: relative;
  min-width: 0;
  height: 44px;
}

.filter-menu summary {
  align-items: flex-start;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
  list-style: none;
  overflow: hidden;
  padding: 7px 28px 7px 9px;
  position: relative;
}

.filter-menu summary::-webkit-details-marker {
  display: none;
}

.filter-menu summary::after {
  border-bottom: 1.5px solid var(--text-secondary);
  border-right: 1.5px solid var(--text-secondary);
  content: '';
  height: 6px;
  position: absolute;
  right: 10px;
  top: 16px;
  transform: rotate(45deg);
  transition: transform 0.16s ease;
  width: 6px;
}

.filter-menu[open] {
  border-color: rgba(59, 130, 246, 0.55);
  background: rgba(31, 41, 55, 0.86);
  z-index: 12;
}

.filter-menu[open] summary::after {
  transform: translateY(3px) rotate(225deg);
}

.filter-title,
.filter-value {
  display: block;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-title {
  color: var(--text-secondary);
  font-size: 0.68rem;
  line-height: 1;
}

.filter-value {
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 650;
  line-height: 1.2;
}

.filter-options {
  background: #111827;
  border: 1px solid rgba(59, 130, 246, 0.36);
  border-radius: 6px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
  display: grid;
  gap: 2px;
  left: 0;
  min-width: 156px;
  padding: 6px;
  position: absolute;
  top: calc(100% + 6px);
}

.filter-menu:nth-child(3) .filter-options {
  left: auto;
  right: 0;
}

.filter-options label {
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
  padding: 6px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 4px;
  font-size: 0.78rem;
  line-height: 1.25;
}

.filter-options input {
  flex: 0 0 auto;
}

.filter-options label:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.issue-rows {
  display: grid;
  gap: 10px;
}

.issue-row {
  --severity-color: #8b949e;
  --severity-bg: rgba(139, 148, 158, 0.14);
  --severity-border: rgba(139, 148, 158, 0.32);
  background:
    linear-gradient(90deg, var(--severity-bg) 0, rgba(255, 255, 255, 0.035) 42px),
    rgba(255, 255, 255, 0.035);
  border-color: var(--severity-border);
  box-shadow: inset 3px 0 0 var(--severity-color);
  cursor: pointer;
  display: grid;
  gap: 9px;
  min-width: 0;
  padding: 11px 12px 12px;
  position: relative;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease;
}

.issue-row:hover {
  border-color: color-mix(in srgb, var(--severity-color), white 18%);
  box-shadow: inset 3px 0 0 var(--severity-color), 0 12px 26px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.issue-row:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--severity-color), white 24%);
  outline-offset: 2px;
}

.issue-row.severity-critical {
  --severity-color: #ff6b6b;
  --severity-bg: rgba(255, 107, 107, 0.12);
  --severity-border: rgba(255, 107, 107, 0.36);
}

.issue-row.severity-high {
  --severity-color: #f97316;
  --severity-bg: rgba(249, 115, 22, 0.12);
  --severity-border: rgba(249, 115, 22, 0.36);
}

.issue-row.severity-medium {
  --severity-color: #facc15;
  --severity-bg: rgba(250, 204, 21, 0.1);
  --severity-border: rgba(250, 204, 21, 0.32);
}

.issue-row.severity-low {
  --severity-color: #38bdf8;
  --severity-bg: rgba(56, 189, 248, 0.1);
  --severity-border: rgba(56, 189, 248, 0.3);
}

.issue-row.severity-info {
  --severity-color: #a78bfa;
  --severity-bg: rgba(167, 139, 250, 0.1);
  --severity-border: rgba(167, 139, 250, 0.28);
}

.issue-head,
.issue-identity,
.issue-meta-row,
.issue-suggestion {
  align-items: center;
  display: flex;
  min-width: 0;
}

.issue-head {
  justify-content: space-between;
  gap: 10px;
}

.issue-identity {
  gap: 7px;
}

.issue-identity strong {
  color: var(--text-primary);
  font-size: 0.88rem;
  line-height: 1.2;
  min-width: 0;
  overflow-wrap: anywhere;
}

.severity-dot {
  background: var(--severity-color);
  border-radius: 999px;
  box-shadow: 0 0 0 4px var(--severity-bg);
  flex: 0 0 auto;
  height: 8px;
  width: 8px;
}

.severity-pill {
  background: var(--severity-bg);
  border: 1px solid var(--severity-border);
  border-radius: 999px;
  color: color-mix(in srgb, var(--severity-color), white 20%);
  flex: 0 0 auto;
  font-size: 0.7rem;
  font-weight: 750;
  line-height: 1;
  padding: 5px 7px;
}

.issue-description {
  color: var(--text-primary);
  display: block;
  font-size: 0.84rem;
  line-height: 1.42;
  overflow-wrap: anywhere;
}

.issue-suggestion {
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  color: var(--text-secondary);
  gap: 7px;
  padding: 7px 8px;
}

.issue-suggestion span:last-child {
  font-size: 0.75rem;
  line-height: 1.35;
  min-width: 0;
  overflow-wrap: anywhere;
}

.suggestion-label {
  border: 1px solid rgba(59, 130, 246, 0.34);
  border-radius: 4px;
  color: #93c5fd;
  flex: 0 0 auto;
  font-size: 0.66rem;
  font-weight: 700;
  line-height: 1;
  padding: 3px 4px;
}

.issue-meta-row {
  flex-wrap: wrap;
  gap: 6px;
}

.meta-chip,
.issue-line,
.empty-state {
  font-size: 0.74rem;
  line-height: 1.2;
}

.meta-chip,
.issue-line {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  min-width: 0;
  padding: 4px 7px;
}

.meta-chip {
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-line {
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.24);
  color: #93c5fd;
  font-weight: 700;
  margin-left: auto;
}

.empty-state {
  color: var(--text-secondary);
}

.empty-state {
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  margin: 0;
  padding: 14px;
}

@media (max-width: 760px) {
  .issue-filters {
    grid-template-columns: 1fr;
    position: static;
    padding-bottom: 0;
    background: transparent;
  }

  .filter-menu {
    height: auto;
    min-height: 42px;
  }

  .filter-options {
    position: static;
    margin-top: 6px;
    min-width: 0;
    box-shadow: none;
  }
}
</style>
