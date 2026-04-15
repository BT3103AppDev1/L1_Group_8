<template>
    <div class="profile-page">
        <div v-if="isLoading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" aria-label="Loading profile..." />
        </div>

        <div v-else class="profile-page-content">
            <div :class="['profile-left-container', isPrivateProfile ? 'private-left-margin' : 'public-left-margin']">
                <div class="profile-left">
                    <div v-if="isPrivateProfile" class="private-profile-header">
                        <PageHeader title="My Profile" />
                        <router-link to="/edit-profile" class="edit-icon" aria-label="Edit profile">
                            <SquarePen :size="28" color="var(--secondary)"/>
                        </router-link>
                    </div>
                    <div class="profile-info-container">
                        <div class="profile-pic-container">
                            <img :src="profileData.profile_pic_url ? profileData.profile_pic_url : defaultProfilePic" :alt="`Profile picture of ${profileData.username}`" 
                                class="profile-pic"/>
                        </div>
                        <div class="profile-info">
                            <h3 class="username">{{ profileData.username }}</h3>
                            <div v-if="profileData.mobile_number" class="contact-info">
                                <div v-if="profileData.mobile_number" class="mobile-number">
                                    Mobile: {{ profileData.dial_code }} {{ profileData.mobile_number }}
                                </div>
                                <div v-if="profileData.accept_calls" class="contact-preference">
                                    <div class="preference-icon">
                                        <Check color="var(--white)" size="14" :stroke-width="3.5"/>
                                    </div>
                                    Accept Calls
                                </div>
                                <div v-if="profileData.accept_messages" class="contact-preference">
                                    <div class="preference-icon">
                                        <Check color="var(--white)" size="14" :stroke-width="3.5"/>
                                    </div>
                                    Accept Messages
                                </div>
                                <div v-if="profileData.accept_whatsapp" class="contact-preference">
                                    <div class="preference-icon">
                                        <Check color="var(--white)" size="14" :stroke-width="3.5"/>
                                    </div>
                                    Accept WhatsApp
                                </div>
                            </div>
                            <div v-if="profileData.telegram_handle" class="contact-info telegram-handle">
                                Telegram: @{{ profileData.telegram_handle }}
                            </div>
                        </div>
                    </div>

                    <div v-if="isPrivateProfile" class="analytics-section">
                        <div class="analytics-total">
                            <span class="analytics-number">{{ totalProfileClicks }}</span>
                            <span class="analytics-label">Total Listing Views</span>
                        </div>
                        <p class="analytics-subtitle">
                            {{ activeView === 'today' ? 'Clicks by hour today across all your listings' : 'Daily clicks on your listings over the last 7 days' }}
                        </p>
                        <div class="chart-toggle">
                            <button :class="['toggle-btn', { active: activeView === 'today' }]" @click="activeView = 'today'">Today</button>
                            <button :class="['toggle-btn', { active: activeView === 'week' }]" @click="activeView = 'week'">Last 7 Days</button>
                        </div>
                        <Bar v-if="activeView === 'week'" :data="profileChartData" :options="profileChartOptions" />
                        <Bar v-else :data="todayProfileChartData" :options="profileChartOptions" />
                    </div>
                </div>
            </div>

            <div class="vertical-divider"></div>

            <div :class="['profile-right-container', isPrivateProfile ? 'private-right-margin' : 'public-right-margin']">
                <div class="profile-right">
                    <div class="ratings-container">
                        <div class="ratings-header">
                            <h3 class="ratings-title">Ratings</h3>
                            <router-link :to="ratingsHistPath" class="btn btn-secondary">
                                Show Ratings History
                            </router-link>
                        </div>
                        <div class="ratings-list">
                            <div v-for="rating in ratings" :key="rating.category" class="rating-item">
                                <img :src="rating.icon" :alt="`${rating.category} icon`" class="rating-icon"/>
                                <div class="rating-text">
                                    <span class="rating-category">{{ rating.category }}: </span>
                                    <span v-if="rating.count" class="rating-value">{{ rating.value.toFixed(1) }} / 5.0 </span>
                                    <span v-else class="rating-value">N/A</span>
                                    <span class="rating-count">({{ rating.count }} ratings received)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="points-container">
                        <h3 class="points-title">Total Points</h3>
                        <div class="points-content-container">
                            <div class="points-content">
                                <div class="points-text">
                                    <span class="points-value">{{ totalPoints }} points</span>
                                    <span v-if="totalPoints" class="points-rank">
                                        (Top {{ (absoluteRank <= 20) ? absoluteRank : (percentageRank + '%') }})
                                    </span>
                                    <span v-else class="points-rank rank-unavailable">
                                        (Rank unavailable)
                                    </span>
                                </div>
                                <router-link to="/my-points-history" class="btn btn-secondary">
                                    Show Points History
                                </router-link>
                            </div>
                            <div v-if="!totalPoints && isPrivateProfile" class="helper-text">
                                Only users with positive points are ranked. <br />
                                Earn points by helping others to unlock your rank!
                            </div>
                        </div>
                </div>
            </div>
            </div>
        </div>

        <div v-if="!isPrivateProfile" class="awaiting-listings-section">
            <AwaitingListings :key="$route.params.uid" :uid="$route.params.uid" :username="profileData.username"/>
        </div>

        <div v-if="isPrivateProfile" class="my-rewards-section">
            <TheMyRewardSection />
        </div>

        <div v-if="isPrivateProfile" class="sign-out-section">
            <button class="btn btn-danger" @click="showSignOutModal = true">
                Sign Out
            </button>
        </div>

        <div v-if="!isPrivateProfile && isOwnProfilePublicView" class="info-banner">
            This is how your profile appears to others. 
            Go to <router-link to="/my-profile" class="text-btn">My Profile</router-link> to edit your profile and view your rewards.
        </div>

        <!-- sign out confirmation modal -->
        <confirmation-modal v-model:showModal="showSignOutModal" title="Sign out?">
            Are you sure you want to sign out?

            <template #buttons>
                <button class="btn cancel-btn modal-btn" 
                    :disabled="isSigningOut" @click="showSignOutModal = false">
                        Cancel
                </button>
                <div class="btn-or-spinner">
                    <button class="btn btn-danger modal-btn" v-if="!isSigningOut" @click="handleSignOut">
                        Confirm
                    </button>
                    <VueSpinner v-else size="30" color="var(--secondary)" aria-label="Signing out..." />
                </div>
            </template>
        </confirmation-modal>
    </div>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue';
import { SquarePen, Check } from 'lucide-vue-next';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { VueSpinner } from 'vue3-spinners';
import { db, auth } from '@/firebase.js';
import { signOut } from 'firebase/auth';
import RewardCard from '@/components/RewardCard.vue';
import RewardDetails from './RewardDetails.vue';
import TheMyRewardSection from '@/components/TheMyRewardSection.vue';
import { getCurrentUser } from '@/auth.js';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import defaultProfilePic from '@/assets/default-profile-pic.png';
import eduIcon from '@/assets/education-icon.png';
import buddyIcon from '@/assets/buddy-icon.png';
import survivalIcon from '@/assets/survival-icon.png';
import AwaitingListings from '@/components/AwaitingListings.vue';
import { getSgtYearMonth, getMsToSgtNextMonth } from '@/utils/formatSgtTime';
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { uid } from 'chart.js/helpers';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default {
    name: 'Profile',
    components: {
        PageHeader,
        SquarePen,
        Check,
        ConfirmationModal,
        VueSpinner,
        RewardCard,
        RewardDetails,
        TheMyRewardSection,
        AwaitingListings,
        Bar,
    },
    data() {
        return {
            refreshTimer: null,
            isLoading: true,

            uid: null,
            defaultProfilePic,
            profileData: null,

            unsubscribeUser: null,

            showSignOutModal: false,
            isSigningOut: false,

            clicksByDay: {},
            clicksByHour: {},
            activeView: 'week',
        };
    },

    computed: {
        isPrivateProfile() {  
            return this.$route.name === "PrivateProfile";
        },

        isOwnProfilePublicView() {
            return this.$route.params.uid === this.uid;
        },

        ratingsHistPath() {
            return this.isPrivateProfile ? '/my-ratings-history' : `/users/${this.$route.params.uid}/ratings-history`;
        },

        ratings() {
            return [
                {
                    category: 'Education', 
                    icon: eduIcon, 
                    value: this.profileData ? this.profileData.edu_avg_rating : null, 
                    count: this.profileData ? this.profileData.edu_rating_count : 0
                },
                {
                    category: 'Buddy', 
                    icon: buddyIcon, 
                    value: this.profileData ? this.profileData.buddy_avg_rating : null, 
                    count: this.profileData ? this.profileData.buddy_rating_count : 0
                },
                {
                    category: 'Survival', 
                    icon: survivalIcon, 
                    value: this.profileData ? this.profileData.survival_avg_rating : null, 
                    count: this.profileData ? this.profileData.survival_rating_count : 0
                }
            ];
        },

        yearMonth() {
            return getSgtYearMonth();
        },

        totalPoints() {
            return this.profileData?.total_points?.[this.yearMonth] ?? 0;
        },

        absoluteRank() {
            return this.profileData?.absolute_rank?.[this.yearMonth] ?? null;
        },

        percentageRank() {
            return this.profileData?.percentage_rank?.[this.yearMonth] ?? null;
        },

        totalProfileClicks() {
            return Object.values(this.clicksByDay).reduce((sum, v) => sum + v, 0);
        },

        profileChartData() {
            // Last 7 days in SGT
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
                days.push(key);
            }
            return {
                labels: days.map(date => {
                    const [,, day] = date.split('-');
                    return `${parseInt(day)} ${new Date(date).toLocaleString('en-GB', { month: 'short' })}`;
                }),
                datasets: [{
                    data: days.map(date => this.clicksByDay[date] ?? 0),
                    backgroundColor: days.map((date, i) => i === 6 ? '#7C3AED' : '#003D7C22'),
                    borderRadius: 4,
                }],
            };
        },

        todayProfileChartData() {
            const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
            const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
            return {
                labels: hours.map(h => {
                    const hr = parseInt(h);
                    if (hr === 0) return '12am';
                    if (hr < 12) return `${hr}am`;
                    if (hr === 12) return '12pm';
                    return `${hr - 12}pm`;
                }),
                datasets: [{
                    data: hours.map(h => this.clicksByHour[`${todayKey}_${h}`] ?? 0),
                    backgroundColor: hours.map((h, i) => {
                        const now = new Date();
                        const currentHour = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Singapore', hour: '2-digit', hour12: false }).format(now));
                        return i === currentHour ? '#7C3AED' : 'rgba(124,58,237,0.2)';
                    }),
                    borderRadius: 4,
                }],
            };
        },

        profileChartOptions() {
            return {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            };
        },
    },

    methods: { 
        scheduleMonthlyRefresh() {
            const msToNextMonth = getMsToSgtNextMonth();
            this.refreshTimer = setTimeout(() => {
                this.setUserListener(); 
                this.scheduleMonthlyRefresh(); 
            }, msToNextMonth);
        },

        async getUid() {
            if (this.isPrivateProfile) {
                const user = await getCurrentUser();
                return user ? user.uid : null;
            } else {
                return this.$route.params.uid;
            }
        },

        async setUserListener() {
            const uid = await this.getUid();
            this.uid = uid; // store uid for later use
            if (!uid) {
                this.isLoading = false;
                return;
            }

            if (this.isPrivateProfile) {
                this.fetchListingClicks(uid);
            }

            // Listen to profile data changes
            const userRef = doc(db, 'users', uid);
            this.unsubscribeUser = onSnapshot(userRef, doc => {
                if (doc.exists) {
                    this.profileData = doc.data();
                    this.isLoading = false;
                } else {
                    console.error("User document not found");
                    this.isLoading = false;
                }
            }, error => {
                console.error("Error fetching user data:", error);
                this.isLoading = false;
            });
        },

        async fetchListingClicks(uid) {
            const snap = await getDocs(query(collection(db, 'listings'), where('lister_id', '==', uid)));
            const mergedDay = {};
            const mergedHour = {};
            snap.forEach(docSnap => {
                const data = docSnap.data();
                Object.entries(data.clicks_by_day ?? {}).forEach(([date, count]) => {
                    mergedDay[date] = (mergedDay[date] ?? 0) + count;
                });
                Object.entries(data.clicks_by_hour ?? {}).forEach(([key, count]) => {
                    mergedHour[key] = (mergedHour[key] ?? 0) + count;
                });
            });
            this.clicksByDay = mergedDay;
            this.clicksByHour = mergedHour;
        },

        async handleSignOut() {
            this.isSigningOut = true;
            try {
                await signOut(auth);
                this.$router.replace('/auth');
            } catch (error) {
                console.error('Error signing out:', error);
                alert("Something went wrong while signing out. Please try again.")
            } finally {
                this.isSigningOut = false;
                this.showSignOutModal = false;
            }
        }
    },

    created() {
        this.scheduleMonthlyRefresh();
        this.setUserListener();
    },
    
    beforeUnmount() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
        }
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    }
}
</script>

<style scoped>
.loading {
    display: flex;
    margin-top: 30vh;
    justify-content: center;
}

.profile-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.25rem;
}

.profile-page-content {
    display: flex;
    gap: 2rem;
    width: 100%;
    align-items: stretch;
    justify-content: center;
}

.profile-left-container {
    display: flex;
    flex: 1;
}

.private-left-margin {
    margin: 0;
}

.public-left-margin {
    margin: 7rem 0;
}

.profile-left {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.private-profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.edit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: opacity 0.3s ease;
}

.edit-icon:hover {
    color: var(--primary-hover);
}

.profile-info-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 2vw;
}

.profile-pic-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.profile-pic {
    border-radius: 50%;
    object-fit: cover;
    width: 9vw;
    height: 9vw;
    border: 2px solid var(--gray5);
}

.profile-info {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
}

.username {
    font-size: 2rem;
    font-weight: bold;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.mobile-number, .telegram-handle {
    font-size: 1.125rem;
    font-weight: bold;
}

.contact-preference {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 1rem;
}

.preference-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background-color: var(--success);
    border-radius: 50%;
}

.vertical-divider {
    margin: 0 1.5rem;
    border: none;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.1);
}

.profile-right-container {
    display: flex;
    flex: 1;
}

.private-right-margin {
    margin: 5rem 0;
}

.public-right-margin {
    margin: 0;
}

.profile-right {
    display: flex;
    flex-direction: column;
    gap: 4rem;
    flex: 1;
}

.ratings-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.ratings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ratings-title, .points-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary);
}

.ratings-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.rating-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.rating-icon {
    width: 3vw;
    height: auto;
}

.rating-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.rating-category {
    font-size: 1.25rem;
    font-weight: bold;
}

.rating-value {
    font-size: 1.25rem;
    font-weight: bold;
}

.rating-count {
    font-size: 1rem;
}

.points-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.points-content-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.points-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.points-text {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.points-value {
    font-size: 1.25rem;
    font-weight: bold;
}

.points-rank {
    font-size: 1rem;
}

.rank-unavailable {
    color: var(--gray3);
}

.helper-text {
    font-size: 0.875rem;
    color: var(--gray3);
    text-align: start;
}

.analytics-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    max-width: 35vw;
    margin: 0.75rem 0;
}
.analytics-total {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 4px;
}
.analytics-number {
    font-size: 48px;
    font-weight: 700;
    color: var(--primary);
    line-height: 1;
}
.analytics-label {
    font-size: 16px;
    font-weight: 600;
    color: #6E6E6E;
}
.analytics-subtitle {
    font-size: 12px;
    color: #9CA3AF;
    margin-bottom: 8px;
}
.chart-toggle {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
}
.toggle-btn {
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--primary);
    border-radius: 999px;
    background: none;
    color: var(--primary);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}
.toggle-btn.active {
    background: var(--primary);
    color: #fff;
}

.sign-out-section {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
}

.btn {
    padding: 0.75rem 0;
    width: 15vw;
}

.btn:disabled {
    background-color: var(--gray5);
    border: var(--gray5);
    color: var(--white);
    cursor: not-allowed;
}

.btn-or-spinner {
    width: 15vw;
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--primary);
    color: white;
    padding: 1rem max(2rem, 7vw);
    z-index: 1000;
    font-size: 1rem;
}

.text-btn {
    margin: 0 0.4rem;
    color: var(--white);
    text-decoration: none;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
}

.cancel-btn {
    background: var(--gray4);
    color: var(--white);
}

.cancel-btn:hover {
    background-color: var(--gray5);
}

.modal-btn {
    width: 15vw;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>