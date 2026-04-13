<template>
    <PublicPageLayout>
        <h3 class="form-title">Sign Up</h3>

        <form @submit.prevent="handleSignUp" novalidate class="auth-form">
            <div class="input-container">
                <label for="su-email" class="input-label">NUS Email</label>
                <input
                    id="su-email"
                    v-model.trim="email"
                    type="email"
                    :class="['input-field', {
                        'input-field--invalid': errors.email,
                        'input-field--valid': touched.email && !errors.email && email,
                    }]"
                    autocomplete="email"
                    @blur="onEmailBlur"
                    @input="onEmailInput"
                />
                <p v-if="errors.email" class="input-info input-info--invalid">{{ errors.email }}</p>
                <p v-else class="input-info">Must be an NUS email address (ending in @u.nus.edu or @nus.edu.sg)</p>
            </div>

            <div class="input-container">
                <label for="su-password" class="input-label">Password</label>
                <div class="input-wrapper">
                    <input
                        id="su-password"
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        :class="['input-field', {
                            'input-field--invalid': errors.password,
                            'input-field--valid': touched.password && !errors.password && password,
                        }]"
                        autocomplete="new-password"
                        @blur="onPasswordBlur"
                        @input="onPasswordInput"
                    />
                    <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <p v-if="errors.password" class="input-info input-info--invalid">{{ errors.password }}</p>
                <p v-else class="input-info">Minimum 12 characters; no spaces at the start or end</p>
            </div>

            <div class="input-container">
                <label for="su-confirm" class="input-label">Confirm Password</label>
                <div class="input-wrapper">
                    <input
                        id="su-confirm"
                        v-model="confirmPassword"
                        :type="showConfirm ? 'text' : 'password'"
                        :class="['input-field', {
                            'input-field--invalid': errors.confirmPassword,
                            'input-field--valid': touched.confirmPassword && !errors.confirmPassword && confirmPassword,
                        }]"
                        autocomplete="new-password"
                        @blur="onConfirmBlur"
                        @input="onConfirmInput"
                    />
                    <button type="button" class="eye-btn" @click="showConfirm = !showConfirm" tabindex="-1" :aria-label="showConfirm ? 'Hide password' : 'Show password'">
                        <svg v-if="showConfirm" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <p v-if="errors.confirmPassword" class="input-info input-info--invalid">{{ errors.confirmPassword }}</p>
                <p v-else class="input-info">Re-enter the password you just set</p>
            </div>

            <p v-if="generalError" class="general-error">{{ generalError }}</p>

            <button type="submit" class="btn btn-secondary full-btn" :disabled="loading">
                <span v-if="loading">Creating account…</span>
                <span v-else>Create Account</span>
            </button>

            <div class="divider-row">
                <hr class="divider" /><span class="divider-label">or</span><hr class="divider" />
            </div>

            <button type="button" class="btn-google" @click="handleGoogleSignIn" :disabled="loading">
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
                <RouterLink to="/sign-in" class="text-link">Sign In</RouterLink>
            </p>
        </form>
    </PublicPageLayout>
</template>

<script>
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase.js';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

const NUS_EMAIL_DOMAINS = ['@u.nus.edu', '@nus.edu.sg'];

export default {
    name: 'SignUp',

    components: { PublicPageLayout },

    data() {
        return {
            email: '',
            password: '',
            confirmPassword: '',
            showPassword: false,
            showConfirm: false,
            errors: { email: '', password: '', confirmPassword: '' },
            touched: { email: false, password: false, confirmPassword: false },
            generalError: '',
            loading: false,
        };
    },

    methods: {
        // Per-field validation
        validateEmail() {
            if (!this.email) {
                this.errors.email = 'Email is required.';
            } else if (!NUS_EMAIL_DOMAINS.some(d => this.email.endsWith(d))) {
                this.errors.email = 'Must be a valid NUS email (@u.nus.edu or @nus.edu.sg).';
            } else {
                this.errors.email = '';
            }
        },

        validatePassword() {
            const pw = this.password;
            if (!pw) {
                this.errors.password = 'Password is required.';
            } else if (pw !== pw.trim()) {
                this.errors.password = 'Password must not start or end with spaces.';
            } else if (pw.length < 12) {
                this.errors.password = 'Must be at least 12 characters.';
            } else {
                this.errors.password = '';
            }
        },

        validateConfirm() {
            if (!this.confirmPassword) {
                this.errors.confirmPassword = 'Please confirm your password.';
            } else if (this.confirmPassword !== this.password) {
                this.errors.confirmPassword = 'Passwords do not match.';
            } else {
                this.errors.confirmPassword = '';
            }
        },

        // Blur handlers — mark touched then validate
        onEmailBlur() { this.touched.email = true; this.validateEmail(); },
        onPasswordBlur() { this.touched.password = true; this.validatePassword(); },
        onConfirmBlur() { this.touched.confirmPassword = true; this.validateConfirm(); },

        // Input handlers — only re-validate if already touched
        onEmailInput() { if (this.touched.email) this.validateEmail(); },
        onPasswordInput() {
            if (this.touched.password) this.validatePassword();
            // Also re-validate confirm if it has been touched (password changed)
            if (this.touched.confirmPassword) this.validateConfirm();
        },
        onConfirmInput() { if (this.touched.confirmPassword) this.validateConfirm(); },

        validateAll() {
            this.touched = { email: true, password: true, confirmPassword: true };
            this.validateEmail();
            this.validatePassword();
            this.validateConfirm();
            return !this.errors.email && !this.errors.password && !this.errors.confirmPassword;
        },

        async handleSignUp() {
            if (!this.validateAll()) return;
            this.loading = true;
            this.generalError = '';

            try {
                const credential = await createUserWithEmailAndPassword(auth, this.email, this.password);
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
                    this.errors.email = 'This email is already registered.';
                    this.touched.email = true;
                } else {
                    this.generalError = 'Registration failed. Please try again.';
                }
            } finally {
                this.loading = false;
            }
        },

        async handleGoogleSignIn() {
            this.generalError = '';
            this.loading = true;
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
                    this.generalError = 'Google sign-up failed. Please try again.';
                }
            } finally {
                this.loading = false;
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
    right: 0.75rem;
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

.divider-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
    gap: 0.6rem;
    width: 100%;
    padding: 0.7rem 0;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: var(--radius);
    font-size: 0.95rem;
    font-family: inherit;
    font-weight: 500;
    color: #3c4043;
    cursor: pointer;
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
    width: 1.1rem;
    height: 1.1rem;
}

.switch-text {
    text-align: center;
    font-size: 0.875rem;
    color: var(--gray3);
}

.text-link {
    color: var(--primary);
    font-weight: 600;
    text-decoration: underline;
}
</style>
