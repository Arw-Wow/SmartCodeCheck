<template>
  <div class="issue-list">
    <div class="issue-filters">
      <select v-model="localSeverity">
        <option value="">Severity</option>
        <option v-for="item in options.severities" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="localDimension">
        <option value="">Dimension</option>
        <option v-for="item in options.dimensions" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="localSource">
        <option value="">Source</option>
        <option v-for="item in options.sources" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>

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
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { issueFilterOptions } from '@/services/issues'

const props = defineProps({
  issues: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({ severities: [], dimensions: [], sources: [] }) }
})

const emit = defineEmits(['select', 'update:filters'])
const localSeverity = ref('')
const localDimension = ref('')
const localSource = ref('')
const options = computed(() => issueFilterOptions(props.issues))

watch([localSeverity, localDimension, localSource], () => {
  emit('update:filters', {
    severities: localSeverity.value ? [localSeverity.value] : [],
    dimensions: localDimension.value ? [localDimension.value] : [],
    sources: localSource.value ? [localSource.value] : []
  })
})
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

.issue-filters select,
.issue-row {
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  border-radius: 6px;
}

.issue-filters select {
  padding: 8px;
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
.issue-line {
  font-size: 0.78rem;
  color: var(--text-secondary);
}
</style>
