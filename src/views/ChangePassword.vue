<template>
    <div class="page-wrapper">
        <div class="form-card">
            <!-- Google user — cannot change password -->
            <template v-if="isGoogleUser">
                <h2 class="page-title">Change Password</h2>
                <div class="info-box">
                    <p class="info-text">
                        Your account uses Google Sign-In. Password changes are managed through your Google account.
                    </p>
                </div>
                <RouterLink to="/my-profile" class="btn btn-outline back-btn">Back to Profile</RouterLink>
            </template>

            <!-- Loading -->
            <template v-else-if="loading && !currentPassword">
                <p class="info-text">Loading…</p>
            </template>

            <!-- Success -->
            <template v-else-if="success">
                <h2 class="page-title">Password Changed</h2>
                <p class="info-text">Your password has been updated successfully.</p>
                <RouterLink to="/my-profile" class="btn btn-secondary full-btn">Back to Profile</RouterLink>
            </template>

            <!-- Change password form -->
            <template v-else>
                <h2 class="page-title">Change Password</h2>

                <form @submit.prevent="handleSubmit" novalidate class="auth-form">
                    <div class="input-container">
                        <label for="cp-current" class="input-label">Current Password</label>
                        <div class="input-wrapper">
                            <input
                                id="cp-current"
                                v-model="currentPassword"
                                :type="showCurrent ? 'text' : 'password'"
                                :class="['input-field', { 'input-field--invalid': errors.currentPassword }]"
                                autocomplete="current-password"
                            />
                            <button type="button" class="eye-btn" @click="showCurrent = !showCurrent" tabindex="-1" :aria-label="showCurrent ? 'Hide password' : 'Show password'">
                                <svg v-if="showCurrent" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                        </div>
                        <p v-if="errors.currentPassword" class="input-info input-info--invalid">{{ errors.currentPassword }}</p>
                    </div>

                    <div class="input-container">
                        <label for="cp-new" class="input-label">New Password</label>
                        <div class="input-wrapper">
                            <input
                                id="cp-new"
                                v-model="newPassword"
                                :type="showNew ? 'text' : 'password'"
                                :class="['input-field', {
                                    'input-field--invalid': errors.newPassword,
                                    'input-field--valid': touched.newPassword && !errors.newPassword && newPassword,
                                }]"
                                autocomplete="new-password"
                                @blur="onNewPasswordBlur"
                                @input="onNewPasswordInput"
                            />
                            <button type="button" class="eye-btn" @click="showNew = !showNew" tabindex="-1" :aria-label="showNew ? 'Hide password' : 'Show password'">
                                <svg v-if="showNew" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                        </div>
                        <p v-if="errors.newPassword" class="input-info input-info--invalid">{{ errors.newPassword }}</p>
                        <p v-else class="input-info">At least 12 characters. No leading or trailing spaces.</p>
                    </div>

                    <div class="input-container">
                        <label for="cp-confirm" class="input-label">Confirm New Password</label>
                        <div class="input-wrapper">
                            <input
                                id="cp-confirm"
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
                        <p v-else class="input-info">Re-enter your new password to confirm.</p>
                    </div>

                    <p v-if="generalError" class="general-error">{{ generalError }}</p>

                    <button type="submit" class="btn btn-secondary full-btn" :disabled="loading">
                        <span v-if="loading">Updating…</span>
                        <span v-else>Update Password</span>
                    </button>

                    <RouterLink to="/my-profile" class="btn btn-outline full-btn cancel-btn">Cancel</RouterLink>
                </form>
            </template>
        </div>
    </div>
</template>

<script>
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import { getCurrentUser } from '@/auth.js';
import { auth } from '@/firebase.js';

export default {
    name: 'ChangePassword',

    data() {
        return {
            isGoogleUser: false,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            showCurrent: false,
            showNew: false,
            showConfirm: false,
            errors: { currentPassword: '', newPassword: '', confirmPassword: '' },
            touched: { newPassword: false, confirmPassword: false },
            generalError: '',
            loading: false,
            success: false,
        };
    },

    async created() {
        const user = await getCurrentUser();
        if (!user) {
            this.$router.replace('/sign-in');
            return;
        }
        const providers = user.providerData.map(p => p.providerId);
        this.isGoogleUser = providers.includes('google.com') && !providers.includes('password');
    },

    methods: {
        validateNewPassword() {
            const pw = this.newPassword;
            if (!pw) {
                this.errors.newPassword = 'New password is required.';
            } else if (pw !== pw.trim()) {
                this.errors.newPassword = 'Password must not start or end with spaces.';
            } else if (pw.length < 12) {
                this.errors.newPassword = 'Must be at least 12 characters.';
            } else {
                this.errors.newPassword = '';
            }
        },

        validateConfirm() {
            if (!this.confirmPassword) {
                this.errors.confirmPassword = 'Please confirm your new password.';
            } else if (this.confirmPassword !== this.newPassword) {
                this.errors.confirmPassword = 'Passwords do not match.';
            } else {
                this.errors.confirmPassword = '';
            }
        },

        onNewPasswordBlur() { this.touched.newPassword = true; this.validateNewPassword(); },
        onConfirmBlur() { this.touched.confirmPassword = true; this.validateConfirm(); },
        onNewPasswordInput() {
            if (this.touched.newPassword) this.validateNewPassword();
            if (this.touched.confirmPassword) this.validateConfirm();
        },
        onConfirmInput() { if (this.touched.confirmPassword) this.validateConfirm(); },

        async handleSubmit() {
            this.errors = { currentPassword: '', newPassword: '', confirmPassword: '' };
            this.generalError = '';

            if (!this.currentPassword) {
                this.errors.currentPassword = 'Current password is required.';
                return;
            }

            this.touched = { newPassword: true, confirmPassword: true };
            this.validateNewPassword();
            this.validateConfirm();
            if (this.errors.newPassword || this.errors.confirmPassword) return;

            this.loading = true;
            try {
                const user = auth.currentUser;
                if (!user) throw new Error('Not authenticated');

                // Re-authenticate before changing password
                const credential = EmailAuthProvider.credential(user.email, this.currentPassword);
                await reauthenticateWithCredential(user, credential);

                await updatePassword(user, this.newPassword);
                this.success = true;
            } catch (err) {
                if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                    this.errors.currentPassword = 'Current password is incorrect.';
                } else if (err.code === 'auth/too-many-requests') {
                    this.generalError = 'Too many attempts. Please try again later.';
                } else if (err.code === 'auth/requires-recent-login') {
                    this.generalError = 'Please sign out and sign back in before changing your password.';
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
.page-wrapper {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
}

.form-card {
    background: var(--white);
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    padding: 2.5rem 2.75rem;
    width: 100%;
    max-width: 480px;
}

.page-title {
    font-size: 1.75rem;
    font-weight: bold;
    color: var(--secondary);
    margin-bottom: 1.5rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.info-text {
    font-size: 1rem;
    color: var(--gray2);
    line-height: 1.7;
    margin-bottom: 0.75rem;
}

.info-box {
    background: rgba(0, 61, 124, 0.06);
    border: 1px solid rgba(0, 61, 124, 0.15);
    border-radius: var(--radius);
    padding: 0.875rem 1rem;
    margin-bottom: 1.5rem;
}

.info-box .info-text {
    margin-bottom: 0;
    color: var(--primary);
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
    text-align: center;
    text-decoration: none;
}

.full-btn:disabled {
    background-color: var(--gray5);
    border-color: var(--gray5);
    cursor: not-allowed;
}

.cancel-btn {
    margin-top: 0.25rem;
}

.back-btn {
    display: inline-flex;
    margin-top: 0.5rem;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
}
</style>
