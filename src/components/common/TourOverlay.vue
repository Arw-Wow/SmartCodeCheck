<template>
  <Teleport to="body">
    <div v-if="tutorial.isActive" class="tour-layer" @keydown.esc="tutorial.skipCurrent" tabindex="-1">
      <div class="tour-highlight" :style="highlightStyle"></div>
      <section ref="panelRef" class="tour-panel" :style="panelStyle" role="dialog" aria-modal="true">
        <div class="tour-kicker">
          <span>{{ tutorial.activeDefinition.title }}</span>
          <b>{{ tutorial.currentStepIndex + 1 }} / {{ tutorial.activeDefinition.steps.length }}</b>
        </div>
        <h3>{{ tutorial.currentStep.title }}</h3>
        <p>{{ tutorial.currentStep.body }}</p>
        <div class="tour-actions">
          <button type="button" class="ghost" @click="tutorial.skipCurrent">跳过教程</button>
          <button type="button" :disabled="tutorial.currentStepIndex === 0" @click="tutorial.previousStep">
            上一步
          </button>
          <button type="button" class="primary" @click="tutorial.nextStep">
            {{ tutorial.currentStepIndex >= tutorial.activeDefinition.steps.length - 1 ? '完成' : '下一步' }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTutorialStore } from '@/stores/tutorials'

const route = useRoute()
const authStore = useAuthStore()
const tutorial = useTutorialStore()
const panelRef = ref(null)
const targetRect = ref(null)
let autoStartTimer = null
let measureTimer = null

const highlightStyle = computed(() => {
  const rect = targetRect.value
  if (!rect) return { opacity: 0 }
  return {
    top: `${rect.top - 6}px`,
    left: `${rect.left - 6}px`,
    width: `${rect.width + 12}px`,
    height: `${rect.height + 12}px`
  }
})

const panelStyle = computed(() => {
  const rect = targetRect.value
  if (!rect) return {}
  const margin = 16
  const gap = 14
  const panelWidth = Math.min(panelRef.value?.offsetWidth || 360, window.innerWidth - margin * 2)
  const panelHeight = panelRef.value?.offsetHeight || 210
  let left = rect.left
  let top = rect.bottom + gap

  if (top + panelHeight + margin > window.innerHeight) {
    top = Math.max(margin, rect.top - panelHeight - gap)
  }
  if (left + panelWidth + margin > window.innerWidth) {
    left = window.innerWidth - panelWidth - margin
  }
  left = Math.max(margin, left)

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${panelWidth}px`
  }
})

watch(
  () => [route.name, authStore.user?.id],
  () => scheduleAutoStart(),
  { immediate: true }
)

watch(
  () => [tutorial.activeTourKey, tutorial.currentStepIndex],
  () => {
    if (!tutorial.isActive) return
    nextTick(() => locateTarget())
  }
)

onMounted(() => {
  window.addEventListener('resize', measureTarget)
  window.addEventListener('scroll', measureTarget, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureTarget)
  window.removeEventListener('scroll', measureTarget, true)
  clearTimeout(autoStartTimer)
  clearTimeout(measureTimer)
})

function scheduleAutoStart() {
  clearTimeout(autoStartTimer)
  autoStartTimer = setTimeout(() => {
    tutorial.startAutoForRoute(route.name)
  }, 350)
}

function locateTarget() {
  clearTimeout(measureTimer)
  const targetId = tutorial.currentStep?.target
  if (!targetId) return
  const target = document.querySelector(`[data-tour-id="${targetId}"]`)
  if (!target) {
    measureTimer = setTimeout(() => tutorial.skipMissingStep(), 80)
    return
  }
  target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  measureTimer = setTimeout(() => {
    targetRect.value = target.getBoundingClientRect()
  }, 180)
}

function measureTarget() {
  const targetId = tutorial.currentStep?.target
  if (!targetId) return
  const target = document.querySelector(`[data-tour-id="${targetId}"]`)
  if (!target) return
  targetRect.value = target.getBoundingClientRect()
}
</script>

<style scoped>
.tour-layer {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
}

.tour-highlight {
  position: fixed;
  z-index: 2001;
  border: 2px solid #60a5fa;
  border-radius: 10px;
  box-shadow: 0 0 0 9999px rgba(3, 7, 18, 0.72), 0 0 24px rgba(96, 165, 250, 0.7);
  transition: top 0.18s ease, left 0.18s ease, width 0.18s ease, height 0.18s ease;
}

.tour-panel {
  position: fixed;
  z-index: 2002;
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(96, 165, 250, 0.35);
  border-radius: 8px;
  background: #111827;
  color: #f8fafc;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  pointer-events: auto;
}

.tour-kicker,
.tour-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tour-kicker {
  justify-content: space-between;
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 700;
}

.tour-panel h3,
.tour-panel p {
  margin: 0;
}

.tour-panel h3 {
  font-size: 1.02rem;
}

.tour-panel p {
  color: #cbd5e1;
  font-size: 0.9rem;
  line-height: 1.65;
}

.tour-actions {
  justify-content: flex-end;
  margin-top: 4px;
}

.tour-actions button {
  height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
  font-weight: 700;
}

.tour-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.tour-actions .ghost {
  margin-right: auto;
  color: #cbd5e1;
}

.tour-actions .primary {
  border-color: #2563eb;
  background: #2563eb;
  color: white;
}

@media (max-width: 560px) {
  .tour-panel {
    width: calc(100vw - 32px) !important;
  }

  .tour-actions {
    flex-wrap: wrap;
  }

  .tour-actions .ghost {
    flex-basis: 100%;
  }
}
</style>
