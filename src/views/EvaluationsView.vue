<template>
  <main class="v2-page">
    <section class="page-head">
      <h2>批量评测</h2>
      <button @click="submit">运行 JSONL</button>
    </section>
    <textarea v-model="jsonl"></textarea>
    <section class="list">
      <article v-for="task in tasks" :key="task.id" class="row">
        <strong>{{ task.name }}</strong>
        <span>{{ task.status }} · {{ task.progress }}%</span>
      </article>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import v2Api from '@/services/v2Api'

const jsonl = ref('{"id":"sample-1","language":"Python","prompt":"","code":"print(1)"}')
const tasks = ref([])

async function load() {
  tasks.value = (await v2Api.getEvaluations()).data
}

async function submit() {
  await v2Api.createEvaluation({ name: `batch-${Date.now()}`, jsonl: jsonl.value })
  await load()
}

onMounted(load)
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head, .row { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
textarea { min-height: 180px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 10px; font-family: monospace; }
button { height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 0 10px; }
.list { display: grid; gap: 8px; }
.row { padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; }
</style>
