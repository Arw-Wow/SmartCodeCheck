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
        :class="issue.severity"
        @click="emit('select', issue)"
      >
        <span class="issue-main">
          <strong>{{ issue.id }}</strong>
          <span>{{ issue.description }}</span>
        </span>
        <span class="issue-meta">{{ severityLabel(issue.severity) }} · {{ dimensionLabel(issue.dimension) }} · {{ sourceLabel(issue.source) }}</span>
        <span v-if="issue.line_start" class="issue-line">Ln {{ issue.line_start }}</span>
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
  gap: 8px;
}

.issue-row {
  text-align: left;
  padding: 10px;
  display: grid;
  gap: 6px;
  cursor: pointer;
}

.issue-row:hover {
  border-color: var(--primary-color);
}

.issue-main {
  display: grid;
  gap: 4px;
}

.issue-meta,
.issue-line,
.empty-state {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.empty-state {
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  margin: 0;
  padding: 14px;
}
</style>
