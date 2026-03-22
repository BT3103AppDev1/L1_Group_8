import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from '@/auth.js'
import SignIn from '@/views/SignIn.vue'
import SignUp from '@/views/SignUp.vue'
import EmailVerification from '@/views/EmailVerification.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import ConsentForm from '@/views/ConsentForm.vue'
import Onboarding from '@/views/Onboarding.vue'
import Explore from '@/views/Explore.vue'
import AddListing from '@/views/AddListing.vue'
import MyListingsView from '@/views/MyListingsView.vue'
import MyGigsView     from '@/views/MyGigsView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            redirect: '/my-listings' },
    { path: '/my-listings', name: 'my-listings', component: MyListingsView },
    { path: '/my-gigs',     name: 'my-gigs',     component: MyGigsView },
    { path: '/explore',     name: 'explore',     component: ExploreView },
    { path: '/add-listing', name: 'add-listing', component: AddListing}
  ],
})
