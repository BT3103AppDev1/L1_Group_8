<template>
    <PublicPageLayout>
      <div v-if="status === 'processing'">
        <p class="status-text">Processing…</p>
      </div>
      <div v-else class="action-container">
        <p class="form-title">Link Expired</p>
        <p class="status-text">This verification link is invalid or has expired.</p>
        <button class="btn btn-secondary" @click="$router.replace({ name: 'AuthPage' })">
          Back to Sign In
        </button>
      </div>
  </PublicPageLayout>
</template>

<script>
import { applyActionCode, signOut } from 'firebase/auth';
import { auth } from '@/firebase.js';
import { db } from '@/firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

export default {
  name: 'ActionHandler',

  components: {
    PublicPageLayout
  },

  data() {
    return {
      status: 'processing', // 'processing' | 'error'
    };
  },

  async created() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (mode === 'verifyEmail' && oobCode) {
      try {
        await applyActionCode(auth, oobCode);
        if (auth.currentUser) {
          // Update Firestore so App.vue redirect logic picks up email_verified: true
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), { email_verified: true });
            await signOut(auth);
          } catch { /* ignore */ }
        }
      } catch {
        this.status = 'error';
      }
    } else if (mode === 'resetPassword' && oobCode) {
      // Hand off to the reset password page with the code
      this.$router.replace({ name: 'ResetPassword', query: { oobCode } });
    } else {
      this.$router.replace({ name: 'AuthPage' });
    }
  },
};
</script>

<style scoped>
.action-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--secondary);
}

.status-text {
  font-size: 1rem;
  color: var(--gray3);
  line-height: 1.6;
}

.btn {
  padding: 1rem 0;
  width: 100%;
}

.btn-submit {
  margin-top: 1.25rem;
  width: 100%;
  padding: 0.7rem 1rem;
  background: var(--secondary);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit:hover { background: var(--secondary-hover); }

.auth-footer {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

@media (max-width: 700px) {
  .auth-main { flex-direction: column; gap: 2rem; padding: 2rem 1rem; }
  .brand-circle { width: 140px; height: 140px; }
  .brand-logomark { width: 95px; height: 95px; }
}
</style>
