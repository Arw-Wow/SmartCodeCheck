<template>
  <main class="v2-page">
    <section class="page-head">
      <div>
        <h2>规则集</h2>
        <p>把课程评分标准、团队代码规范或安全红线整理成可复用规则，在工作台分析时选择它，系统会把规则一并交给分析流程，并在命中时生成对应问题。</p>
      </div>
      <router-link to="/workspace" class="secondary-link">去工作台使用</router-link>
    </section>

    <section class="usage-panel">
      <article>
        <strong>1. 建规则</strong>
        <span>每条规则描述一个明确要求，例如“禁止使用 eval”或“异常必须记录上下文”。</span>
      </article>
      <article>
        <strong>2. 选维度</strong>
        <span>维度决定问题归类；严重级别会影响评分扣分。</span>
      </article>
      <article>
        <strong>3. 在工作台启用</strong>
        <span>分析前从“规则集”下拉框选择，未选择时只执行默认检测。</span>
      </article>
    </section>

    <section class="form-panel">
      <div class="form-row">
        <input v-model="draft.name" placeholder="规则集名称，例如：课程作业规范" />
        <input v-model="draft.ruleTitle" placeholder="规则标题，例如：禁止 eval" />
      </div>
      <textarea v-model="draft.content" placeholder="规则内容：写清楚判定标准、风险原因或修复要求。"></textarea>
      <div class="form-row">
        <select v-model="draft.dimension">
          <option value="security">安全性</option>
          <option value="correctness">正确性</option>
          <option value="maintainability">可维护性</option>
          <option value="robustness">健壮性</option>
        </select>
        <select v-model="draft.severity">
          <option value="critical">致命</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
          <option value="info">提示</option>
        </select>
        <button :disabled="loading" @click="createDefault">{{ loading ? '创建中...' : '新建规则集' }}</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section class="list">
      <article v-for="item in ruleSets" :key="item.id" class="row">
        <div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.rules?.length || 0 }} 条规则</span>
          <small v-if="item.description">{{ item.description }}</small>
        </div>
        <button @click="remove(item.id)">删除</button>
      </article>
      <p v-if="!ruleSets.length" class="empty">还没有规则集。先创建一个，再到工作台选择使用。</p>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import v2Api from '@/services/v2Api'

const ruleSets = ref([])
const loading = ref(false)
const error = ref('')
const draft = reactive({
  name: '课程作业规范',
  ruleTitle: '禁止 eval',
  content: '不得直接执行用户输入，避免任意代码执行风险。',
  dimension: 'security',
  severity: 'high'
})

async function load() {
  ruleSets.value = (await v2Api.getRuleSets()).data
}

async function createDefault() {
  if (!draft.name.trim() || !draft.ruleTitle.trim() || !draft.content.trim()) {
    error.value = '请填写规则集名称、规则标题和规则内容'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await v2Api.createRuleSet({
      name: draft.name.trim(),
      description: '从规则集页面创建',
      visibility: 'private',
      rules: [{
        title: draft.ruleTitle.trim(),
        content: draft.content.trim(),
        dimension: draft.dimension,
        severity: draft.severity,
        weight: 100
      }]
    })
    await load()
  } catch (err) {
    error.value = err.response?.data?.detail?.message || err.message
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  if (!confirm('确定删除这个规则集吗？')) return
  await v2Api.deleteRuleSet(id)
  await load()
}

onMounted(load)
</script>

<style scoped>
.v2-page { padding: 18px; display: grid; gap: 14px; }
.page-head { display: flex; gap: 18px; align-items: flex-start; justify-content: space-between; }
.page-head h2 { margin: 0 0 8px; }
.page-head p { margin: 0; max-width: 780px; color: var(--text-secondary); line-height: 1.7; }
.secondary-link,
input,
select,
button {
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,.06);
  color: var(--text-primary);
  padding: 0 10px;
}
.secondary-link { display: inline-flex; align-items: center; white-space: nowrap; }
.usage-panel { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.usage-panel article,
.form-panel,
.row {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: rgba(255,255,255,.035);
}
.usage-panel article { display: grid; gap: 6px; padding: 14px; }
.usage-panel span,
.row span,
.row small,
.empty { color: var(--text-secondary); font-size: .86rem; line-height: 1.5; }
.form-panel { display: grid; gap: 10px; padding: 14px; }
.form-row { display: flex; gap: 10px; align-items: center; }
.form-row input { flex: 1; min-width: 0; }
textarea {
  min-height: 92px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,.06);
  color: var(--text-primary);
  padding: 10px;
  resize: vertical;
}
.list { display: grid; gap: 8px; }
.row { display: flex; gap: 10px; align-items: center; justify-content: space-between; padding: 12px; }
.row div { display: grid; gap: 4px; }
.error { color: #ff6b6b; margin: 0; }
.empty { margin: 6px 0; }
@media (max-width: 860px) {
  .page-head,
  .form-row,
  .row { align-items: stretch; flex-direction: column; }
  .usage-panel { grid-template-columns: 1fr; }
}
</style>
