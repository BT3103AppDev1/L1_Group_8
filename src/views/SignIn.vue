<template>
    <PublicPageLayout>
        <div class="auth-tabs" role="tablist">
            <button role="tab" :aria-selected="mode === 'signin'"
                :class="['auth-tab', { 'auth-tab--active': mode === 'signin' }]"
                @click="switchMode('signin')">Sign In</button>
            <button role="tab" :aria-selected="mode === 'signup'"
                :class="['auth-tab', { 'auth-tab--active': mode === 'signup' }]"
                @click="switchMode('signup')">Sign Up</button>
        </div>

        <!-- Sign In Form -->
        <form v-if="mode === 'signin'" @submit.prevent="handleSignIn" novalidate class="auth-form">
            <h3 class="form-title">Sign In</h3>

            <div class="input-container">
                <label for="si-email" class="input-label">NUS Email</label>
                <input
                    id="si-email"
                    v-model.trim="signIn.email"
                    type="email"
                    :class="['input-field', { 'input-field--invalid': signIn.errors.email }]"
                    placeholder="studentnumber@u.nus.edu"
                    autocomplete="email"
                />
                <p v-if="signIn.errors.email" class="input-info input-info--invalid">{{ signIn.errors.email }}</p>
            </div>

            <div class="input-container">
                <div class="label-row">
                    <label for="si-password" class="input-label">Password</label>
                    <RouterLink to="/forgot-password" class="forgot-link">Forgot password?</RouterLink>
                </div>
                <input
                    id="si-password"
                    v-model="signIn.password"
                    type="password"
                    :class="['input-field', { 'input-field--invalid': signIn.errors.password }]"
                    placeholder="••••••••••••"
                    autocomplete="current-password"
                />
                <p v-if="signIn.errors.password" class="input-info input-info--invalid">{{ signIn.errors.password }}</p>
            </div>

            <div v-if="signIn.generalError" class="general-error">
                {{ signIn.generalError }}
                <span v-if="signIn.promptSignUp">
                    New here?
                    <button type="button" class="text-link" @click="switchMode('signup')">Sign Up</button>
                </span>
            </div>

            <button type="submit" class="btn btn-secondary full-btn" :disabled="signIn.loading">
                <span v-if="signIn.loading">Signing in…</span>
                <span v-else>Sign In</span>
            </button>

            <p class="switch-text">
                Don't have an account?
                <button type="button" class="text-link" @click="switchMode('signup')">Sign Up</button>
            </p>
        </form>

        <!-- Sign Up Form -->
        <form v-else @submit.prevent="handleSignUp" novalidate class="auth-form">
            <h3 class="form-title">Sign Up</h3>

            <div class="input-container">
                <label for="su-email" class="input-label">NUS Email</label>
                <input
                    id="su-email"
                    v-model.trim="signUp.email"
                    type="email"
                    :class="['input-field', {
                        'input-field--invalid': signUp.errors.email,
                        'input-field--valid': signUp.touched.email && !signUp.errors.email && signUp.email
                    }]"
                    placeholder="studentnumber@u.nus.edu"
                    autocomplete="email"
                    @blur="signUp.touched.email = true"
                />
                <p v-if="signUp.errors.email" class="input-info input-info--invalid">{{ signUp.errors.email }}</p>
                <p v-else-if="signUp.touched.email && signUp.email" class="input-info input-info--valid">Valid</p>
            </div>

            <div class="input-container">
                <label for="su-password" class="input-label">Password</label>
                <input
                    id="su-password"
                    v-model="signUp.password"
                    type="password"
                    :class="['input-field', {
                        'input-field--invalid': signUp.errors.password,
                        'input-field--valid': signUp.touched.password && !signUp.errors.password && signUp.password
                    }]"
                    placeholder="••••••••••••"
                    autocomplete="new-password"
                    @blur="signUp.touched.password = true"
                />
                <p v-if="signUp.errors.password" class="input-info input-info--invalid">{{ signUp.errors.password }}</p>
                <p v-else-if="signUp.touched.password && signUp.password" class="input-info input-info--valid">Valid</p>
            </div>

            <div class="input-container">
                <label for="su-confirm" class="input-label">Confirm Password</label>
                <input
                    id="su-confirm"
                    v-model="signUp.confirmPassword"
                    type="password"
                    :class="['input-field', {
                        'input-field--invalid': signUp.errors.confirmPassword,
                        'input-field--valid': signUp.touched.confirmPassword && !signUp.errors.confirmPassword && signUp.confirmPassword
                    }]"
                    placeholder="••••••••••••"
                    autocomplete="new-password"
                    @blur="signUp.touched.confirmPassword = true"
                />
                <p v-if="signUp.errors.confirmPassword" class="input-info input-info--invalid">{{ signUp.errors.confirmPassword }}</p>
                <p v-else-if="signUp.touched.confirmPassword && signUp.confirmPassword" class="input-info input-info--valid">Valid</p>
            </div>

            <p v-if="signUp.generalError" class="general-error">{{ signUp.generalError }}</p>

            <button type="submit" class="btn btn-secondary full-btn" :disabled="signUp.loading">
                <span v-if="signUp.loading">Creating account…</span>
                <span v-else>Create Account</span>
            </button>

            <p class="switch-text">
                Already have an account?
                <button type="button" class="text-link" @click="switchMode('signin')">Sign In</button>
            </p>
        </form>
    </PublicPageLayout>
</template>

<script>
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase.js';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

const NUS_EMAIL_DOMAINS = ['@u.nus.edu', '@nus.edu.sg'];

export default {
    name: 'SignIn',

    components: { PublicPageLayout },

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
                if (auth.currentUser?.emailVerified) {
                    try {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { email_verified: true });
                    } catch { /* ignore */ }
                }
                this.$router.push('/');
            } catch (err) {
                if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                    this.signIn.generalError = 'Invalid email or password. Please try again.';
                    this.signIn.promptSignUp = true;
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
                        email_verified: false,
                        granted_consent: false,
                        onboarded: false,
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
.form-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--secondary);
    margin-bottom: 1.5rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.auth-tabs {
    display: flex;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}

.auth-tab {
    flex: 1;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    padding: 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    color: var(--gray4);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
}

.auth-tab--active {
    color: var(--secondary);
    border-bottom-color: var(--secondary);
}

.auth-tab:hover:not(.auth-tab--active) {
    color: var(--gray2);
}

.label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.label-row .input-label {
    margin-bottom: 0;
}

.forgot-link {
    font-size: 0.875rem;
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
}

.forgot-link:hover {
    text-decoration: underline;
}

.input-field--valid {
    border-color: var(--success) !important;
}

.general-error {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.22);
    border-radius: var(--radius);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--error);
}

.full-btn {
    width: 100%;
    justify-content: center;
    padding: 1rem 0;
    font-size: 1rem;
}

.full-btn:disabled {
    background-color: var(--gray5);
    border-color: var(--gray5);
    cursor: not-allowed;
}

.switch-text {
    text-align: center;
    font-size: 0.875rem;
    color: var(--gray3);
}

.text-link {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: inherit;
    color: var(--primary);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
}
</style>
