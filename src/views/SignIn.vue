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

      <!-- Right form card -->
      <div class="form-card">

        <!-- Tab toggle -->
        <div class="auth-tabs" role="tablist">
          <button
            role="tab"
            :aria-selected="mode === 'signin'"
            :class="['auth-tab', { active: mode === 'signin' }]"
            @click="switchMode('signin')"
          >Sign In</button>
          <button
            role="tab"
            :aria-selected="mode === 'signup'"
            :class="['auth-tab', { active: mode === 'signup' }]"
            @click="switchMode('signup')"
          >Sign Up</button>
        </div>

        <!-- ── SIGN IN FORM ── -->
        <form v-if="mode === 'signin'" @submit.prevent="handleSignIn" novalidate>
          <h1 class="form-title">Sign In</h1>

          <div class="form-group">
            <label for="si-email" class="form-label">NUS Email</label>
            <input
              id="si-email"
              v-model.trim="signIn.email"
              type="email"
              class="form-input"
              :class="{ 'input-error': signIn.errors.email }"
              placeholder="studentnumber@u.nus.edu"
              autocomplete="email"
              aria-describedby="si-email-msg"
            />
            <p v-if="signIn.errors.email" id="si-email-msg" class="field-msg error-msg" role="alert">
              {{ signIn.errors.email }}
              <button v-if="signIn.promptSignUp" class="inline-link" @click="switchMode('signup')">Sign Up</button>
            </p>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="si-password" class="form-label">Password</label>
              <RouterLink to="/forgot-password" class="forgot-link">Forgot password?</RouterLink>
            </div>
            <input
              id="si-password"
              v-model="signIn.password"
              type="password"
              class="form-input"
              :class="{ 'input-error': signIn.errors.password }"
              placeholder="••••••••••••"
              autocomplete="current-password"
              aria-describedby="si-password-msg"
            />
            <p v-if="signIn.errors.password" id="si-password-msg" class="field-msg error-msg" role="alert">
              {{ signIn.errors.password }}
            </p>
          </div>

          <p v-if="signIn.generalError" class="general-error" role="alert">{{ signIn.generalError }}</p>

          <button type="submit" class="btn-submit" :disabled="signIn.loading">
            <span v-if="signIn.loading">Signing in…</span>
            <span v-else>Sign In</span>
          </button>

          <p class="switch-link">
            Don't have an account?
            <button class="inline-link" @click="switchMode('signup')">Sign Up</button>
          </p>
        </form>

        <!-- ── SIGN UP FORM ── -->
        <form v-else @submit.prevent="handleSignUp" novalidate>
          <h1 class="form-title">Sign Up</h1>

          <div class="form-group">
            <label for="su-email" class="form-label">NUS Email</label>
            <input
              id="su-email"
              v-model.trim="signUp.email"
              type="email"
              class="form-input"
              :class="{ 'input-error': signUp.errors.email, 'input-valid': signUp.touched.email && !signUp.errors.email && signUp.email }"
              placeholder="studentnumber@u.nus.edu"
              autocomplete="email"
              @blur="signUp.touched.email = true"
              aria-describedby="su-email-msg"
            />
            <p v-if="signUp.errors.email" id="su-email-msg" class="field-msg error-msg" role="alert">{{ signUp.errors.email }}</p>
            <p v-else-if="signUp.touched.email && signUp.email" class="field-msg valid-msg">Valid</p>
          </div>

          <div class="form-group">
            <label for="su-password" class="form-label">Password</label>
            <input
              id="su-password"
              v-model="signUp.password"
              type="password"
              class="form-input"
              :class="{ 'input-error': signUp.errors.password, 'input-valid': signUp.touched.password && !signUp.errors.password && signUp.password }"
              placeholder="••••••••••••"
              autocomplete="new-password"
              @blur="signUp.touched.password = true"
              aria-describedby="su-password-msg"
            />
            <p v-if="signUp.errors.password" id="su-password-msg" class="field-msg error-msg" role="alert">{{ signUp.errors.password }}</p>
            <p v-else-if="signUp.touched.password && signUp.password" class="field-msg valid-msg">Valid</p>
          </div>

          <div class="form-group">
            <label for="su-confirm" class="form-label">Confirm Password</label>
            <input
              id="su-confirm"
              v-model="signUp.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'input-error': signUp.errors.confirmPassword, 'input-valid': signUp.touched.confirmPassword && !signUp.errors.confirmPassword && signUp.confirmPassword }"
              placeholder="••••••••••••"
              autocomplete="new-password"
              @blur="signUp.touched.confirmPassword = true"
              aria-describedby="su-confirm-msg"
            />
            <p v-if="signUp.errors.confirmPassword" id="su-confirm-msg" class="field-msg error-msg" role="alert">{{ signUp.errors.confirmPassword }}</p>
            <p v-else-if="signUp.touched.confirmPassword && signUp.confirmPassword" class="field-msg valid-msg">Valid</p>
          </div>

          <p v-if="signUp.generalError" class="general-error" role="alert">{{ signUp.generalError }}</p>

          <button type="submit" class="btn-submit" :disabled="signUp.loading">
            <span v-if="signUp.loading">Creating account…</span>
            <span v-else>Create Account</span>
          </button>

          <p class="switch-link">
            Already have an account?
            <button class="inline-link" @click="switchMode('signin')">Sign In</button>
          </p>
        </form>

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
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase.js';

const NUS_EMAIL_DOMAINS = ['@u.nus.edu', '@nus.edu.sg'];

export default {
  name: 'SignIn',

  data() {
    return {
      mode: 'signin',

      signIn: {
        email: '',
        password: '',
        errors: { email: '', password: '' },
        generalError: '',
        promptSignUp: false,
        loading: false,
      },

      signUp: {
        email: '',
        password: '',
        confirmPassword: '',
        errors: { email: '', password: '', confirmPassword: '' },
        touched: { email: false, password: false, confirmPassword: false },
        generalError: '',
        loading: false,
      },
    };
  },

  methods: {
    switchMode(newMode) {
      this.mode = newMode;
      this.signIn.errors = { email: '', password: '' };
      this.signIn.generalError = '';
      this.signIn.promptSignUp = false;
      this.signUp.errors = { email: '', password: '', confirmPassword: '' };
      this.signUp.generalError = '';
      this.signUp.touched = { email: false, password: false, confirmPassword: false };
    },

    async handleSignIn() {
      this.signIn.errors = { email: '', password: '' };
      this.signIn.generalError = '';
      this.signIn.promptSignUp = false;

      const { email, password } = this.signIn;
      if (!email) { this.signIn.errors.email = 'Email is required.'; return; }
      if (!password) { this.signIn.errors.password = 'Password is required.'; return; }

      this.signIn.loading = true;
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        try { await credential.user.reload(); } catch { /* ignore */ }
        this.$router.push('/');
      } catch (err) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          this.signIn.generalError = 'Invalid email or password. Please try again.';
        } else if (err.code === 'auth/user-not-found') {
          this.signIn.errors.email = 'No account found for this email.';
          this.signIn.promptSignUp = true;
        } else if (err.code === 'auth/invalid-email') {
          this.signIn.errors.email = 'Invalid email address.';
        } else if (err.code === 'auth/too-many-requests') {
          this.signIn.generalError = 'Too many failed attempts. Please try again later.';
        } else {
          this.signIn.generalError = 'Sign in failed. Please check your credentials and try again.';
        }
      } finally {
        this.signIn.loading = false;
      }
    },

    validateSignUp() {
      this.signUp.errors = { email: '', password: '', confirmPassword: '' };
      this.signUp.generalError = '';
      this.signUp.touched = { email: true, password: true, confirmPassword: true };
      let valid = true;

      const email = this.signUp.email;
      if (!email) {
        this.signUp.errors.email = 'Email is required.';
        valid = false;
      } else if (!NUS_EMAIL_DOMAINS.some(d => email.endsWith(d))) {
        this.signUp.errors.email = 'Email must end with @u.nus.edu (students) or @nus.edu.sg (staff).';
        valid = false;
      }

      const pw = this.signUp.password;
      if (!pw) {
        this.signUp.errors.password = 'Password is required.';
        valid = false;
      } else if (pw !== pw.trim()) {
        this.signUp.errors.password = 'Password must not start or end with spaces.';
        valid = false;
      } else if (pw.length < 12) {
        this.signUp.errors.password = 'Password must be at least 12 characters.';
        valid = false;
      }

      if (!this.signUp.confirmPassword) {
        this.signUp.errors.confirmPassword = 'Please confirm your password.';
        valid = false;
      } else if (this.signUp.confirmPassword !== this.signUp.password) {
        this.signUp.errors.confirmPassword = 'Passwords do not match.';
        valid = false;
      }

      return valid;
    },

    async handleSignUp() {
      if (!this.validateSignUp()) return;
      this.signUp.loading = true;

      try {
        const credential = await createUserWithEmailAndPassword(auth, this.signUp.email, this.signUp.password);
        const user = credential.user;

        try {
          await sendEmailVerification(user, { url: window.location.origin + '/sign-in' });
        } catch { /* ignore */ }

        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            createdAt: serverTimestamp(),
            onboardingComplete: false,
            consentGiven: false,
          });
        } catch { /* ignore */ }

        this.$router.push({ name: 'EmailVerification' });

      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          this.signUp.errors.email = 'This email is already registered. Please Sign In instead.';
          this.signUp.touched.email = true;
        } else {
          this.signUp.generalError = 'Registration failed. Please try again.';
        }
      } finally {
        this.signUp.loading = false;
      }
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

.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  padding: 2rem 2rem 1.75rem;
  width: 100%;
  max-width: 400px;
}

.auth-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.25rem;
}

.auth-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--gray4);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}

.auth-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.auth-tab:hover:not(.active) {
  color: var(--gray2);
}

.form-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 1.25rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--black2);
  margin-bottom: 0.3rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.3rem;
}

.label-row .form-label {
  margin-bottom: 0;
}

.forgot-link {
  font-size: 0.8rem;
  color: var(--secondary);
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  font-size: 0.9375rem;
  font-family: inherit;
  border: 1.5px solid #d0d5dd;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fff;
  color: var(--black2);
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 61, 124, 0.12);
}

.form-input.input-error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.08);
}

.form-input.input-valid {
  border-color: var(--success);
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.08);
}

.field-msg {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  line-height: 1.4;
}

.error-msg { color: var(--error); }

.valid-msg { color: var(--success); }

.general-error {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.22);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: var(--error);
  margin-bottom: 0.75rem;
}

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
  margin-top: 0.5rem;
  transition: background 0.15s, opacity 0.12s;
}

.btn-submit:hover { background: var(--secondary-hover); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.switch-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--gray3);
}

.inline-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: inherit;
  color: var(--secondary);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.auth-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

@media (max-width: 700px) {
  .auth-main {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .brand-circle {
    width: 140px;
    height: 140px;
  }

  .brand-logomark {
    width: 95px;
    height: 95px;
  }

  .form-card {
    padding: 1.5rem 1.25rem;
  }
}
</style>
