<template>
  <div id="app">
    <TheHeader v-if="$route.meta.showHeader" :profilePicUrl="profilePicUrl"/>

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
import TheHeader from './components/TheHeader.vue';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import '@/assets/main.css';

export default {
  name: 'App',

  components: {
    TheFooter,
    TheHeader,
  },

  data() {
    return {
      profilePicUrl: null,
      _authUnsubscribe: null,
      _firestoreUnsubscribe: null,
    }
  },

  created() {
    this._authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (this._firestoreUnsubscribe) {
        this._firestoreUnsubscribe();
        this._firestoreUnsubscribe = null;
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);

        this._firestoreUnsubscribe = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            this.profilePicUrl = data.profilePicUrl || null;

            const route = this.$route.path;
            if (!data.email_verified) {
              if (route !== '/email-verification') this.$router.replace('/email-verification');
            } else if (!data.granted_consent) {
              if (route !== '/consent') this.$router.replace('/consent');
            } else if (!data.onboarded) {
              if (route !== '/onboarding') this.$router.replace('/onboarding');
            } else if (route === '/email-verification' || route === '/consent' || route === '/onboarding') {
              this.$router.replace('/');
            }
          } else {
            this.profilePicUrl = null;
          }
        });
      } else {
        this.profilePicUrl = null;
      }
    });
  },

  beforeUnmount() {
    if (this._authUnsubscribe) this._authUnsubscribe();
    if (this._firestoreUnsubscribe) this._firestoreUnsubscribe();
  },
}
</script>

<style scoped>
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
