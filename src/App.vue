<template>
  <div id="app">
    <TheNavbar />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="$router.fullPath"/>
        </transition>
      </RouterView>
    </main>
    <TheFooter />
  </div>
</template>

<script>
import TheFooter from '@/components/TheFooter.vue'
import TheNavbar from '@/components/TheNavbar.vue'

export default {
  name: 'App',
  components: { TheFooter, TheNavbar },
}
</script>

<style scoped>
/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from{
  opacity: 0;
  transform: translateY(5px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>