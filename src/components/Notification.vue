<template>
    <div class="notification-banner">
        <div v-if="notif.type === 'receive_applicant'" class="notification-content">
            <p class="notification-title">
                <span class="title-icon">📢</span>
                <span class="title-text">New {{ singleApplicant ? 'Applicant' : 'Applicants' }}</span>
            </p>
            <p class="notification-message">
                {{ applicantMsg }}
            </p>
            <router-link to="/my-listings" class="notification-cta" @click="$emit('closeNotif')">
                See in My Listings →
            </router-link>
        </div>

        <div v-else-if="notif.type === 'application_success'" class ="notification-content">
            <p class="notification-title">
                <span class="title-icon">✅</span>
                <span class="title-text">{{ singleSuccess ? 'Application' : 'Applications' }} Successful</span>
            </p>
            <p class="notification-message">
                {{ successMsg }}
            </p>
            <router-link :to="{ path: '/my-gigs', query: { 'initial-tab': 'ongoing' }}" class="notification-cta" @click="$emit('closeNotif')">
                See in My Gigs →
            </router-link>
        </div>
        
        <div v-else-if="notif.type === 'application_fail'" class ="notification-content">
            <p class="notification-title">
                <span class="title-icon">❌</span>
                <span class="title-text">{{ singleFail ? 'Application' : 'Applications' }} Unsuccessful</span>
            </p>
            <p class="notification-message">
                {{ failMsg }}
            </p>
            <router-link to="/my-gigs" class="notification-cta" @click="$emit('closeNotif')">
                See in My Gigs →
            </router-link>
        </div>

        <div v-else-if="notif.type === 'receive_reward'" class="notification-content">
            <p class="notification-title">
                <span class="title-icon">🎉</span>
                <span class="title-text">Congratulations</span>
            </p>
            <p class="notification-message">
                {{ rewardMsg }}
            </p>
            <router-link to="/my-profile" class="notification-cta" @click="$emit('closeNotif')">See in Profile page →</router-link>
        </div>

        <div v-else-if="notif.type === 'points_change'" class="notification-content">
            <p class="notification-title">
                <span class="title-icon" v-if="isPointsEarnedIcon">💰</span>
                <span class="title-icon" v-else>🌱</span>
                <span class="title-text">{{ pointsTitle }}</span>
            </p>
            <p class="notification-message">
                {{ pointsMsg }}
            </p>
            <router-link to="/my-profile" class="notification-cta" @click="$emit('closeNotif')">See in Profile page →</router-link>
        </div>
        <button class="notification-close" @click.stop="$emit('closeNotif')">&times;</button>
    </div>
</template>

<script>
import { getMonthYearString } from '@/utils/formatSgtTime';
export default {
    name: 'Notification',

    props: {
        notif: {
            type: Object,
            required: true,
        },
    },

    computed: {
        singleApplicant() {
            return this.notif.type === "receive_applicant" 
                && this.notif.listings.length === 1 
                && this.notif.listings[0].count === 1;
        }, 

        applicantMsg() {
            if (this.notif.type === "receive_applicant") {
                return 'You have received ' + this.notif.listings
                    .map(listing => {
                        if (listing.count > 1) {
                            return `${listing.count} new applicants for listing "${listing.title}"`;
                        } else {
                            return `1 new applicant for listing "${listing.title}"`;
                        }
                    }).join(', ') + '.';
            } else {
                return '';
            }
        },

        singleSuccess() {
            return this.notif.type === "application_success" 
                && this.notif.listings.length === 1;
        },

        successMsg() {
            if (this.notif.type === "application_success") {
                if (this.notif.listings.length === 1) {
                    return `You have been selected to provide the service for listing "${this.notif.listings[0]}".`;
                } else {
                    return 'You have been selected to provide services for the following listings: ' + this.notif.listings
                        .map(title => `"${title}"`)
                        .join(', ') + '.';
                }
            } else {
                return '';
            }
        },

        singleFail() {
            return this.notif.type === "application_fail" 
                && this.notif.listings.length === 1;
        },

        failMsg() {
            if (this.notif.type === "application_fail") {
                if (this.notif.listings.length === 1) {
                        return `Unfortunately, you were not selected for listing "${this.notif.listings[0]}". We appreciate your willingness to help!`;
                } else {
                    return 'Unfortunately, you were not selected for the following listings: ' + this.notif.listings
                        .map(title => `"${title}"`)
                        .join(', ') + '. We appreciate your willingness to help!';
                }
            } else {
                return '';
            }
        },

        rewardMsg() {
            if (this.notif.type === "receive_reward") {
                if (this.notif.months.length === 1) {
                    return `You are top 20 on the leaderboard in ${getMonthYearString(this.notif.months[0])}. Check your reward in your profile page.`;
                } else {
                    return `You are top 20 on the leaderboard in the following months: ${this.notif.months.map(getMonthYearString).join(', ')}. Check your rewards in your profile page.`;
                }
            } else {
                return '';
            }
        },

        isPointsEarnedIcon() {
            return this.notif.type === "points_change" && !this.notif.reset;
        },

        pointsTitle() {
            if (this.notif.type === "points_change") {
                if (this.notif.reset) {
                    return 'New Month, Fresh Start';
                } else {
                    return 'Points Earned';
                }
            } else {
                return '';
            }
        },

        pointsMsg() {
            let msg = '';
            if (this.notif.type === "points_change") {
                const monthYearStr = getMonthYearString(this.notif.sgtYearMonth);
                if (this.notif.reset) {
                    if (!this.notif.receive) {
                        return `${monthYearStr} has begun and your points have been reset to 0. Keep helping others to earn points and climb the leaderboard this month!`;
                    } else {
                        msg += `Your points have been reset to 0 at the start of ${monthYearStr}. In ${monthYearStr}: `;
                    }
                } 
                if (this.notif.receive?.rating && this.notif.receive?.listing_title) {
                    msg += `You have received a ${this.notif.receive?.rating}⭐ rating for listing "${this.notif.receive?.listing_title}", earning ${this.notif.receive?.points} points.`;
                } else if (this.notif.receive) {
                    msg += `You have received ${this.notif.receive?.ratingCounts} ratings, earning a total of ${this.notif.receive?.points} points.`;
                }
                return msg;
            } else {
                return '';
            }
        },
    },
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

.notification-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.notification-title {
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 6px;
    display: flex;  
    align-items: center;
    gap: 0.5rem;
}

.notification-message {
    font-size: 0.875rem;
    margin-bottom: 8px;
    line-height: 1.4;
}

.notification-cta {
    font-size: 0.875rem;
    color: #f4a754;
    font-weight: bold;
    text-decoration: none;
}

.notification-close {
    background: none;
    border: none;
    color: var(--white);
    font-size: 1.125rem;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    opacity: 0.7;
}

.notification-close:hover {
    opacity: 1;
}
</style>