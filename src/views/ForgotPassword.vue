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
            <RouterLink to="/auth" class="btn btn-secondary full-btn">Back to Sign In</RouterLink>
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
                    />
                    <p v-if="error" class="input-info input-info--invalid">{{ error }}</p>
                </div>

                <button type="submit" class="btn btn-secondary full-btn" :disabled="loading">
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

export default {
    name: 'ForgotPassword',

    components: { PublicPageLayout },

    data() {
        return {
            email: '',
            error: '',
            loading: false,
            submitted: false,
        };
    },

    methods: {
        async handleSubmit() {
            this.error = '';

            if (!this.email) {
                this.error = 'Email is required.';
                return;
            }

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
    margin-bottom: 1rem;
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
    margin-bottom: 0.5rem;
}

.info-text--secondary {
    font-size: 0.875rem;
    color: var(--gray3);
}

.email-highlight {
    color: var(--black2);
    font-weight: 700;
}

.full-btn {
    width: 100%;
    justify-content: center;
    padding: 1rem 0;
    font-size: 1rem;
    margin-top: 0.5rem;
    text-align: center;
    text-decoration: none;
}

.full-btn:disabled {
    background-color: var(--gray5);
    border-color: var(--gray5);
    cursor: not-allowed;
}

.switch-text {
    text-align: center;
    font-size: 0.875rem;
}

.text-link {
    color: var(--primary);
    font-weight: 600;
    text-decoration: underline;
}
</style>
