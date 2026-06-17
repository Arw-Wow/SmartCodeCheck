<template>
  <div class="code-editor-wrapper">
    <div class="editor-header">
      <div class="window-controls">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
      </div>
      
      <div class="tabs-container">
        <button 
          class="editor-tab" 
          :class="{ active: mode === 'paste' }"
          @click="mode = 'paste'"
        >
          编辑器
        </button>
        <button 
          class="editor-tab" 
          :class="{ active: mode === 'upload' }"
          @click="mode = 'upload'"
        >
          文件上传
        </button>
      </div>
      
      <div class="lang-indicator">
        {{ language }}
      </div>
    </div>

    <div class="editor-body-area">
      <div v-show="mode === 'paste'" class="cm-layout-fixer">
        <codemirror
          v-model="code"
          placeholder="// 在此处粘贴代码，或使用上传功能..."
          :style="{ height: '100%', fontSize: '14px' }"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="4"
          :extensions="extensions"
          @change="handleChange"
        />
      </div>

      <div v-show="mode === 'upload'" class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
        <div class="upload-box-modern">
          <h4 class="upload-title">拖拽文件到这里</h4>
          <p class="upload-subtitle">支持 .py, .java, .cpp, .js 等源码文件</p>
          
          <label class="btn-select-file">
            选择文件
            <input type="file" ref="fileInput" @change="handleFileSelect" accept=".py,.java,.cpp,.js,.ts,.go,.c,.h" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { javascript } from '@codemirror/lang-javascript'
import { go } from '@codemirror/lang-go'

const props = defineProps({
  modelValue: String,
  language: { type: String, default: 'Python' }
})
const emit = defineEmits(['update:modelValue'])

const mode = ref('paste')
const code = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (newVal !== code.value) {
    code.value = newVal
  }
})

const handleChange = (newVal) => {
  emit('update:modelValue', newVal)
}

const extensions = computed(() => {
  const exts = [oneDark, EditorView.lineWrapping]
  switch (props.language) {
    case 'Python': exts.push(python()); break
    case 'Java': exts.push(java()); break
    case 'C++': case 'C': exts.push(cpp()); break
    case 'JavaScript': case 'TypeScript': exts.push(javascript()); break
    case 'Go': exts.push(go()); break
    default: break
  }
  return exts
})

// --- 文件上传逻辑 ---
const processFile = (file) => {
  const validExts = ['.py', '.java', '.cpp', '.js', '.ts', '.go', '.c', '.h', '.txt', '.md']
  const isExtValid = validExts.some(ext => file.name.toLowerCase().endsWith(ext))
  const maxSize = 1 * 1024 * 1024 
  
  if (!isExtValid) return alert(`不支持的文件格式: ${file.name}`)
  if (file.size > maxSize) return alert(`文件过大`)

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    code.value = content
    emit('update:modelValue', content)
    mode.value = 'paste'
  }
  reader.readAsText(file)
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) processFile(file)
  event.target.value = '' 
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}
</script>

<style scoped>
/* 容器 */
.code-editor-wrapper {
  background: #0d0d0d;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* 头部 */
.editor-header {
  flex: 0 0 36px;
  background: #1e1e1e; /* VS Code 风格深色头 */
  border-bottom: 1px solid #2b2b2b;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 16px;
}

/* 窗口控制点 (装饰用) */
.window-controls {
  display: flex; gap: 6px; margin-right: 4px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.red { background: #ff5f56; }
.yellow { background: #ffbd2e; }
.green { background: #27c93f; }

/* 标签页 */
.tabs-container {
  display: flex; height: 100%; align-items: flex-end;
}
.editor-tab {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  height: 100%;
  padding: 0 16px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s;
  border-top: 2px solid transparent; /* 顶部高亮条预留 */
}
.editor-tab:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
.editor-tab.active {
  color: #fff;
  background: #0d0d0d; /* 与编辑器背景融为一体 */
  border-top-color: var(--primary-color);
}
/* 语言指示器 */
.lang-indicator {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-family: monospace;
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 主体区域 */
.editor-body-area {
  flex: 1; position: relative; min-height: 0; width: 100%;
  background: #0d0d0d;
}

/* CodeMirror 修正 */
.cm-layout-fixer {
  position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: 100%;
}
:deep(.cm-editor) { height: 100%; outline: none; background: #0d0d0d !important; }
:deep(.cm-scroller) {
  font-family: 'Fira Code', 'Consolas', monospace;
  line-height: 1.6;
}
:deep(.cm-gutters) {
  background-color: #0d0d0d;
  border-right: 1px solid #2b2b2b;
  color: #4a4a4a;
}

/* 拖拽上传美化 */
.upload-area {
  height: 100%;
  display: flex; justify-content: center; align-items: center;
  background: radial-gradient(circle at center, rgba(30,30,30,1) 0%, rgba(13,13,13,1) 100%);
}
.upload-box-modern {
  text-align: center;
  border: 2px dashed rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 16px;
  transition: all 0.3s;
  background: rgba(255,255,255,0.01);
}
.upload-area:hover .upload-box-modern {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
  transform: scale(1.02);
}
.upload-title { margin: 0 0 8px 0; font-weight: 600; color: var(--text-primary); }
.upload-subtitle { margin: 0 0 20px 0; font-size: 0.8rem; color: var(--text-secondary); }

.btn-select-file {
  display: inline-block;
  background: var(--primary-color); color: white;
  padding: 10px 24px; border-radius: 8px; cursor: pointer;
  font-size: 0.9rem; font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.btn-select-file:hover { filter: brightness(1.1); transform: translateY(-2px); }
.btn-select-file input { display: none; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
