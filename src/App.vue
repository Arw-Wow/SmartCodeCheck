<template>
  <div class="app-layout">
    <AppHeader />
    <div class="main-content">
      <router-view />
    </div>
    <AppFooter />
    
    <ToastManager />
    <TourOverlay />
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import ToastManager from '@/components/common/ToastManager.vue'
import TourOverlay from '@/components/common/TourOverlay.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  padding-top: 20px;
}
</style>
