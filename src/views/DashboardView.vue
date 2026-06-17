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
      <article><span>分析次数</span><strong>{{ overview.totalRuns }}</strong></article>
      <article><span>平均分</span><strong>{{ overview.averageScore }}</strong></article>
    </section>
    <section class="grid">
      <article>
        <h3>问题分布</h3>
        <p v-for="row in issueRows" :key="row.severity">{{ severityLabel(row.severity) }}: {{ row.count }}</p>
        <p v-if="!issueRows.length">暂无问题数据</p>
      </article>
      <article>
        <h3>趋势</h3>
        <p v-for="row in trends" :key="row.run_id">{{ row.date }} · {{ row.score }}</p>
        <p v-if="!trends.length">暂无趋势数据</p>
      </article>
    </section>
    <section class="history-panel">
      <div class="panel-head">
        <h3>历史分析</h3>
        <span>{{ runs.length }} runs</span>
      </div>
      <div class="run-list">
        <article v-for="run in runs" :key="run.id" class="run-row">
          <div>
            <strong>#{{ run.id }} · {{ run.language }}</strong>
            <p>{{ formatDate(run.createdAt) }} · {{ run.modelName }} · {{ statusText(run.status) }}</p>
          </div>
          <div class="run-score">{{ run.score }}</div>
          <router-link :to="{ path: '/workspace', query: { runId: run.id } }" class="restore-link">
            {{ run.privacyMode ? '恢复结果' : '恢复现场' }}
          </router-link>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import v2Api from '@/services/v2Api'
import { normalizeOverview, runRows, severityChartRows, trendRows } from '@/services/dashboard'

const overview = ref(normalizeOverview())
const issueRows = ref([])
const trends = ref([])
const runs = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref('')

async function load() {
  loading.value = true
  error.value = ''
  const [overviewRes, issuesRes, trendsRes, runsRes] = await Promise.allSettled([
    v2Api.getStatsOverview(),
    v2Api.getStatsIssues(),
    v2Api.getStatsTrends(),
    v2Api.getRuns()
  ])
  if (overviewRes.status === 'fulfilled') overview.value = normalizeOverview(overviewRes.value.data)
  if (issuesRes.status === 'fulfilled') issueRows.value = severityChartRows(issuesRes.value.data)
  if (trendsRes.status === 'fulfilled') trends.value = trendRows(trendsRes.value.data)
  if (runsRes.status === 'fulfilled') runs.value = runRows(runsRes.value.data)

  const failed = [overviewRes, issuesRes, trendsRes, runsRes].find(item => item.status === 'rejected')
  if (failed) error.value = failed.reason?.response?.data?.detail?.message || failed.reason?.message || '统计数据刷新失败'
  lastUpdated.value = new Date().toISOString()
  loading.value = false
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

function statusText(status) {
  return {
    completed: '已完成',
    running: '运行中',
    queued: '排队中',
    failed: '失败',
    canceled: '已取消'
  }[status] || status
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
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head, .metrics, .grid { display: flex; gap: 12px; }
.page-head { justify-content: space-between; }
.head-actions { display: flex; gap: 10px; align-items: center; }
button { height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 0 10px; }
button:disabled { cursor: wait; opacity: .65; }
article { border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; flex: 1; }
span, p { color: var(--text-secondary); }
strong { display: block; font-size: 2rem; margin-top: 6px; }
.error { color: #ff6b6b; margin: 0; }
.history-panel { border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; }
.panel-head { align-items: center; display: flex; justify-content: space-between; margin-bottom: 10px; }
.run-list { display: grid; gap: 8px; }
.run-row { align-items: center; display: grid; flex: none; gap: 12px; grid-template-columns: minmax(0, 1fr) 80px 96px; }
.run-row strong { font-size: 1rem; margin: 0; }
.run-row p { margin: 4px 0 0; }
.run-score { color: var(--success-color); font-size: 1.35rem; font-weight: 700; text-align: right; }
.restore-link { border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); padding: 8px 10px; text-align: center; }
.restore-link:hover { border-color: var(--primary-color); }
</style>
