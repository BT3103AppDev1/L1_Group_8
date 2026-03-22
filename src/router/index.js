import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from '@/auth.js'
import { getDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/firebase.js'

let _cachedUid = null;
let _cachedOnboardingComplete = null;

onAuthStateChanged(auth, (user) => {
    if (!user || user.uid !== _cachedUid) {
        _cachedUid = null;
        _cachedOnboardingComplete = null;
    }
});

async function getOnboardingComplete(uid) {
    if (_cachedUid === uid && _cachedOnboardingComplete !== null) {
        return _cachedOnboardingComplete;
    }
    const snap = await getDoc(doc(db, 'users', uid));
    const value = snap.exists() ? (snap.data().onboardingComplete ?? false) : false;
    _cachedUid = uid;
    _cachedOnboardingComplete = value;
    return value;
}

export function markOnboardingComplete() {
    _cachedOnboardingComplete = true;
}

const routes = [
    {
        path: '/action',
        name: 'ActionHandler',
        component: () => import('@/views/ActionHandler.vue'),
        meta: { showHeader: false, requiresAuth: false }
    },
    {
        path: '/sign-in',
        name: 'SignIn',
        component: () => import('@/views/SignIn.vue'),
        meta: { showHeader: false, requiresAuth: false }
    },
    {
        path: '/sign-up',
        name: 'SignUp',
        component: () => import('@/views/SignUp.vue'),
        meta: { showHeader: false, requiresAuth: false }
    },
    {
        path: '/email-verification',
        name: 'EmailVerification',
        component: () => import('@/views/EmailVerification.vue'),
        meta: { showHeader: false, requiresAuth: true }
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/ForgotPassword.vue'),
        meta: { showHeader: false, requiresAuth: false }
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/views/ResetPassword.vue'),
        meta: { showHeader: false, requiresAuth: false }
    },
    {
        path: '/consent',
        name: 'ConsentForm',
        component: () => import('@/views/ConsentForm.vue'),
        meta: { showHeader: false, requiresAuth: true }
    },
    {
        path: '/onboarding',
        name: 'Onboarding',
        component: () => import('@/views/Onboarding.vue'),
        meta: { showHeader: false, requiresAuth: true }
    },
    {
        path: '/',
        name: 'Explore',
        component: () => import('@/views/Explore.vue'),
        meta: { showHeader: true, requiresAuth: true }
    },
    {
        path: '/add-listing',
        name: 'AddListing',
        component: () => import('@/views/AddListing.vue'),
        meta: { showHeader: true, requiresAuth: true }
    },
    {
        path: '/my-listings',
        name: 'MyListings',
        component: () => import('@/views/MyListingsView.vue'),
        meta: { showHeader: true, requiresAuth: true }
    },
    {
        path: '/my-gigs',
        name: 'MyGigs',
        component: () => import('@/views/MyGigsView.vue'),
        meta: { showHeader: true, requiresAuth: true }
    },
    {
        path: '/leaderboard',
        name: 'Leaderboard',
        component: () => import('@/views/Leaderboard.vue'),
        meta: { showHeader: true, requiresAuth: true }
    },
    {
        path: '/my-profile',
        name: 'PrivateProfile',
        component: () => import('@/views/Profile.vue'),
        meta: { showHeader: true, requiresAuth: true }
    },
    {
        path: '/users/:uid',
        name: 'PublicProfile',
        component: () => import('@/views/Profile.vue'),
        meta: { showHeader: true, requiresAuth: true }
    },
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

router.beforeEach(async (to) => {
    const user = await getCurrentUser();

    if (!user) {
        if (to.meta.requiresAuth) return { name: 'SignIn' };
        return true;
    }

    if (!user.emailVerified) {
        try { await user.reload(); } catch { /* ignore */ }
        if (!auth.currentUser?.emailVerified) {
            if (to.name === 'EmailVerification' || to.name === 'ActionHandler') return true;
            return { name: 'EmailVerification' };
        }
    }

    const currentUser = auth.currentUser || user;

    try {
        const onboardingComplete = await getOnboardingComplete(currentUser.uid);

        if (!onboardingComplete) {
            if (to.name === 'Onboarding') return true;
            return { name: 'Onboarding' };
        }

        if (!to.meta.requiresAuth || to.name === 'Onboarding') {
            return { name: 'Explore' };
        }
    } catch {
        if (to.name === 'Onboarding') return true;
        return { name: 'Onboarding' };
    }

    return true;
})

export default router
