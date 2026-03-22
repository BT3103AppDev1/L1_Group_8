<template>
  <div class="auth-page">

    <!-- ── Main content ── -->
    <main class="auth-main">

      <!-- Left branding panel -->
      <div class="brand-panel" aria-hidden="true">
        <div class="brand-circle">
          <img src="@/assets/logomark.png" alt="" class="brand-logomark" />
        </div>
        <img src="@/assets/logotype.png" alt="NUSOS" class="brand-logotype" />
      </div>

      <!-- Right card -->
      <div class="form-card">

        <!-- Verified state -->
        <template v-if="verified">
          <h1 class="form-title">Email Verified!</h1>
          <p class="info-text">
            Your email has been verified successfully.<br />
            You can now sign in to your account.
          </p>
          <button class="btn-submit" @click="goToSignIn">Go to Sign In</button>
        </template>

        <!-- Awaiting verification state -->
        <template v-else>
          <h1 class="form-title">Verify Your Email</h1>

          <p class="info-text">
            We have sent a verification link to<br />
            <strong class="email-highlight">{{ userEmail }}</strong>
          </p>

          <p class="info-text secondary">
            Please click the link to complete the verification process.
            If you don't see the email, try checking your spam folder.
          </p>

          <!-- Feedback message -->
          <p
            v-if="resendMessage"
            :class="['feedback-msg', resendError ? 'feedback-error' : 'feedback-success']"
            role="alert"
          >{{ resendMessage }}</p>

          <!-- ACFR2A.2 — resend email -->
          <button
            class="btn-submit"
            @click="resendEmail"
            :disabled="resending || resendCooldown > 0"
          >
            <span v-if="resending">Sending…</span>
            <span v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
            <span v-else>Resend Email</span>
          </button>

          <p class="switch-link">
            <button class="inline-link" @click="signOut">Back to Sign Up</button>
          </p>
        </template>

      </div>
    </main>

    <!-- Footer -->
    <footer class="auth-footer">
      <span>© 2026 NUSOS</span>
      <span>Contact: nusos@gmail.com</span>
    </footer>

  </div>
</template>

<script>
import { sendEmailVerification, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase.js';

const RESEND_COOLDOWN_SECONDS = 60;

export default {
  name: 'EmailVerification',

  data() {
    return {
      userEmail: '',
      verified: false,
      resendMessage: '',
      resendError: false,
      resending: false,
      resendCooldown: 0,
      _cooldownTimer: null,
      _pollTimer: null,
    };
  },

  created() {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        this.userEmail = user.email;
        this.startPolling();
      } else {
        this.$router.replace({ name: 'SignIn' });
      }
    });
  },

  beforeUnmount() {
    if (this._cooldownTimer) clearInterval(this._cooldownTimer);
    if (this._pollTimer) clearInterval(this._pollTimer);
  },

  methods: {
    async resendEmail() {
      const user = auth.currentUser;
      if (!user) return;

      this.resending = true;
      this.resendMessage = '';
      this.resendError = false;

      try {
        await sendEmailVerification(user, { url: window.location.origin + '/sign-in' });
        this.resendMessage = 'Verification email resent! Please check your inbox.';
        this.startCooldown();
      } catch (err) {
        this.resendError = true;
        this.resendMessage = err.code === 'auth/too-many-requests'
          ? 'Too many requests. Please wait before trying again.'
          : 'Failed to resend. Please try again.';
      } finally {
        this.resending = false;
      }
    },

    startCooldown() {
      this.resendCooldown = RESEND_COOLDOWN_SECONDS;
      this._cooldownTimer = setInterval(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          clearInterval(this._cooldownTimer);
          this._cooldownTimer = null;
        }
      }, 1000);
    },

    async goToSignIn() {
      await firebaseSignOut(auth).catch(() => {});
      this.$router.replace({ name: 'SignIn' });
    },

    async signOut() {
      await firebaseSignOut(auth);
      this.$router.replace({ name: 'SignIn' });
    },

    startPolling() {
      this._pollTimer = setInterval(async () => {
        const user = auth.currentUser;
        if (!user) {
          clearInterval(this._pollTimer);
          this._pollTimer = null;
          return;
        }
        try {
          await user.reload();
          if (auth.currentUser?.emailVerified) {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
            this.verified = true;
            await firebaseSignOut(auth);
            this.$router.replace({ name: 'SignIn' });
          }
        } catch {
          // ignore transient errors
        }
      }, 3000);
    },
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

/* ── Left branding panel ── */
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
  object-fit: contain;
  filter: brightness(0) invert(1);
}

/* ── Right card ── */
.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  padding: 2rem 2rem 1.75rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.form-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 1rem;
}

.info-text {
  font-size: 0.9rem;
  color: var(--gray3);
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.info-text.secondary {
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.email-highlight {
  color: var(--black2);
  font-weight: 700;
}

/* ── Feedback ── */
.feedback-msg {
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  text-align: left;
}

.feedback-success {
  background: rgba(40, 167, 69, 0.08);
  border: 1px solid rgba(40, 167, 69, 0.25);
  color: var(--success);
}

.feedback-error {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.25);
  color: var(--error);
}

/* ── Buttons ── */
.btn-submit {
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
  margin-bottom: 0.75rem;
  transition: background 0.15s, opacity 0.12s;
}

.btn-submit:hover { background: var(--secondary-hover); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Back link ── */
.switch-link {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--gray3);
}

.inline-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: inherit;
  color: var(--gray3);
  text-decoration: underline;
  cursor: pointer;
}

.inline-link:hover { color: var(--gray2); }

/* ── Footer ── */
.auth-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

/* ── Responsive ── */
@media (max-width: 700px) {
  .auth-main {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .brand-circle { width: 140px; height: 140px; }
  .brand-logomark { width: 95px; height: 95px; }
  .form-card { padding: 1.5rem 1.25rem; }
}
</style>
