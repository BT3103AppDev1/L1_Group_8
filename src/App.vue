<template>
  <div id="app">
    <template v-if="!authReady">
      <div class="loading-container">
        <VueSpinner size="50" color="var(--secondary)" aria-label="Loading authentication status..." />
      </div>
    </template>

    <template v-else>
      <TheHeader v-if="$route.meta.showHeader" :profilePicUrl="profilePicUrl"/>

      <main :class="['main-content', {'main-content-with-header': $route.meta.showHeader}]">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath"/>
          </transition>
        </RouterView>
      </main>

      <TheFooter />
    </template>
  </div>
</template>

<script>
import TheFooter from '@/components/TheFooter.vue';
import TheHeader from './components/TheHeader.vue';
import { onAuthUserChanged } from './auth.js';
import { db } from '@/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import '@/assets/main.css';
import { VueSpinner } from 'vue3-spinners';

export default {
  name: 'App',

  components: {
    TheFooter,
    TheHeader,
    VueSpinner,
  },

  data() {
    return {
      profilePicUrl: null,
      user: null,
      _firestoreUnsubscribe: null,
      authReady: false,
    }
  },

  created() {
    // Listen for auth state changes
    onAuthUserChanged((user) => {
      this.authReady = true;
      this.user = user;
      // Unsubscribe from previous Firestore listener if it exists
      if (this._firestoreUnsubscribe) {
        this._firestoreUnsubscribe();
        this._firestoreUnsubscribe = null;
      }

      if (user) {
        // user is signed in

        // TODO: remove comment when auth is available
        const userDocRef = doc(db, "users", user.uid); 

        /* // Simulate user ID for testing without auth
        const userDocRef = doc(db, "users", "mockUserId"); */

        this._firestoreUnsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            this.profilePicUrl = data.profile_pic_url || null;

            const route = this.$route.path;
            if (!data.email_verified) {
              if (route !== '/email-verification') this.$router.replace('/email-verification');
            } else if (!data.granted_consent) {
              if (route !== '/consent') this.$router.replace('/consent');
            } else if (!data.onboarded) {
              if (route !== '/onboarding') this.$router.replace('/onboarding');
            } else if (route === '/email-verification' || route === '/consent' || route === '/onboarding' || route === '/sign-in' || route === '/sign-up') {
              this.$router.replace('/');
            }
          } else {
            this.profilePicUrl = null;
          }
        });
      } else {
        this.profilePicUrl = null;
        if (this.$route.meta.requiresAuth) {
          this.$router.replace('/sign-in');
        }
      }
    });
  },

  beforeUnmount() {
    // Clean up listener
    if (this._firestoreUnsubscribe) {
      this._firestoreUnsubscribe();
    }
  },
}
</script>

<style scoped>
.main-content-with-header {
  margin-top: 4.5rem; /* height of header */
  padding: 1rem max(2rem, 7vw);
  flex: 1;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>