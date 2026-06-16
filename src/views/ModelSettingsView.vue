<template>
  <main class="v2-page">
    <section class="page-head">
      <h2>模型配置</h2>
      <button @click="create">保存模型</button>
    </section>
    <section class="form-row">
      <input v-model="draft.name" placeholder="模型名称" />
      <input v-model="draft.base_url" placeholder="Base URL" />
      <select v-model="draft.provider">
        <option>local</option>
        <option>cloud</option>
      </select>
    </section>
    <section class="list">
      <article v-for="model in models" :key="model.id" class="row">
        <strong>{{ model.name }}</strong>
        <span>{{ model.provider }} · {{ model.is_enabled ? 'enabled' : 'disabled' }}</span>
        <button @click="check(model.id)">检查</button>
      </article>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import v2Api from '@/services/v2Api'

const models = ref([])
const draft = reactive({ name: 'local-model', provider: 'local', base_url: 'http://localhost:11434/v1' })

async function load() {
  models.value = (await v2Api.getModels()).data
}

async function create() {
  await v2Api.createModel({ ...draft, is_enabled: true })
  await load()
}

async function check(id) {
  await v2Api.checkModel(id)
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
.row span { color: var(--text-secondary); }
</style>
