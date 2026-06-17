import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { TOUR_DEFINITION_MAP, TOUR_DEFINITIONS, TOUR_ROUTE_MAP, TOUR_VERSION } from '@/tutorials/definitions'

export const useTutorialStore = defineStore(
  'tutorials',
  () => {
    const progress = ref({})
    const activeTourKey = ref('')
    const currentStepIndex = ref(0)
    const pendingReplayKey = ref('')
    const hydratedUserId = ref(null)

    const definitions = TOUR_DEFINITIONS
    const activeDefinition = computed(() => TOUR_DEFINITION_MAP[activeTourKey.value] || null)
    const currentStep = computed(() => activeDefinition.value?.steps[currentStepIndex.value] || null)
    const isActive = computed(() => Boolean(activeDefinition.value && currentStep.value))
    const completedCount = computed(() => definitions.filter(definition => isCompleted(definition.key)).length)

    function hydrateFromUser(force = false) {
      const authStore = useAuthStore()
      if (!authStore.user?.id) return
      if (!force && hydratedUserId.value === authStore.user.id) return
      progress.value = { ...(authStore.user.tutorial_progress || {}) }
      hydratedUserId.value = authStore.user.id
    }

    function isCompleted(key) {
      const record = progress.value?.[key]
      return Boolean(record?.completed && record.version === TOUR_VERSION)
    }

    function routeDefinition(routeName) {
      return TOUR_ROUTE_MAP[routeName] || null
    }

    function startAutoForRoute(routeName) {
      hydrateFromUser()
      if (consumeReplayForRoute(routeName)) return
      const definition = routeDefinition(routeName)
      if (!definition || isCompleted(definition.key)) return
      start(definition.key)
    }

    function requestReplay(key) {
      pendingReplayKey.value = key
    }

    function consumeReplayForRoute(routeName) {
      if (!pendingReplayKey.value) return false
      const definition = TOUR_DEFINITION_MAP[pendingReplayKey.value]
      if (!definition || definition.routeName !== routeName) return false
      start(definition.key)
      pendingReplayKey.value = ''
      return true
    }

    function start(key) {
      if (!TOUR_DEFINITION_MAP[key]) return
      activeTourKey.value = key
      currentStepIndex.value = 0
    }

    function stop() {
      activeTourKey.value = ''
      currentStepIndex.value = 0
    }

    function previousStep() {
      currentStepIndex.value = Math.max(0, currentStepIndex.value - 1)
    }

    function nextStep() {
      if (!activeDefinition.value) return
      if (currentStepIndex.value >= activeDefinition.value.steps.length - 1) {
        completeCurrent()
        return
      }
      currentStepIndex.value += 1
    }

    function skipMissingStep() {
      if (!activeDefinition.value) return
      if (currentStepIndex.value >= activeDefinition.value.steps.length - 1) {
        completeCurrent()
        return
      }
      currentStepIndex.value += 1
    }

    function skipCurrent() {
      completeCurrent(true)
    }

    function completeCurrent(skipped = false) {
      if (!activeTourKey.value) return
      const nextProgress = {
        ...progress.value,
        [activeTourKey.value]: {
          completed: true,
          skipped,
          version: TOUR_VERSION,
          completedAt: new Date().toISOString()
        }
      }
      progress.value = nextProgress
      syncProgress(nextProgress)
      stop()
    }

    function resetAll() {
      progress.value = {}
      syncProgress({})
    }

    async function syncProgress(nextProgress) {
      const authStore = useAuthStore()
      if (authStore.user) {
        authStore.user = { ...authStore.user, tutorial_progress: nextProgress }
      }
      if (!authStore.token) return
      try {
        const response = await api.updateTutorialProgress({ tutorial_progress: nextProgress })
        authStore.user = response.data
      } catch (error) {
        console.error('Failed to sync tutorial progress', error)
      }
    }

    return {
      progress,
      definitions,
      activeTourKey,
      currentStepIndex,
      activeDefinition,
      currentStep,
      isActive,
      completedCount,
      hydrateFromUser,
      isCompleted,
      routeDefinition,
      startAutoForRoute,
      requestReplay,
      start,
      stop,
      previousStep,
      nextStep,
      skipMissingStep,
      skipCurrent,
      completeCurrent,
      resetAll
    }
  },
  {
    persist: {
      key: 'tutorial-store',
      storage: localStorage,
      paths: ['progress']
    }
  }
)
