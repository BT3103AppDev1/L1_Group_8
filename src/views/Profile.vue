<template>
    <div class="profile-page">
        <div v-if="isLoading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" aria-label="Loading profile..." />
        </div>
        <div v-else class="profile-page-content">
            <div v-if="isPrivateProfile" class="private-profile-header">
                <PageHeader title="My Profile" />
                <router-link to="/edit-profile" class="edit-icon" aria-label="Edit profile">
                    <SquarePen :size="28" color="var(--secondary)"/>
                </router-link>
            </div>

            <div class="profile-content">
                <div class="profile-left">
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
                                    <span class="preference-icon">
                                        <CircleCheck color="var(--success)" size="20"/>
                                    </span>
                                    Accept Calls
                                </div>
                                <div v-if="profileData.accept_messages" class="contact-preference">
                                    <span class="preference-icon">
                                        <CircleCheck color="var(--success)" size="20"/>
                                    </span>
                                    Accept Messages
                                </div>
                                <div v-if="profileData.accept_whatsapp" class="contact-preference">
                                    <span class="preference-icon">
                                        <CircleCheck color="var(--success)" size="20"/>
                                    </span>
                                    Accept WhatsApp
                                </div>
                            </div>
                            <div v-if="profileData.telegram_handle" class="contact-info">
                                Telegram: {{ profileData.telegram_handle }}
                            </div>
                        </div>
                    </div>
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
                                <span class="rating-category">{{ rating.category }}</span>
                                <span v-if="rating.count" class="rating-value">{{ rating.value.toFixed(1) }} / 5.0 </span>
                                <span v-if="rating.count" class="rating-count">({{ rating.count }} ratings received)</span>
                                <span v-else class="rating-value">No ratings yet</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="vertical-divider"></div>

                <div class="points-container">
                    <h3 class="points-title">Total Points</h3>
                    <div class="points-content">
                        <div class="points-text">
                            <span class="points-value">{{ profileData.total_points }}</span>
                            <span class="points-rank">
                                (Top {{ profileData.is_in_top_20 ? profileData.absolute_rank : (profileData.percentage_rank + '%') }})
                            </span>
                        </div>
                        <router-link to="/my-points-history" class="btn btn-secondary">
                            Show Points History
                        </router-link>
                    </div>
                </div>
            </div>

            <div v-if="isPrivateProfile" class="sign-out-section">
                <button class="btn btn-danger" @click="showSignOutModal = true">
                    Sign Out
                </button>
            </div>
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
import { SquarePen, CircleCheck } from 'lucide-vue-next';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { VueSpinner } from 'vue3-spinners';
import { db, auth } from '@/firebase.js';
import { signOut } from 'firebase/auth';
import { getCurrentUser } from '@/auth.js';
import { doc, onSnapshot } from 'firebase/firestore';

export default {
    name: 'Profile',
    components: {
        PageHeader,
        SquarePen,  
        CircleCheck,
        ConfirmationModal,
        VueSpinner,
    },
    data() {
        return {
            isLoading: true,

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
                    icon: "@/assets/education-icon.png", 
                    value: this.profileData ? this.profileData.edu_avg_rating : null, 
                    count: this.profileData ? this.profileData.edu_rating_count : 0
                },
                {
                    category: 'Buddy', 
                    icon: "@/assets/buddy-icon.png", 
                    value: this.profileData ? this.profileData.buddy_avg_rating : null, 
                    count: this.profileData ? this.profileData.buddy_rating_count : 0
                },
                {
                    category: 'Survival', 
                    icon: "@/assets/survival-icon.png", 
                    value: this.profileData ? this.profileData.survival_avg_rating : null, 
                    count: this.profileData ? this.profileData.survival_rating_count : 0
                }
            ];
        }
    },

    methods: {
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
        this.setUserListener();
    },
    
    beforeUnmount() {
        if (this.unsubscribeUser) {
            this.unsubscribeUser();
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

.profile-content {
    display: flex;
    gap: 2rem;
    width: 100%;
}

.profile-left {
    display: flex;
    flex-direction: column;
    gap: 5rem;
    flex: 1;
}

.profile-info-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.profile-pic {
    border-radius: 50%;
    object-fit: cover;
    width: 13vw;
    height: 13vw;
}

.profile-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.username {
    font-size: 2.5rem;
    font-weight: bold;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.mobile-number {
    font-size: 1.25rem;
    font-weight: bold;
}

.contact-preference {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
}

.ratings-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.ratings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ratings-title, .points-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--primary);
}

.ratings-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.ratings-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.rating-icon {
    width: 3vw;
    height: auto;
}

.rating-category {
    font-size: 1.5rem;
    font-weight: bold;
}

.rating-value {
    font-size: 1.25rem;
    font-weight: bold;
}

.rating-count {
    font-size: 1.25rem;
}

.vertical-divider {
    margin: 0.5rem 2rem;
    border: none;
    width: 1px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
}

.points-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
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

.points-value, .points-rank {
    font-size: 1.5rem;
    font-weight: bold;
}

.sign-out-section {
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