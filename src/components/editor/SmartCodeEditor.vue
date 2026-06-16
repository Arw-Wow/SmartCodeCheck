<template>
  <div class="smart-code-editor">
    <codemirror
      ref="cm"
      v-model="code"
      :style="{ height: '100%', fontSize: '14px' }"
      :extensions="extensions"
      :tab-size="4"
      :indent-with-tab="true"
      @ready="handleReady"
      @change="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { javascript } from '@codemirror/lang-javascript'
import { go } from '@codemirror/lang-go'
import { issueDecorationsExtension, issueGutter, setIssuesEffect } from './issueDecorations'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'Python' },
  issues: { type: Array, default: () => [] },
  enabledSeverities: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'line-focus'])
const code = ref(props.modelValue)
const view = ref(null)

watch(() => props.modelValue, (value) => {
  if (value !== code.value) code.value = value
})

watch(() => [props.issues, props.enabledSeverities], () => {
  dispatchIssues()
}, { deep: true })

const languageExtension = computed(() => {
  switch (props.language) {
    case 'Python': return python()
    case 'Java': return java()
    case 'C++':
    case 'C': return cpp()
    case 'JavaScript':
    case 'TypeScript': return javascript()
    case 'Go': return go()
    default: return []
  }
})

const extensions = computed(() => [
  oneDark,
  EditorView.lineWrapping,
  languageExtension.value,
  issueDecorationsExtension(),
  issueGutter(props.issues)
])

function handleReady(payload) {
  view.value = payload.view
  dispatchIssues()
}

function dispatchIssues() {
  if (!view.value) return
  view.value.dispatch({
    effects: setIssuesEffect.of({
      issues: props.issues,
      enabledSeverities: props.enabledSeverities
    })
  })
}

function focusLine(lineNumber) {
  if (!view.value || !lineNumber) return
  const line = view.value.state.doc.line(Math.min(lineNumber, view.value.state.doc.lines))
  view.value.dispatch({
    selection: { anchor: line.from },
    effects: EditorView.scrollIntoView(line.from, { y: 'center' })
  })
  emit('line-focus', lineNumber)
}

defineExpose({ focusLine })
</script>

<style scoped>
.smart-code-editor {
  height: 100%;
  min-height: 360px;
}

:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-issue-line) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

:deep(.cm-issue-high),
:deep(.cm-issue-critical) {
  background: rgba(239, 68, 68, 0.18);
}

:deep(.cm-issue-medium) {
  background: rgba(245, 158, 11, 0.16);
}

:deep(.cm-issue-low),
:deep(.cm-issue-info) {
  background: rgba(59, 130, 246, 0.14);
}

:deep(.cm-issue-gutter) {
  display: inline-flex;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: white;
}
</style>
