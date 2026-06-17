<template>
  <main class="v2-page">
    <section class="page-head">
      <h2>统计中心</h2>
      <div class="head-actions">
        <span v-if="lastUpdated">上次更新 {{ formatDate(lastUpdated) }}</span>
        <button :disabled="loading" @click="load">{{ loading ? '刷新中...' : '刷新' }}</button>
      </div>
    </section>
    <p v-if="error" class="error">{{ error }}</p>
    <section class="metrics">
      <article><span>分析次数</span><strong>{{ overview.totalRuns }}</strong><small>{{ overview.completedRuns }} 次完成</small></article>
      <article><span>平均分</span><strong>{{ overview.averageScore }}</strong><small>最佳 {{ overview.bestScore }} · 最新 {{ overview.latestScore }}</small></article>
      <article><span>问题总数</span><strong>{{ overview.totalIssues }}</strong><small>平均耗时 {{ formatDuration(overview.averageDurationMs) }}</small></article>
      <article><span>完成率</span><strong>{{ overview.completionRate }}%</strong><small>{{ overview.lastRunAt ? `最近 ${formatDate(overview.lastRunAt)}` : '暂无运行' }}</small></article>
    </section>
    <section class="grid">
      <article>
        <h3>问题分布</h3>
        <p v-for="row in issueRows" :key="row.severity">{{ severityLabel(row.severity) }}: {{ row.count }}</p>
        <p v-if="!issueRows.length">暂无问题数据</p>
      </article>
      <article>
        <h3>维度评级</h3>
        <p v-for="row in dimensionItems" :key="row.dimension">
          {{ dimensionLabel(row.dimension) }}: {{ row.grade }} · {{ row.score }} 分 · {{ row.count }} 个问题
        </p>
        <p v-if="!dimensionItems.length">暂无维度数据</p>
      </article>
      <article>
        <h3>来源构成</h3>
        <p v-for="row in sourceItems" :key="row.source">{{ sourceLabel(row.source) }}: {{ row.count }}</p>
        <p v-if="!sourceItems.length">暂无来源数据</p>
      </article>
      <article>
        <h3>趋势</h3>
        <p v-for="row in trends" :key="row.run_id">{{ row.date }} · {{ row.score }} 分 · {{ row.issue_count || 0 }} 个问题</p>
        <p v-if="!trends.length">暂无趋势数据</p>
      </article>
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import v2Api from '@/services/v2Api'
import { dimensionRows, normalizeOverview, severityChartRows, sourceRows, trendRows } from '@/services/dashboard'

const overview = ref(normalizeOverview())
const issueRows = ref([])
const trends = ref([])
const dimensionItems = ref([])
const sourceItems = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [overviewRes, issuesRes, trendsRes] = await Promise.allSettled([
      v2Api.getStatsOverview(),
      v2Api.getStatsIssues(),
      v2Api.getStatsTrends()
    ])
    if (overviewRes.status === 'fulfilled') overview.value = normalizeOverview(overviewRes.value.data)
    if (issuesRes.status === 'fulfilled') {
      issueRows.value = severityChartRows(issuesRes.value.data)
      dimensionItems.value = dimensionRows(issuesRes.value.data)
      sourceItems.value = sourceRows(issuesRes.value.data)
    }
    if (trendsRes.status === 'fulfilled') trends.value = trendRows(trendsRes.value.data)

    const failed = [overviewRes, issuesRes, trendsRes].find(item => item.status === 'rejected')
    if (failed) error.value = failed.reason?.response?.data?.detail?.message || failed.reason?.message || '统计数据刷新失败'
    lastUpdated.value = new Date().toISOString()
  } catch (err) {
    error.value = err?.message || '统计数据刷新失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  window.addEventListener('analysis-runs-updated', load)
})

onBeforeUnmount(() => {
  window.removeEventListener('analysis-runs-updated', load)
})

function formatDate(value) {
  if (!value) return '未知时间'
  return new Date(value).toLocaleString()
}

function formatDuration(ms) {
  if (!ms) return '0 ms'
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

function dimensionLabel(dimension) {
  return {
    correctness: '正确性',
    security: '安全性',
    maintainability: '可维护性',
    robustness: '鲁棒性',
    performance: '性能',
    readability: '可读性',
    style: '风格'
  }[dimension] || dimension
}

function severityLabel(severity) {
  return {
    critical: '致命',
    high: '高',
    medium: '中',
    low: '低',
    info: '提示'
  }[severity] || severity
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
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head { display: flex; gap: 12px; }
.page-head { justify-content: space-between; }
.head-actions { display: flex; gap: 10px; align-items: center; }
button { height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 0 10px; }
button:disabled { cursor: wait; opacity: .65; }
.metrics, .grid { display: grid; gap: 12px; }
.metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
article { border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; min-width: 0; }
span, p, small { color: var(--text-secondary); }
strong { display: block; font-size: 2rem; margin-top: 6px; color: var(--text-primary); }
small { display: block; margin-top: 6px; font-size: .78rem; }
.error { color: #ff6b6b; margin: 0; }
@media (max-width: 980px) {
  .metrics, .grid { grid-template-columns: 1fr; }
  .page-head { align-items: flex-start; flex-direction: column; }
}
</style>
