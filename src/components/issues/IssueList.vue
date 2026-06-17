<template>
  <div class="issue-list">
    <div class="issue-filters">
      <details class="filter-menu">
        <summary>Severity: {{ labelFor(filters.severities) }}</summary>
        <label><input type="checkbox" :checked="!filters.severities.length" @change="clearFilter('severities')" /> All</label>
        <label v-for="item in options.severities" :key="item">
          <input type="checkbox" :checked="filters.severities.includes(item)" @change="toggleFilter('severities', item)" />
          {{ item }}
        </label>
      </details>
      <details class="filter-menu">
        <summary>Dimension: {{ labelFor(filters.dimensions) }}</summary>
        <label><input type="checkbox" :checked="!filters.dimensions.length" @change="clearFilter('dimensions')" /> All</label>
        <label v-for="item in options.dimensions" :key="item">
          <input type="checkbox" :checked="filters.dimensions.includes(item)" @change="toggleFilter('dimensions', item)" />
          {{ item }}
        </label>
      </details>
      <details class="filter-menu">
        <summary>Source: {{ labelFor(filters.sources) }}</summary>
        <label><input type="checkbox" :checked="!filters.sources.length" @change="clearFilter('sources')" /> All</label>
        <label v-for="item in options.sources" :key="item">
          <input type="checkbox" :checked="filters.sources.includes(item)" @change="toggleFilter('sources', item)" />
          {{ item }}
        </label>
      </details>
    </div>

    <p v-if="!issues.length" class="empty-state">No issues match the current filters.</p>

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
        <span class="issue-meta">{{ issue.severity }} · {{ issue.dimension }} · {{ issue.source }}</span>
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

function labelFor(values = []) {
  if (!values.length) return 'All'
  if (values.length === 1) return values[0]
  return `${values.length} selected`
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
</script>

<style scoped>
.issue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
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
}

.filter-menu summary {
  cursor: pointer;
  list-style: none;
  overflow: hidden;
  padding: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-menu summary::-webkit-details-marker {
  display: none;
}

.filter-menu[open] {
  background: #161b22;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  z-index: 5;
}

.filter-menu label {
  align-items: center;
  color: var(--text-secondary);
  display: flex;
  gap: 6px;
  padding: 7px 9px;
}

.filter-menu label:hover {
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
