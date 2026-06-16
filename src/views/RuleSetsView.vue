<template>
  <main class="v2-page">
    <section class="page-head">
      <h2>规则集</h2>
      <button @click="createDefault">新建规则集</button>
    </section>

    <section class="form-row">
      <input v-model="draft.name" placeholder="规则集名称" />
      <input v-model="draft.ruleTitle" placeholder="规则标题" />
      <select v-model="draft.dimension">
        <option>security</option>
        <option>maintainability</option>
        <option>robustness</option>
      </select>
      <select v-model="draft.severity">
        <option>high</option>
        <option>medium</option>
        <option>low</option>
      </select>
    </section>

    <section class="list">
      <article v-for="item in ruleSets" :key="item.id" class="row">
        <div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.rules?.length || 0 }} rules</span>
        </div>
        <button @click="remove(item.id)">删除</button>
      </article>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import v2Api from '@/services/v2Api'

const ruleSets = ref([])
const draft = reactive({ name: 'Course rubric', ruleTitle: 'No eval', dimension: 'security', severity: 'high' })

async function load() {
  ruleSets.value = (await v2Api.getRuleSets()).data
}

async function createDefault() {
  await v2Api.createRuleSet({
    name: draft.name,
    description: '',
    visibility: 'private',
    rules: [{ title: draft.ruleTitle, content: draft.ruleTitle, dimension: draft.dimension, severity: draft.severity, weight: 100 }]
  })
  await load()
}

async function remove(id) {
  await v2Api.deleteRuleSet(id)
  await load()
}

onMounted(load)
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head, .form-row, .row { display: flex; gap: 10px; align-items: center; }
.page-head { justify-content: space-between; }
input, select, button { height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,.06); color: var(--text-primary); padding: 0 10px; }
.list { display: grid; gap: 8px; }
.row { justify-content: space-between; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; }
.row div { display: grid; gap: 4px; }
.row span { color: var(--text-secondary); font-size: .85rem; }
</style>
