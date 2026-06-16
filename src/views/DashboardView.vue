<template>
  <main class="v2-page">
    <section class="page-head">
      <h2>统计中心</h2>
      <button @click="load">刷新</button>
    </section>
    <section class="metrics">
      <article><span>分析次数</span><strong>{{ overview.totalRuns }}</strong></article>
      <article><span>平均分</span><strong>{{ overview.averageScore }}</strong></article>
    </section>
    <section class="grid">
      <article>
        <h3>问题分布</h3>
        <p v-for="row in issueRows" :key="row.severity">{{ row.severity }}: {{ row.count }}</p>
      </article>
      <article>
        <h3>趋势</h3>
        <p v-for="row in trends" :key="row.run_id">{{ row.date }} · {{ row.score }}</p>
      </article>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import v2Api from '@/services/v2Api'
import { normalizeOverview, severityChartRows, trendRows } from '@/services/dashboard'

const overview = ref(normalizeOverview())
const issueRows = ref([])
const trends = ref([])

async function load() {
  const [overviewRes, issuesRes, trendsRes] = await Promise.all([
    v2Api.getStatsOverview(),
    v2Api.getStatsIssues(),
    v2Api.getStatsTrends()
  ])
  overview.value = normalizeOverview(overviewRes.data)
  issueRows.value = severityChartRows(issuesRes.data)
  trends.value = trendRows(trendsRes.data)
}

onMounted(load)
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head, .metrics, .grid { display: flex; gap: 12px; }
.page-head { justify-content: space-between; }
button { height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 0 10px; }
article { border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; flex: 1; }
span, p { color: var(--text-secondary); }
strong { display: block; font-size: 2rem; margin-top: 6px; }
</style>
