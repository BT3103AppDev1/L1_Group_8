<template>
    <PublicPageLayout>
        <!-- Invalid / expired link -->
        <template v-if="!oobCode || isExpired">
            <h3 class="form-title">Invalid Link</h3>
            <p class="info-text info-text--secondary">
                This password reset link is invalid or has expired.
                Please request a new one.
            </p>
            <RouterLink to="/forgot-password" class="btn btn-secondary redirect-btn">Back to Forgot Password</RouterLink>
        </template>

        <!-- Success state -->
        <template v-else-if="success">
            <h3 class="form-title">Password Reset!</h3>
            <p class="info-text">
                Your password has been updated successfully.
                You can now sign in with your new password.
            </p>
            <RouterLink to="/auth" class="btn btn-secondary redirect-btn">Go to Sign In</RouterLink>
        </template>

        <!-- Reset form -->
        <template v-else>
            <h3 class="form-title">Reset Password</h3>

            <form @submit.prevent="handleSubmit" novalidate class="auth-form">
                <div class="input-container">
                    <label for="rp-password" class="input-label">New Password</label>
                    <div class="input-wrapper">
                        <input
                            id="rp-password"
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
                    <label for="rp-confirm" class="input-label">Confirm New Password</label>
                    <div class="input-wrapper">
                        <input
                            id="rp-confirm"
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

                <button type="submit" class="btn btn-secondary" :disabled="loading">
                    <span v-if="loading">Submitting…</span>
                    <span v-else>Submit</span>
                </button>
            </form>
        </template>
    </PublicPageLayout>
</template>

<script>
import { confirmPasswordReset, signOut } from 'firebase/auth';
import { auth } from '@/firebase.js';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

export default {
    name: 'ResetPassword',

    components: { PublicPageLayout },

    data() {
        return {
            oobCode: '',
            password: '',
            confirmPassword: '',
            showPassword: false,
            showConfirm: false,
            errors: { password: '', confirmPassword: '' },
            touched: { password: false, confirmPassword: false },
            generalError: '',
            loading: false,
            success: false,
            isExpired: false,
        };
    },

    created() {
        this.oobCode = this.$route.query.oobCode || '';
    },

    methods: {
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

        onPasswordBlur() { this.touched.password = true; this.validatePassword(); },
        onConfirmBlur() { this.touched.confirmPassword = true; this.validateConfirm(); },
        onPasswordInput() {
            if (this.touched.password) this.validatePassword();
            if (this.touched.confirmPassword) this.validateConfirm();
        },
        onConfirmInput() { if (this.touched.confirmPassword) this.validateConfirm(); },

        async handleSubmit() {
            this.touched = { password: true, confirmPassword: true };
            this.validatePassword();
            this.validateConfirm();
            if (this.errors.password || this.errors.confirmPassword) return;

            this.generalError = '';
            this.loading = true;
            try {
                await confirmPasswordReset(auth, this.oobCode, this.password);
                await signOut(auth).catch(() => {});
                this.success = true;
            } catch (err) {
                if (err.code === 'auth/expired-action-code' || err.code === 'auth/invalid-action-code') {
                    this.isExpired = true;
                } else if (err.code === 'auth/weak-password') {
                    this.errors.password = 'Password is too weak. Please choose a stronger password.';
                } else {
                    this.generalError = 'Something went wrong. Please try again.';
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

.btn {
  padding: 1rem 0;
  width: 100%;
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

.redirect-btn {
    margin-top: 1.5rem;
}
</style>
