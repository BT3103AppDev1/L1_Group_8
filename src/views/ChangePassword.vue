<template>
    <div class="page-wrapper">
        <div class="form-card">
            <template v-if="sent">
                <h2 class="page-title">Check Your Inbox</h2>
                <p class="info-text">
                    A password reset link has been sent to <strong>{{ userEmail }}</strong>.
                </p>
                <p class="info-text info-text--secondary">
                    Automatically signing out in {{ countdown }} seconds. You may sign back in with your new password after resetting it.
                </p>
                <p class="info-text info-text--secondary">
                    Don't see the email? Check your spam or junk folder.
                </p>
            </template>

            <!-- Default: confirm to send reset email -->
            <template v-else>
                <h2 class="page-title">Change Password</h2>
                <p class="info-text info-text--secondary">
                    We'll send a password reset link to your email address. You will be signed out and can sign back in after setting your new password.
                </p>

                <p v-if="error" class="general-error">{{ error }}</p>

                <button class="btn btn-secondary send-btn" :disabled="loading" @click="handleSend">
                    <span v-if="loading">Sending…</span>
                    <span v-else>Send Reset Email</span>
                </button>

                <p class="switch-text">
                    <RouterLink to="/edit-profile" class="text-link">Back to Edit Profile</RouterLink>
                </p>
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
            userEmail: '',
            sent: false,
            error: '',
            loading: false,
            countdown: 3,
            timer: null,
        };
    },

    methods: {
        async handleSend() {
            this.error = '';
            this.loading = true;
            try {
                await sendPasswordResetEmail(auth, this.userEmail, {
                    url: window.location.origin + '/auth/action',
                });
                this.sent = true;
                this.startCountdown();
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

        startCountdown() {
            this.countdown = 3;

            this.timer = setInterval(async () => {
                this.countdown--;
                if (this.countdown <= 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                    await signOut(auth);
                    this.$router.replace('/auth');
                }
            }, 1000);
        },
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
        if (this.isGoogleUser) {
            alert('Your account is registered via Google Sign-In. You are not allowed to change password here. You will be redirected to the Edit Profile page.');
            this.$router.replace('/edit-profile');
            return;
        }
    },
};
</script>

<style scoped>
.page-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
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
    font-size: 2rem;
    font-weight: bold;
    color: var(--secondary);
    margin-bottom: 1rem;
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

.general-error {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.22);
    border-radius: var(--radius);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--error);
    margin-bottom: 0.75rem;
}

.btn {
  padding: 1rem 0;
  width: 100%;
}

.send-btn {
    margin-top: 1.25rem;
}

.switch-text {
    text-align: center;
    font-size: 0.875rem;
    margin-top: 1.5rem;
}

.text-link {
    color: var(--primary);
    font-weight: bold;
    text-decoration: none;
}
</style>
