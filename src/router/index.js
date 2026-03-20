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
import MyGigsView from '@/views/MyGigsView.vue'
import Leaderboard from '@/views/Leaderboard.vue'
import Profile from '@/views/Profile.vue'

const routes = [
    {
        path: '/sign-in',
        name: 'SignIn',
        component: SignIn,
        meta: {
            showHeader: false,
            requiresAuth: false
        }
    },
    {
        path: '/sign-up',
        name: 'SignUp',
        component: SignUp,
        meta: {
            showHeader: false,
            requiresAuth: false
        }
    },
    {
        path: '/email-verification',
        name: 'EmailVerification',
        component: EmailVerification,
        meta: {
            showHeader: false,
            requiresAuth: true
        }
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: ForgotPassword,
        meta: {
            showHeader: false,
            requiresAuth: false
        }
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: {
            showHeader: false,
            requiresAuth: false
        }
    },
    {
        path: '/consent',
        name: 'ConsentForm',
        component: ConsentForm,
        meta: {
            showHeader: false,
            requiresAuth: true
        }
    },
    {
        path: '/onboarding',
        name: 'Onboarding',
        component: Onboarding,
        meta: {
            showHeader: false,
            requiresAuth: true
        }
    },
    {
        path: '/',
        name: 'Explore',
        component: Explore,
        meta: {
            showHeader: true,
            requiresAuth: true
        }
    },
    {   
        path: '/add-listing',
        name: 'AddListing',
        component: AddListing,
        meta: {
            showHeader: true,
            requiresAuth: true
        }   
    },
    {
        path: '/my-listings',
        name: 'MyListings',
        component: MyListingsView,
        meta: {
            showHeader: true,
            requiresAuth: true
        }
    },
    {
        path: '/my-gigs',
        name: 'MyGigs',
        component: MyGigsView,
        meta: {
            showHeader: true,
            requiresAuth: true
        }   
    },
    {
        path: '/leaderboard',
        name: 'Leaderboard',
        component: Leaderboard,
        meta: {
            showHeader: true,
            requiresAuth: true
        }
    },
    {
        path: '/my-profile',
        name: 'PrivateProfile',
        component: Profile,
        meta: {
            showHeader: true,
            requiresAuth: true
        }
    },
    {
        path: '/users/:uid',
        name: 'PublicProfile',
        component: Profile,
        meta: {
            showHeader: true,
            requiresAuth: true
        }
    },
    // Catch-all route for 404 Not Found
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})  

// Navigation guard to check for authentication on routes that require it
router.beforeEach(async (to) => {
    /* // TODO: remove comment before deplyment
    const user = await getCurrentUser();
    */
    
    /* // Stimulate not logged in
    const user = false;
    */

    // Simulate logged in
    const user = true;

    if (to.meta.requiresAuth && !user) {
        return '/sign-in';
    } else if (!to.meta.requiresAuth && user) {
        // TODO: Confirm behaviour for logged-in users clicking password reset link
        return '/'; 
    }
    
    return true; // otherwise, allow navigation to proceed
})

export default router
