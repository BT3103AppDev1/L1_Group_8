<template>
  <div id="app">
    <TheNavbar />
    <TheNavbar />
    <main class="main-content">
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>

<script>
import TheFooter from '@/components/TheFooter.vue'
import TheNavbar from '@/components/TheNavbar.vue' 
import CreateListing from './components/CreateListing.vue';

export default {
  name: 'App',  components: { TheFooter, TheNavbar, CreateListing },
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
}
</style>