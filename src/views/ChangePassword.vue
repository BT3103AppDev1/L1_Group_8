<template>
    <div class="page-wrapper">
        <div class="form-card">
            <!-- Google user -->
            <template v-if="isGoogleUser">
                <h2 class="page-title">Change Password</h2>
                <div class="info-box">
                    <p class="info-text">
                        Your account uses Google Sign-In. Password changes are managed through your Google account.
                    </p>
                </div>
                <RouterLink to="/my-profile" class="btn btn-outline back-btn">Back to Profile</RouterLink>
            </template>

            <!-- Success: email sent + signed out -->
            <template v-else-if="sent">
                <h2 class="page-title">Check Your Inbox</h2>
                <p class="info-text">
                    A password reset link has been sent to <strong>{{ userEmail }}</strong>.
                </p>
                <p class="info-text info-text--secondary">
                    You have been signed out. After resetting your password, sign back in with your new password.
                </p>
                <p class="info-text info-text--secondary">
                    Don't see the email? Check your spam or junk folder.
                </p>
                <RouterLink to="/auth" class="btn btn-secondary full-btn">Go to Sign In</RouterLink>
            </template>

            <!-- Default: confirm to send reset email -->
            <template v-else>
                <h2 class="page-title">Change Password</h2>
                <p class="info-text info-text--secondary">
                    We'll send a password reset link to your email address. You will be signed out and can sign back in after setting your new password.
                </p>

                <p v-if="error" class="general-error">{{ error }}</p>

                <button class="btn btn-secondary full-btn" :disabled="loading" @click="handleSend">
                    <span v-if="loading">Sending…</span>
                    <span v-else>Send Reset Email</span>
                </button>

                <RouterLink to="/my-profile" class="btn btn-outline full-btn cancel-btn">Cancel</RouterLink>
            </template>
        </div>
    </div>
</template>

<script>
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from '@/firebase.js';
import { getCurrentUser } from '@/auth.js';

export default {
    name: 'ChangePassword',

    data() {
        return {
            isGoogleUser: false,
            userEmail: '',
            sent: false,
            error: '',
            loading: false,
        };
    },

    async created() {
        const user = await getCurrentUser();
        if (!user) {
            this.$router.replace('/auth');
            return;
        }
        this.userEmail = user.email || '';
        const providers = user.providerData.map(p => p.providerId);
        this.isGoogleUser = providers.includes('google.com') && !providers.includes('password');
    },

    methods: {
        async handleSend() {
            this.error = '';
            this.loading = true;
            try {
                await sendPasswordResetEmail(auth, this.userEmail, {
                    url: window.location.origin + '/auth/action',
                });
                await signOut(auth);
                this.sent = true;
            } catch (err) {
                if (err.code === 'auth/too-many-requests') {
                    this.error = 'Too many requests. Please try again later.';
                } else {
                    this.error = 'Failed to send reset email. Please try again.';
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
    margin-bottom: 1.25rem;
}

.info-text {
    font-size: 1rem;
    color: var(--gray2);
    line-height: 1.7;
    margin-bottom: 0.75rem;
}

.info-text--secondary {
    font-size: 0.875rem;
    color: var(--gray3);
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

.general-error {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.22);
    border-radius: var(--radius);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--error);
    margin-bottom: 0.75rem;
}

.full-btn {
    display: flex;
    width: 100%;
    justify-content: center;
    padding: 1rem 0;
    font-size: 1rem;
    text-align: center;
    text-decoration: none;
    margin-top: 0.75rem;
}

.full-btn:disabled {
    background-color: var(--gray5);
    border-color: var(--gray5);
    cursor: not-allowed;
}

.cancel-btn {
    margin-top: 0.5rem;
}

.back-btn {
    display: inline-flex;
    margin-top: 0.5rem;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
}
</style>
