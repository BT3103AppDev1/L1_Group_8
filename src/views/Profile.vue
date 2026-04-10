<template>
    <div class="profile-page">
        <div v-if="isLoading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" aria-label="Loading profile..." />
        </div>

        <div v-else class="profile-page-content">
            <div :class="['profile-left-container', isPrivateProfile ? 'private-margin' : 'public-margin']">
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
                </div>
            </div>

            <div class="vertical-divider"></div>

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
                        <div v-if="!totalPoints" class="helper-text">
                            Only users with positive points are ranked. <br />
                            Earn points by helping others to unlock your rank!
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
import { doc, onSnapshot } from 'firebase/firestore';
import defaultProfilePic from '@/assets/default-profile-pic.png';
import eduIcon from '@/assets/education-icon.png';
import buddyIcon from '@/assets/buddy-icon.png';
import survivalIcon from '@/assets/survival-icon.png';
import AwaitingListings from '@/components/AwaitingListings.vue';
import { getSgtYearMonth, getMsToSgtNextMonth } from '@/utils/formatSgtTime';

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
        AwaitingListings
    },
    data() {
        return {
            refreshTimer: null,
            isLoading: true,

            defaultProfilePic,
            profileData: null,

            // Firestore listener unsubscribe functions
            unsubscribeUser: null,

            showSignOutModal: false,
            isSigningOut: false,
        };
    },

    computed: {
        isPrivateProfile() {  
            return this.$route.name === "PrivateProfile";
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
            if (!uid) {
                this.isLoading = false;
                return;
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

        async handleSignOut() {
            this.isSigningOut = true;
            try {
                await signOut(auth);
                this.$router.replace('/sign-in');
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

.private-margin {
    margin: 4rem 0;
}

.public-margin {
    margin: 7rem 0;
}

.profile-left {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
}

.private-profile-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
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
    gap: 3vw;
}

.profile-pic-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.profile-pic {
    border-radius: 50%;
    object-fit: cover;
    width: 11vw;
    height: 11vw;
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

.sign-out-section {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
}

.btn {
    display: flex;
    justify-content: center;
    align-content: center;
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