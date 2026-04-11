<template>
    <div v-if="show" class="notification-banner" @click="goToProfile">
        <div class="notification-content">
            <p class="notification-title">🎉 Congratulations!</p>
            <p class="notification-message">
                You are top 20 on the leaderboard last month.
                Check your reward in your profile page.
            </p>
            <p class="notification-cta">Click to view →</p>
        </div>
        <button class="notification-close" @click.stop="dismiss">✕</button>
    </div>
</template>

<script>
import { db, auth } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default {
    name: 'RewardNotification',

    data() {
        return {
            show: false,
            timer: null,
        };
    },

    async mounted() {
        await this.checkUnreadNotifications();
    },

    beforeUnmount() {
        if (this.timer) clearTimeout(this.timer);
    },

    methods: {
        async checkUnreadNotifications() {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const snap = await getDocs(query(
                collection(db, 'notifications'),
                where('uid', '==', uid),
                where('type', '==', 'receive_reward'),
                where('is_sent', '==', false)
            ));

            if (snap.empty) return;

            // Mark all as sent
            for (const docSnap of snap.docs) {
                await updateDoc(doc(db, 'notifications', docSnap.id), {
                    is_sent: true
                });
            }

            // Show banner
            this.show = true;

            // Auto dismiss after 8 seconds
            this.timer = setTimeout(() => {
                this.show = false;
            }, 8000);
        },

        goToProfile() {
            this.show = false;
            this.$router.push({ name: 'PrivateProfile' });
        },

        dismiss() {
            this.show = false;
        }
    }
};
</script>

<style scoped>
.notification-banner {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: var(--primary);
    color: white;
    padding: 16px 20px;
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    z-index: 99999;
    max-width: 320px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    transition: opacity 0.3s ease;
}

.notification-banner:hover {
    background-color: var(--primary-hover);
}

.notification-content {
    flex: 1;
}

.notification-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 6px;
}

.notification-message {
    font-size: 13px;
    margin-bottom: 8px;
    line-height: 1.4;
}

.notification-cta {
    font-size: 12px;
    color: var(--secondary);
    font-weight: bold;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    opacity: 0.7;
}

.notification-close:hover {
    opacity: 1;
}
</style>