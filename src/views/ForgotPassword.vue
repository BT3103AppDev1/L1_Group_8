<template>
    <PublicPageLayout>
        <template v-if="submitted">
            <h3 class="form-title">Check Your Inbox</h3>
            <p class="info-text">
                If an account exists for <strong class="email-highlight">{{ email }}</strong>,
                a password reset link has been sent to that address.
            </p>
            <p class="info-text info-text--secondary">
                Don't see the email? Check your spam or junk folder.
            </p>
            <RouterLink to="/auth" class="btn btn-secondary redirect-btn">Back to Sign In</RouterLink>
        </template>

        <template v-else>
            <h3 class="form-title">Forgot Password?</h3>
            <p class="info-text info-text--secondary">
                Please enter the email address you used during sign-up. We will send password reset instructions to that address.
            </p>

            <form @submit.prevent="handleSubmit" novalidate class="auth-form">
                <div class="input-container">
                    <input
                        id="fp-email"
                        v-model.trim="email"
                        type="email"
                        :class="['input-field', { 'input-field--invalid': error }]"
                        placeholder="Enter the NUS email address you used to sign up"
                        autocomplete="email"
                        @blur="onEmailBlur"
                        @input="onEmailInput"
                    />
                    <p v-if="error" class="input-info input-info--invalid">{{ error }}</p>
                </div>

                <button type="submit" class="btn btn-secondary redirect-btn" :disabled="loading">
                    <span v-if="loading">Sending…</span>
                    <span v-else>Submit</span>
                </button>

                <p class="switch-text">
                    <RouterLink to="/auth" class="text-link">Back to Sign In</RouterLink>
                </p>
            </form>
        </template>
    </PublicPageLayout>
</template>

<script>
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase.js';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

const NUS_EMAIL_DOMAINS = ['@u.nus.edu', '@nus.edu.sg'];

export default {
    name: 'ForgotPassword',

    components: { PublicPageLayout },

    data() {
        return {
            email: '',
            touched: false,
            error: '',
            loading: false,
            submitted: false,
        };
    },

    methods: {
        validateEmail() {
            if (!this.email) {
                this.error = 'Email is required!';
            } else if (!NUS_EMAIL_DOMAINS.some(d => this.email.endsWith(d))) {
                this.error = 'Must be a valid NUS email (@u.nus.edu or @nus.edu.sg)!';
            } else {
                this.error = '';
            }
        },

        onEmailBlur() { this.touched = true; this.validateEmail(); },
        onEmailInput() { if (this.touched) this.validateEmail(); },

        async handleSubmit() {
            this.error = '';

            this.validateEmail();
            if (this.error) return;

            this.loading = true;
            try {
                await sendPasswordResetEmail(auth, this.email, {
                    url: window.location.origin + '/auth/action',
                });
                this.submitted = true;
            } catch (err) {
                if (err.code === 'auth/invalid-email') {
                    this.error = 'Invalid email address.';
                } else if (err.code === 'auth/too-many-requests') {
                    this.error = 'Too many requests. Please try again later.';
                } else {
                    // For security, don't reveal if email is registered or not
                    this.submitted = true;
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
    margin-bottom: 1.25rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 1rem;
}

.info-text {
    font-size: 1rem;
    color: var(--gray2);
    line-height: 1.8;
    margin-bottom: 1rem;
}

.info-text--secondary {
    font-size: 0.875rem;
    color: var(--gray3);
}

.email-highlight {
    color: var(--black2);
    font-weight: 700;
}

.redirect-btn {
    margin-top: 0.75rem;
}

.switch-text {
    text-align: center;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.text-link {
    color: var(--primary);
    font-weight: bold;
    text-decoration: none;
}
</style>
