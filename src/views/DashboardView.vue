<template>
  <main class="v2-page">
    <section class="page-head">
      <div>
        <h2>统计中心</h2>
        <p>分析质量、问题构成和运行画像</p>
      </div>
      <div class="head-actions">
        <span v-if="lastUpdated">上次更新 {{ formatDate(lastUpdated) }}</span>
        <button :disabled="loading" @click="load">{{ loading ? '刷新中...' : '刷新' }}</button>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>

    <section class="metrics">
      <article class="metric-card">
        <span>分析次数</span>
        <strong>{{ overview.totalRuns }}</strong>
        <small>{{ overview.completedRuns }} 次完成 · {{ overview.completionRate }}%</small>
      </article>
      <article class="metric-card">
        <span>平均分</span>
        <strong>{{ overview.averageScore }}</strong>
        <small>最佳 {{ overview.bestScore }} · 最新 {{ overview.latestScore }}</small>
      </article>
      <article class="metric-card">
        <span>问题总数</span>
        <strong>{{ overview.totalIssues }}</strong>
        <small>平均 {{ overview.averageIssuesPerRun }} 个/次</small>
      </article>
      <article class="metric-card">
        <span>高危问题</span>
        <strong>{{ overview.severeIssueCount }}</strong>
        <small>{{ severeRatio }}% 严重占比</small>
      </article>
      <article class="metric-card">
        <span>平均耗时</span>
        <strong>{{ formatDuration(overview.averageDurationMs) }}</strong>
        <small>{{ overview.lastRunAt ? `最近 ${formatDate(overview.lastRunAt)}` : '暂无运行' }}</small>
      </article>
      <article class="metric-card">
        <span>主要语言</span>
        <strong>{{ topLanguage }}</strong>
        <small>{{ topModel }} · {{ privacySummary }}</small>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="chart-panel wide">
        <header>
          <h3>质量趋势</h3>
          <small>得分与问题数量</small>
        </header>
        <div ref="trendChartRef" class="chart chart-large"></div>
      </article>

      <article class="chart-panel">
        <header>
          <h3>严重级别</h3>
          <small>问题风险分布</small>
        </header>
        <div ref="severityChartRef" class="chart"></div>
      </article>

      <article class="chart-panel">
        <header>
          <h3>来源构成</h3>
          <small>静态分析、AI 与验证</small>
        </header>
        <div ref="sourceChartRef" class="chart"></div>
      </article>

      <article class="chart-panel wide">
        <header>
          <h3>维度评级</h3>
          <small>平均得分与问题数量</small>
        </header>
        <div class="split-panel">
          <div ref="dimensionChartRef" class="chart"></div>
          <div class="dimension-list">
            <div v-for="row in dimensionItems" :key="row.dimension" class="dimension-row">
              <span>{{ dimensionLabel(row.dimension) }}</span>
              <strong>{{ row.grade }}</strong>
              <small>{{ row.score }} 分 · {{ row.count }} 个问题</small>
            </div>
            <p v-if="!dimensionItems.length" class="empty-text">暂无维度数据</p>
          </div>
        </div>
      </article>

      <article class="chart-panel">
        <header>
          <h3>语言分布</h3>
          <small>不同语言的分析占比</small>
        </header>
        <div ref="languageChartRef" class="chart"></div>
      </article>

      <article class="chart-panel">
        <header>
          <h3>运行状态</h3>
          <small>完成、失败与其他状态</small>
        </header>
        <div ref="statusChartRef" class="chart"></div>
      </article>

      <article class="chart-panel">
        <header>
          <h3>模型分布</h3>
          <small>云端、默认与本地模型</small>
        </header>
        <div ref="modelChartRef" class="chart"></div>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import v2Api from '@/services/v2Api'
import {
  dimensionRows,
  languageRows,
  modelRows,
  normalizeOverview,
  privacyRows,
  severityChartRows,
  sourceRows,
  statusRows,
  trendRows
} from '@/services/dashboard'

const overview = ref(normalizeOverview())
const issueRows = ref([])
const trends = ref([])
const dimensionItems = ref([])
const sourceItems = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref('')

const trendChartRef = ref(null)
const severityChartRef = ref(null)
const sourceChartRef = ref(null)
const dimensionChartRef = ref(null)
const languageChartRef = ref(null)
const statusChartRef = ref(null)
const modelChartRef = ref(null)
const charts = new Map()

const chartTextColor = '#E6EDF3'
const mutedTextColor = '#8B949E'
const borderColor = '#30363D'
const palette = ['#2F81F7', '#F778BA', '#F59E0B', '#3FB950', '#A371F7', '#56D4DD', '#E5534B', '#EAB308']

const languageItems = computed(() => languageRows(overview.value))
const statusItems = computed(() => statusRows(overview.value))
const modelItems = computed(() => modelRows(overview.value))
const privacyItems = computed(() => privacyRows(overview.value))
const severeRatio = computed(() => {
  if (!overview.value.totalIssues) return 0
  return Math.round((overview.value.severeIssueCount / overview.value.totalIssues) * 100)
})
const topLanguage = computed(() => languageItems.value[0]?.language || '暂无')
const topModel = computed(() => modelItems.value[0]?.model || '默认模型')
const privacySummary = computed(() => {
  const privateCount = privacyItems.value.find(row => row.mode === 'privacy')?.count || 0
  return privateCount ? `${privateCount} 次隐私模式` : '常规存储'
})

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
    await nextTick()
    renderCharts()
  } catch (err) {
    error.value = err?.message || '统计数据刷新失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  window.addEventListener('analysis-runs-updated', load)
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('analysis-runs-updated', load)
  window.removeEventListener('resize', resizeCharts)
  charts.forEach(chart => chart.dispose())
  charts.clear()
})

function renderCharts() {
  setChart('trend', trendChartRef.value, makeTrendOption(trends.value))
  setChart('severity', severityChartRef.value, makeDonutOption(issueRows.value, 'severity', severityLabel))
  setChart('source', sourceChartRef.value, makeDonutOption(sourceItems.value, 'source', sourceLabel))
  setChart('dimension', dimensionChartRef.value, makeDimensionOption(dimensionItems.value))
  setChart('language', languageChartRef.value, makeBarOption(languageItems.value, 'language', value => value))
  setChart('status', statusChartRef.value, makeDonutOption(statusItems.value, 'status', statusLabel))
  setChart('model', modelChartRef.value, makeBarOption(modelItems.value, 'model', value => value))
}

function setChart(key, element, option) {
  if (!element) return
  let chart = charts.get(key)
  if (!chart) {
    chart = echarts.init(element)
    charts.set(key, chart)
  }
  chart.setOption(option, true)
}

function resizeCharts() {
  charts.forEach(chart => chart.resize())
}

function makeTrendOption(rows) {
  if (!rows.length) return emptyOption()
  return {
    color: ['#2F81F7', '#F778BA'],
    tooltip: themedTooltip({ trigger: 'axis' }),
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: mutedTextColor },
      data: ['得分', '问题数']
    },
    grid: { left: 36, right: 24, top: 42, bottom: 34 },
    xAxis: {
      type: 'category',
      data: rows.map(row => row.date),
      axisLabel: { color: mutedTextColor },
      axisLine: { lineStyle: { color: borderColor } }
    },
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { color: mutedTextColor },
        splitLine: { lineStyle: { color: 'rgba(139, 148, 158, .16)' } }
      },
      {
        type: 'value',
        min: 0,
        axisLabel: { color: mutedTextColor },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '得分',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        data: rows.map(row => row.score),
        areaStyle: { color: 'rgba(47, 129, 247, .15)' }
      },
      {
        name: '问题数',
        type: 'bar',
        yAxisIndex: 1,
        barMaxWidth: 22,
        data: rows.map(row => row.issue_count)
      }
    ]
  }
}

function makeDonutOption(rows, key, labelFn) {
  if (!rows.length) return emptyOption()
  return {
    color: palette,
    tooltip: themedTooltip({ trigger: 'item' }),
    legend: {
      type: 'scroll',
      bottom: 0,
      textStyle: { color: mutedTextColor },
      formatter: name => labelFn(name)
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['50%', '43%'],
        minAngle: 6,
        label: {
          color: chartTextColor,
          formatter: item => `${labelFn(item.name)}\n${item.value}`
        },
        labelLine: { lineStyle: { color: mutedTextColor } },
        data: rows.map(row => ({ name: row[key], value: row.count }))
      }
    ]
  }
}

function makeBarOption(rows, key, labelFn) {
  if (!rows.length) return emptyOption()
  return {
    color: ['#56D4DD'],
    tooltip: themedTooltip({ trigger: 'axis' }),
    grid: { left: 8, right: 18, top: 18, bottom: 6, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: mutedTextColor },
      splitLine: { lineStyle: { color: 'rgba(139, 148, 158, .16)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map(row => labelFn(row[key])),
      axisLabel: { color: chartTextColor },
      axisLine: { lineStyle: { color: borderColor } }
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 18,
        data: rows.map(row => row.count),
        label: { show: true, position: 'right', color: chartTextColor }
      }
    ]
  }
}

function makeDimensionOption(rows) {
  if (!rows.length) return emptyOption()
  return {
    color: ['#3FB950', '#F59E0B'],
    tooltip: themedTooltip({ trigger: 'item' }),
    radar: {
      radius: '62%',
      indicator: rows.map(row => ({ name: dimensionLabel(row.dimension), max: 100 })),
      axisName: { color: mutedTextColor },
      axisLine: { lineStyle: { color: 'rgba(139, 148, 158, .22)' } },
      splitLine: { lineStyle: { color: 'rgba(139, 148, 158, .18)' } },
      splitArea: { show: false }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            name: '维度得分',
            value: rows.map(row => row.score),
            areaStyle: { color: 'rgba(63, 185, 80, .18)' }
          }
        ]
      }
    ]
  }
}

function emptyOption() {
  return {
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: { text: '暂无数据', fill: mutedTextColor, fontSize: 14 }
    }
  }
}

function themedTooltip(extra = {}) {
  return {
    backgroundColor: 'rgba(22, 27, 34, .96)',
    borderColor,
    textStyle: { color: chartTextColor },
    ...extra
  }
}

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

function statusLabel(status) {
  return {
    completed: '完成',
    failed: '失败',
    canceled: '取消',
    running: '运行中',
    queued: '排队中'
  }[status] || status
}
</script>

<style scoped>
.v2-page {
  padding: 18px;
  display: grid;
  gap: 16px;
}

.page-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.page-head h2 {
  margin: 0;
}

.page-head p {
  margin: 6px 0 0;
  color: var(--text-secondary);
}

.head-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--text-secondary);
}

button {
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,.06);
  color: var(--text-primary);
  padding: 0 12px;
}

button:disabled {
  cursor: wait;
  opacity: .65;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.metric-card,
.chart-panel {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: rgba(22, 27, 34, .74);
  min-width: 0;
}

.metric-card {
  padding: 14px;
}

.metric-card span,
.metric-card small,
.chart-panel small,
.empty-text {
  color: var(--text-secondary);
}

.metric-card strong {
  display: block;
  min-height: 38px;
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 1.85rem;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.metric-card small {
  display: block;
  margin-top: 6px;
  font-size: .78rem;
  line-height: 1.4;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chart-panel {
  padding: 14px;
}

.chart-panel.wide {
  grid-column: 1 / -1;
}

.chart-panel header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 10px;
}

.chart-panel h3 {
  margin: 0;
  font-size: 1rem;
}

.chart {
  width: 100%;
  height: 310px;
  min-width: 0;
}

.chart-large {
  height: 360px;
}

.split-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(220px, .8fr);
  gap: 12px;
  align-items: stretch;
}

.dimension-list {
  display: grid;
  gap: 8px;
  align-content: start;
  min-width: 0;
}

.dimension-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 4px 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(139, 148, 158, .18);
  border-radius: 6px;
}

.dimension-row span {
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dimension-row strong {
  color: #3FB950;
  text-align: right;
}

.dimension-row small {
  grid-column: 1 / -1;
}

.error {
  color: #ff6b6b;
  margin: 0;
}

@media (max-width: 1180px) {
  .metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .metrics,
  .dashboard-grid,
  .split-panel {
    grid-template-columns: 1fr;
  }

  .page-head {
    flex-direction: column;
  }

  .head-actions {
    flex-wrap: wrap;
  }

  .chart,
  .chart-large {
    height: 300px;
  }
}

@media (max-width: 640px) {
  .metrics {
    grid-template-columns: 1fr;
  }

  .chart-panel header {
    display: block;
  }
}
</style>
