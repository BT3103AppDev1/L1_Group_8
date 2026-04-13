<template>
    <PublicPageLayout>
        <h3 class="form-title">Welcome Back</h3>

        <form @submit.prevent="handleSignIn" novalidate class="auth-form">
            <div class="input-container">
                <label for="si-email" class="input-label">NUS Email</label>
                <input
                    id="si-email"
                    v-model.trim="email"
                    type="email"
                    :class="['input-field', { 'input-field--invalid': errors.email }]"
                    autocomplete="email"
                />
                <p v-if="errors.email" class="input-info input-info--invalid">
                    {{ errors.email }}
                    <span v-if="promptSignUp"> Don't have an account? <RouterLink to="/sign-up" class="text-link">Sign Up</RouterLink></span>
                </p>
            </div>

            <div class="input-container">
                <label for="si-password" class="input-label">Password</label>
                <div class="input-wrapper">
                    <input
                        id="si-password"
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        :class="['input-field', { 'input-field--invalid': errors.password }]"
                        autocomplete="current-password"
                    />
                    <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <p v-if="errors.password" class="input-info input-info--invalid">{{ errors.password }}</p>
                <RouterLink to="/forgot-password" class="forgot-link">Forget password?</RouterLink>
            </div>

            <div v-if="generalError" class="general-error">{{ generalError }}</div>

            <button type="submit" class="btn btn-secondary full-btn" :disabled="loading">
                <span v-if="loading">Signing in…</span>
                <span v-else>Sign In</span>
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
                Don't have an account?
                <RouterLink to="/sign-up" class="text-link">Sign Up</RouterLink>
            </p>
        </form>
    </PublicPageLayout>
</template>

<script>
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase.js';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

export default {
    name: 'SignIn',

    components: { PublicPageLayout },

    data() {
        return {
            email: '',
            password: '',
            showPassword: false,
            errors: { email: '', password: '' },
            generalError: '',
            promptSignUp: false,
            loading: false,
        };
    },

    methods: {
        async handleSignIn() {
            this.errors = { email: '', password: '' };
            this.generalError = '';
            this.promptSignUp = false;

            if (!this.email) { this.errors.email = 'Email is required.'; return; }
            if (!this.password) { this.errors.password = 'Password is required.'; return; }

            this.loading = true;
            try {
                const credential = await signInWithEmailAndPassword(auth, this.email, this.password);
                try { await credential.user.reload(); } catch { /* ignore */ }
                if (auth.currentUser?.emailVerified) {
                    try {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { email_verified: true });
                    } catch { /* ignore */ }
                }
                // Let App.vue's Firestore listener handle routing based on onboarding state
            } catch (err) {
                if (err.code === 'auth/wrong-password') {
                    this.errors.password = 'Incorrect password. Please try again.';
                } else if (err.code === 'auth/invalid-credential') {
                    // Firebase v9+ combines user-not-found and wrong-password — check which it is
                    try {
                        const methods = await fetchSignInMethodsForEmail(auth, this.email);
                        if (methods.length === 0) {
                            this.errors.email = 'No account found for this email.';
                            this.promptSignUp = true;
                        } else {
                            this.errors.password = 'Incorrect password. Please try again.';
                        }
                    } catch {
                        this.errors.password = 'Incorrect password. Please try again.';
                    }
                } else if (err.code === 'auth/user-not-found') {
                    this.errors.email = 'No account found for this email.';
                    this.promptSignUp = true;
                } else if (err.code === 'auth/invalid-email') {
                    this.errors.email = 'Invalid email address.';
                } else if (err.code === 'auth/too-many-requests') {
                    this.generalError = 'Too many failed attempts. Please try again later.';
                } else {
                    this.generalError = 'Sign in failed. Please check your credentials and try again.';
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
                // Let App.vue's Firestore listener handle routing based on onboarding state
            } catch (err) {
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    this.generalError = 'Google sign-in failed. Please try again.';
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

.forgot-link {
    display: inline-block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--secondary);
    text-decoration: none;
    font-weight: 500;
}

.forgot-link:hover {
    text-decoration: underline;
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
