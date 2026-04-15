<template>
    <PublicPageLayout>
        <transition name="fade" mode="out-in">
            <!-- Sign Up Form -->
            <div class="sign-up" v-if="mode==='sign-up'" key="sign-up">
                <h3 class="form-title">Sign Up</h3>

                <form @submit.prevent="handleSignUp" novalidate class="auth-form">
                    <div class="input-container">
                        <label for="su-email" class="input-label">NUS Email</label>
                        <input
                            id="su-email"
                            v-model.trim="signUp.email"
                            type="email"
                            :class="['input-field', {
                                'input-field--invalid': signUp.errors.email,
                                'input-field--valid': signUp.touched.email && !signUp.errors.email && signUp.email,
                            }]"
                            autocomplete="email"
                            @blur="onEmailBlur"
                            @input="onEmailInput"
                        />
                        <p v-if="signUp.errors.email" class="input-info input-info--invalid">{{ signUp.errors.email }}</p>
                        <p v-else class="input-info">Must be an NUS email address (ending in @u.nus.edu or @nus.edu.sg)</p>
                    </div>

                    <div class="input-container">
                        <label for="su-password" class="input-label">Password</label>
                        <div class="input-wrapper">
                            <input
                                id="su-password"
                                v-model="signUp.password"
                                :type="signUp.showPassword ? 'text' : 'password'"
                                :class="['input-field', {
                                    'input-field--invalid': signUp.errors.password,
                                    'input-field--valid': signUp.touched.password && !signUp.errors.password && signUp.password,
                                }]"
                                autocomplete="new-password"
                                @blur="onPasswordBlur"
                                @input="onPasswordInput"
                            />
                            <button type="button" class="eye-btn" @click="signUp.showPassword = !signUp.showPassword" tabindex="-1" :aria-label="signUp.showPassword ? 'Hide password' : 'Show password'">
                                <svg v-if="signUp.showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                        </div>
                        <p v-if="signUp.errors.password" class="input-info input-info--invalid">{{ signUp.errors.password }}</p>
                        <p v-else class="input-info">Minimum 12 characters; no spaces at the start or end</p>
                    </div>

                    <div class="input-container">
                        <label for="su-confirm" class="input-label">Confirm Password</label>
                        <div class="input-wrapper">
                            <input
                                id="su-confirm"
                                v-model="signUp.confirmPassword"
                                :type="signUp.showConfirm ? 'text' : 'password'"
                                :class="['input-field', {
                                    'input-field--invalid': signUp.errors.confirmPassword,
                                    'input-field--valid': signUp.touched.confirmPassword && !signUp.errors.confirmPassword && signUp.confirmPassword,
                                }]"
                                autocomplete="new-password"
                                @blur="onConfirmBlur"
                                @input="onConfirmInput"
                            />
                            <button type="button" class="eye-btn" @click="signUp.showConfirm = !signUp.showConfirm" tabindex="-1" :aria-label="signUp.showConfirm ? 'Hide password' : 'Show password'">
                                <svg v-if="signUp.showConfirm" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                        </div>
                        <p v-if="signUp.errors.confirmPassword" class="input-info input-info--invalid">{{ signUp.errors.confirmPassword }}</p>
                        <p v-else class="input-info">Re-enter the password you just set</p>
                    </div>

                    <p v-if="signUp.generalError" class="general-error">{{ signUp.generalError }}</p>

                    <button type="submit" class="btn btn-secondary" :disabled="signUp.loading">
                        <span v-if="signUp.loading">Creating account…</span>
                        <span v-else>Create Account</span>
                    </button>

                    <div class="divider-row">
                        <hr class="divider" /><span class="divider-label">or</span><hr class="divider" />
                    </div>

                    <button type="button" class="btn btn-google" @click="handleGoogleSignIn" :disabled="signUp.loading">
                        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <p class="switch-text">
                        Already have an account?
                        <button @click="switchMode('sign-in')" class="text-link">Sign In</button>
                    </p>
                </form>
            </div>
        
            <div class="sign-in" v-else-if="mode==='sign-in'" key="sign-in">
                <h3 class="form-title">Welcome Back</h3>

                <form @submit.prevent="handleSignIn" novalidate class="auth-form">
                    <div class="input-container">
                        <label for="si-email" class="input-label">NUS Email (or Test Email)</label>
                        <input
                            id="si-email"
                            v-model.trim="signIn.email"
                            type="email"
                            :class="['input-field', { 'input-field--invalid': signIn.errors.email }]"
                            autocomplete="email"
                        />
                        <p v-if="signIn.errors.email" class="input-info input-info--invalid">{{ signIn.errors.email }}</p>
                    </div>

                    <div class="input-container">
                        <label for="si-password" class="input-label">Password</label>
                        <div class="input-wrapper">
                            <input
                                id="si-password"
                                v-model="signIn.password"
                                :type="signIn.showPassword ? 'text' : 'password'"
                                :class="['input-field', { 'input-field--invalid': signIn.errors.password }]"
                                autocomplete="current-password"
                            />
                            <button type="button" class="eye-btn" @click="signIn.showPassword = !signIn.showPassword" tabindex="-1" :aria-label="signIn.showPassword ? 'Hide password' : 'Show password'">
                                <svg v-if="signIn.showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                        </div>
                        <p v-if="signIn.errors.password" class="input-info input-info--invalid">{{ signIn.errors.password }}</p>
                        <RouterLink to="/forgot-password" class="forgot-link">Forget password?</RouterLink>
                    </div>

                    <div v-if="signIn.generalError" class="general-error">
                        {{ signIn.generalError }}
                        <div v-if="signIn.promptSignUp" class="prompt-container">
                            New to NUSOS? <button @click="switchMode('sign-up')" class="error-link">Sign Up</button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-secondary" :disabled="signIn.loading">
                        <span v-if="signIn.loading">Signing in…</span>
                        <span v-else>Sign In</span>
                    </button>

                    <div class="divider-row">
                        <hr class="divider" /><span class="divider-label">or</span><hr class="divider" />
                    </div>

                    <button type="button" class="btn btn-google" @click="handleGoogleSignIn" :disabled="signIn.loading">
                        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <p class="switch-text">
                        Don't have an account?
                        <button @click="switchMode('sign-up')" class="text-link">Sign Up</button>
                    </p>
                </form>
            </div>
        </transition>
    </PublicPageLayout>
</template>

<script>
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase.js';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

const NUS_EMAIL_DOMAINS = ['@u.nus.edu', '@nus.edu.sg'];

export default {
    name: 'AuthPage',

    components: { PublicPageLayout },

    data() {
        return {
            mode: 'sign-in',
            signIn: {
                email: '',
                password: '',
                errors: { email: '', password: '' },
                generalError: '',
                promptSignUp: false,
                loading: false,
                showPassword: false,
            },
            signUp: {
                email: '',
                password: '',
                confirmPassword: '',
                errors: { email: '', password: '', confirmPassword: '' },
                touched: { email: false, password: false, confirmPassword: false },
                generalError: '',
                loading: false,
                showPassword: false,
                showConfirm: false,
            },
        };
    },

    methods: {
        // Per-field validation
        validateEmail() {
            if (this.mode === 'sign-in') return;
            if (!this.signUp.email) {
                this.signUp.errors.email = 'Email is required!';
            } else if (!NUS_EMAIL_DOMAINS.some(d => this.signUp.email.endsWith(d))) {
                this.signUp.errors.email = 'Must be a valid NUS email (@u.nus.edu or @nus.edu.sg)!';
            } else {
                this.signUp.errors.email = '';
            }
        },

        validatePassword() {
            if (this.mode === 'sign-in') return;
            const pw = this.signUp.password;
            if (!pw) {
                this.signUp.errors.password = 'Password is required!';
            } else if (pw !== pw.trim()) {
                this.signUp.errors.password = 'Password must not start or end with spaces!';
            } else if (pw.length < 12) {
                this.signUp.errors.password = 'Must be at least 12 characters!';
            } else {
                this.signUp.errors.password = '';
            }
        },

        validateConfirm() {
            if (this.mode === 'sign-in') return;
            if (!this.signUp.confirmPassword) {
                this.signUp.errors.confirmPassword = 'Please confirm your password!';
            } else if (this.signUp.confirmPassword !== this.signUp.password) {
                this.signUp.errors.confirmPassword = 'Passwords do not match!';
            } else {
                this.signUp.errors.confirmPassword = '';
            }
        },

        // Blur handlers — mark touched then validate
        onEmailBlur() { this.signUp.touched.email = true; this.validateEmail(); },
        onPasswordBlur() { this.signUp.touched.password = true; this.validatePassword(); },
        onConfirmBlur() { this.signUp.touched.confirmPassword = true; this.validateConfirm(); },

        // Input handlers — only re-validate if already touched
        onEmailInput() { if (this.signUp.touched.email) this.validateEmail(); },
        onPasswordInput() {
            if (this.signUp.touched.password) this.validatePassword();
            // Also re-validate confirm if it has been touched (password changed)
            if (this.signUp.touched.confirmPassword) this.validateConfirm();
        },
        onConfirmInput() { if (this.signUp.touched.confirmPassword) this.validateConfirm(); },

        validateAll() {
            this.signUp.touched = { email: true, password: true, confirmPassword: true };
            this.validateEmail();
            this.validatePassword();
            this.validateConfirm();
            return !this.signUp.errors.email && !this.signUp.errors.password && !this.signUp.errors.confirmPassword;
        },

        async handleSignUp() {
            if (!this.validateAll()) return;
            this.signUp.loading = true;
            this.signUp.generalError = '';

            try {
                const credential = await createUserWithEmailAndPassword(auth, this.signUp.email, this.signUp.password);
                const user = credential.user;

                try {
                    await sendEmailVerification(user, { url: window.location.origin + '/auth/action' });
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
                    this.signUp.errors.email = 'This email is already registered! Please sign in instead.';
                    this.signUp.touched.email = true;
                } else {
                    this.signUp.generalError = 'Registration failed. Please try again.';
                }
            } finally {
                this.signUp.loading = false;
            }
        },

        async handleGoogleSignIn() {
            this.signIn.generalError = '';
            this.signUp.generalError = '';
            this.signIn.loading = true;
            this.signUp.loading = true;
            try {
                const provider = new GoogleAuthProvider();
                const credential = await signInWithPopup(auth, provider);
                const user = credential.user;

                const snap = await getDoc(doc(db, 'users', user.uid));
                if (!snap.exists()) {
                    await setDoc(doc(db, 'users', user.uid), {
                        email: user.email,
                        createdAt: serverTimestamp(),
                        email_verified: true,
                        granted_consent: false,
                        onboarded: false,
                    });
                }
                this.$router.push('/');
            } catch (err) {
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    this.signIn.generalError = `Google ${this.mode} failed. Please try again.`;
                    this.signUp.generalError = `Google ${this.mode} failed. Please try again.`;
                }
            } finally {
                this.signIn.loading = false;
                this.signUp.loading = false;
            }
        },

        async handleSignIn() {
            this.signIn.errors = { email: '', password: '' };
            this.signIn.touched = { email: true, password: true };
            this.signIn.generalError = '';
            this.promptSignUp = false;

            if (!this.signIn.email) { this.signIn.errors.email = 'Email is required.'; return; }
            if (!this.signIn.password) { this.signIn.errors.password = 'Password is required.'; return; }

            this.signIn.loading = true;
            try {
                const credential = await signInWithEmailAndPassword(auth, this.signIn.email, this.signIn.password);
                try { await credential.user.reload(); } catch { /* ignore */ }
                if (auth.currentUser?.emailVerified) {
                    try {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { email_verified: true });
                    } catch { /* ignore */ }
                }
                // Let App.vue's Firestore listener handle routing based on onboarding state
            } catch (err) {
                if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
                    this.signIn.generalError = 'Incorrect email or password. Please try again.';
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

        switchMode(newMode) {
            this.mode = newMode;
            this.signIn = {
                email: '',
                password: '',
                errors: { email: '', password: '' },
                generalError: '',
                promptSignUp: false,
                loading: false,
                showPassword: false,
            };
            this.signUp = {
                email: '',
                password: '',
                confirmPassword: '',
                errors: { email: '', password: '', confirmPassword: '' },
                touched: { email: false, password: false, confirmPassword: false },
                generalError: '',
                loading: false,
                showPassword: false,
                showConfirm: false,
            };
        }
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
    gap: 1.25rem;
}

.input-field--valid {
    border-color: var(--success) !important;
}

.input-wrapper {
    position: relative;
    width: 100%;
}

.input-wrapper .input-field {
    padding-right: 2.75rem;
}

.eye-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--gray4);
    padding: 0;
    display: flex;
    align-items: center;
    line-height: 0;
}

.eye-btn:hover {
    color: var(--gray2);
}

.general-error {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.22);
    border-radius: var(--radius);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--error);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.125rem;
    margin-bottom: 0.5rem;
}

.prompt-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.divider-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.divider {
    flex: 1;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.divider-label {
    font-size: 0.8rem;
    color: var(--gray3);
    white-space: nowrap;
}

.btn-google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.2);
    color: #3c4043;
    transition: background 0.15s, box-shadow 0.15s;
}

.btn-google:hover:not(:disabled) {
    background: #f8f8f8;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.btn-google:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.google-icon {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
}

.switch-text {
    text-align: center;
    font-size: 0.875rem;
    color: var(--gray3);
}

.text-link {
    margin-left: 0.25rem;
    background-color: transparent;
    border: none;
    color: var(--primary);
    font-weight: bold;
}

.text-link:hover {
    color: var(--primary-hover);
}

.forgot-link {
    display: inline-block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
}

.forgot-link:hover {
    color: var(--primary-hover);
}

.error-link {
    background-color: transparent;
    border: none;
    color: var(--primary);
    font-weight: bold;
    text-decoration: none;
}

.error-link:hover {
    color: var(--primary-hover);
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
