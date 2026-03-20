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
import { doc } from 'firebase/firestore';

export default {
  name: 'App',

  components: {
    TheFooter,
    TheHeader,
  },

  data() {
    return {
      profilePicUrl: null,

      // store unsubscibe functions
      _authUnsubscribe: null,
      _firestoreUnsubscribe: null,
    }
  },

  created() {
    // Listen for auth state changes
    this._authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      // Unsubscribe from previous Firestore listener if it exists
      if (this._firestoreUnsubscribe) {
        this._firestoreUnsubscribe();
        this._firestoreUnsubscribe = null;
      }

      if (user) {
        // User is signed in

        /* // TODO: remove comment when auth is available
        const userDocRef = doc(db, 'users', user.uid); */

        // Simulate user ID for testing without auth
        const userDocRef = doc(db, "users", "mockUserId");

        this._firestoreUnsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists) {
            const data = doc.data();
            this.profilePicUrl = data.profilePicUrl || null;
          }
        });
      } else {
        // User is signed out
        this.profilePicUrl = null;
      }
    });
  },

  beforeUnmount() {
    // Clean up listeners
    if (this._authUnsubscribe) {
      this._authUnsubscribe();
    }
    if (this._firestoreUnsubscribe) {
      this._firestoreUnsubscribe();
    }
  },
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 97vh;
}
.main-content {
  margin-top: 4.5rem; /* height of header */
  flex: 1;
}

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
