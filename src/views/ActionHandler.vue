<template>
  <div class="auth-page">
    <main class="auth-main">
      <div class="brand-panel" aria-hidden="true">
        <div class="brand-circle">
          <img src="@/assets/logomark.png" alt="" class="brand-logomark" />
        </div>
        <img src="@/assets/logotype.png" alt="NUSOS" class="brand-logotype" />
      </div>

      <div class="form-card">
        <div v-if="status === 'processing'">
          <p class="status-text">Verifying your email…</p>
        </div>
        <div v-else-if="status === 'success'">
          <p class="form-title">Email Verified!</p>
          <p class="status-text">Your email has been verified. Redirecting you to sign in…</p>
        </div>
        <div v-else>
          <p class="form-title">Link Expired</p>
          <p class="status-text">This verification link is invalid or has expired.</p>
          <button class="btn-submit" @click="$router.replace({ name: 'SignIn' })">
            Back to Sign In
          </button>
        </div>
      </div>
    </main>

    <footer class="auth-footer">
      <span>© 2026 NUSOS</span>
      <span>Contact: nusos@gmail.com</span>
    </footer>
  </div>
</template>

<script>
import { applyActionCode, signOut } from 'firebase/auth';
import { auth } from '@/firebase.js';

export default {
  name: 'ActionHandler',

  data() {
    return {
      status: 'processing', // 'processing' | 'success' | 'error'
    };
  },

  async created() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (mode === 'verifyEmail' && oobCode) {
      try {
        await applyActionCode(auth, oobCode);
        // Reload user so emailVerified flag updates
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        this.status = 'success';
        // Sign out so the user lands on a clean sign-in page
        await signOut(auth);
        setTimeout(() => this.$router.replace({ name: 'SignIn' }), 1500);
      } catch {
        this.status = 'error';
      }
    } else if (mode === 'resetPassword' && oobCode) {
      // Hand off to the reset password page with the code
      this.$router.replace({ name: 'ResetPassword', query: { oobCode } });
    } else {
      this.$router.replace({ name: 'SignIn' });
    }
  },
};
</script>

<style scoped>
.auth-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--primary);
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;
  padding: 3rem 2rem;
}

.brand-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  flex-shrink: 0;
}

.brand-circle {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
}

.brand-logomark {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.brand-logotype {
  height: 36px;
  width: auto;
  filter: brightness(0) invert(1);
}

.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.form-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 0.75rem;
}

.status-text {
  font-size: 0.95rem;
  color: var(--gray3);
  line-height: 1.6;
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
