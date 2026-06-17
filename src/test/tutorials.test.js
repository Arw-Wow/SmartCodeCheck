import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import { useTutorialStore } from '@/stores/tutorials'
import { TOUR_DEFINITIONS } from '@/tutorials/definitions'

describe('tutorial system', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('defines unique tutorial keys for existing routes', () => {
    const keys = TOUR_DEFINITIONS.map(definition => definition.key)
    const routeNames = new Set(router.getRoutes().map(route => route.name))

    expect(new Set(keys).size).toBe(keys.length)
    for (const definition of TOUR_DEFINITIONS) {
      expect(routeNames.has(definition.routeName)).toBe(true)
      expect(definition.steps.length).toBeGreaterThan(0)
      expect(definition.steps.every(step => step.target && step.title && step.body)).toBe(true)
    }
  })

  it('starts, completes, and resets route tutorials', () => {
    const store = useTutorialStore()

    store.startAutoForRoute('Workspace')
    expect(store.activeTourKey).toBe('workspace')
    expect(store.currentStep.title).toBeTruthy()

    store.completeCurrent()
    expect(store.isCompleted('workspace')).toBe(true)
    expect(store.isActive).toBe(false)

    store.startAutoForRoute('Workspace')
    expect(store.isActive).toBe(false)

    store.resetAll()
    expect(store.isCompleted('workspace')).toBe(false)
  })
})
