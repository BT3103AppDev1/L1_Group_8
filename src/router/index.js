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
import SignIn from '@/views/SignIn.vue'
import SignUp from '@/views/SignUp.vue'
import EmailVerification from '@/views/EmailVerification.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import ConsentForm from '@/views/ConsentForm.vue'
import Onboarding from '@/views/Onboarding.vue'
import Explore from '@/views/ExploreView.vue'
import AddListing from '@/views/AddListing.vue'
import MyListingsView from '@/views/MyListingsView.vue'
import MyGigsView from '@/views/MyGigsView.vue'
import Leaderboard from '@/views/Leaderboard.vue'
import Profile from '@/views/Profile.vue'

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
