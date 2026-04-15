<template>
    <PublicPageLayout>
        <h3 class="form-title">Verify Your Email</h3>
        <p class="info-text">
            We have sent a verification link to<br />
            <strong class="email-highlight">{{ userEmail }}</strong>
        </p>
        <p class="info-text info-text--secondary">
            Click the link in the email to verify your account.
            This page will update automatically once verified.
        </p>
        <p class="info-text info-text--secondary">
            Don't see the email? Check your spam or junk folder.
        </p>

        <p v-if="resendSuccess" class="input-info input-info--valid resend-msg">
            Verification email resent successfully.
        </p>
        <p v-else-if="resendError" class="input-info input-info--invalid resend-msg">
            {{ resendError }}
        </p>

        <button
            class="btn btn-secondary resend-btn"
            :disabled="resendCooldown > 0 || resendLoading"
            @click="handleResend"
        >
            <span v-if="resendLoading">Sending…</span>
            <span v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
            <span v-else>Resend Email</span>
        </button>

        <button type="button" class="text-link" @click="goToSignIn">
            Back to Sign In
        </button>
    </PublicPageLayout>
</template>


<script>
import { sendEmailVerification, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase.js';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

export default {
    name: 'EmailVerification',

    components: { PublicPageLayout },

    data() {
        return {
            userEmail: '',
            resendLoading: false,
            resendSuccess: false,
            resendError: '',
            resendCooldown: 0,
            _pollTimer: null,
            _cooldownTimer: null,
        };
    },

    created() {
        const user = auth.currentUser;
        if (!user) {
            this.$router.replace({ name: 'SignIn' });
            return;
        }
        this.userEmail = user.email || '';
        this.startPolling();
    },

    beforeUnmount() {
        if (this._pollTimer) clearInterval(this._pollTimer);
        if (this._cooldownTimer) clearInterval(this._cooldownTimer);
    },

    methods: {
        startPolling() {
            this._pollTimer = setInterval(async () => {
                const user = auth.currentUser;
                if (!user) {
                    clearInterval(this._pollTimer);
                    this._pollTimer = null;
                    return;
                }
                try {
                    await user.reload();
                    if (auth.currentUser?.emailVerified) {
                        clearInterval(this._pollTimer);
                        this._pollTimer = null;
                        try {
                            await updateDoc(doc(db, 'users', user.uid), { email_verified: true });
                        } catch { /* ignore */ }
                        await signOut(auth).catch(() => {});
                        this.$router.replace({ name: 'SignIn' });
                    }
                } catch { /* ignore */ }
            }, 1000);
        },

        async handleResend() {
            const user = auth.currentUser;
            if (!user) return;

            this.resendLoading = true;
            this.resendSuccess = false;
            this.resendError = '';

            try {
                await sendEmailVerification(user, { url: window.location.origin + '/auth/action' });
                this.resendSuccess = true;
                this.startCooldown(60);
            } catch (err) {
                if (err.code === 'auth/too-many-requests') {
                    this.resendError = 'Too many requests. Please wait before trying again.';
                } else {
                    this.resendError = 'Failed to resend. Please try again.';
                }
            } finally {
                this.resendLoading = false;
            }
        },

        startCooldown(seconds) {
            this.resendCooldown = seconds;
            this._cooldownTimer = setInterval(() => {
                this.resendCooldown--;
                if (this.resendCooldown <= 0) {
                    clearInterval(this._cooldownTimer);
                    this._cooldownTimer = null;
                }
            }, 1000);
        },

        async goToSignIn() {
            await signOut(auth).catch(() => {});
            this.$router.replace({ name: 'SignIn' });
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

.info-text {
    font-size: 1rem;
    color: var(--gray2);
    line-height: 1.8;
    margin-bottom: 1rem;
}

.info-text--secondary {
    font-size: 0.875rem;
    color: var(--gray3);
    margin-bottom: 1.5rem;
}

.email-highlight {
    color: var(--black2);
    font-weight: 700;
}

.resend-msg {
    margin-bottom: 0.75rem;
}

.btn {
  padding: 1rem 0;
  width: 100%;
}

.resend-btn {
    margin: 0.25rem 0 1.5rem 0;
}

.text-link {
    background-color: transparent;
    border: none;
    color: var(--primary);
    font-weight: bold;
}
</style>
