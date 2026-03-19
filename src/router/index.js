import { createRouter, createWebHistory } from 'vue-router'
import MyListingsView from '@/views/MyListingsView.vue'
import MyGigsView     from '@/views/MyGigsView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            redirect: '/my-listings' },
    { path: '/my-listings', name: 'my-listings', component: MyListingsView },
    { path: '/my-gigs',     name: 'my-gigs',     component: MyGigsView },
  ],
})
