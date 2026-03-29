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

<<<<<<< Updated upstream
=======
            <div class="divider-row">
                <hr class="divider" /><span class="divider-label">or</span><hr class="divider" />
            </div>

            <button type="button" class="btn-google" @click="handleGoogleSignIn" :disabled="signIn.loading">
                <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            </button>

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
            <div class="divider-row">
                <hr class="divider" /><span class="divider-label">or</span><hr class="divider" />
            </div>

            <button type="button" class="btn-google" @click="handleGoogleSignIn" :disabled="signUp.loading">
                <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
            </button>

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
=======
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
        async handleGoogleSignIn() {
            this.signIn.generalError = '';
            this.signIn.loading = true;
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
                    this.signIn.generalError = 'Google sign-in failed. Please try again.';
                }
            } finally {
                this.signIn.loading = false;
            }
        },

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

.divider-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.25rem 0;
}

.divider-row .divider {
    flex: 1;
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.divider-label {
    font-size: 0.8rem;
    color: var(--gray4);
}

.btn-google {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #fff;
    border: 1.5px solid #dadce0;
    border-radius: var(--radius);
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: inherit;
    color: var(--black2);
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
}

.btn-google:hover {
    background: #f8f9fa;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.btn-google:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.google-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}
>>>>>>> Stashed changes
</style>
