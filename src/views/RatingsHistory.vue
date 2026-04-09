<template>
    <div class="ratings-history-page">
        <!-- Loading State -->
        <div v-if="isPageLoading" class="page-loading">
            <VueSpinner size="40" color="var(--secondary)" :aria-label="`Loading ratings received for ${activeTab} services you provided ...`" />
        </div>

        <div v-else class="ratings-history-content">
            <!-- Page Header -->
            <div class="ratings-history-header">
                <PageHeader :title="isPrivateProfile ? 'My Ratings History' : 
                    (this.username ? `${this.username}'s Ratings History` : 'Ratings History')" />
                <img :src="this.icons[activeTab]" :alt="`${activeTab} icon`" class="category-icon"/>
            </div>

            <!-- Category Tabs -->
            <div class="tabs-container">
                <div class="category-tabs">
                    <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]" @click="switchTab(tab.key)">
                        {{ tab.label }}
                    </button>
                </div>
            </div>

            <div v-if="isRatingsLoading" class="ratings-loading">
                <VueSpinner size="40" color="var(--secondary)" :aria-label="`Loading ratings received for ${activeTab} services you provided ...`" />
            </div>

            <!-- Error State -->
            <div v-else-if="hasError" class="error-state">
                <p>{{ errorMessage }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="displayedRatings.length === 0" class="empty-state">
                <p>No ratings yet for {{ activeTab }} services.</p>
            </div>

            <div v-else class="table-and-btn">
                 <!-- Ratings Table -->
                <div class="table-container">
                    <table class="ratings-history-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Timestamp</th>
                                <th>Rating (Out of 5)</th>
                                <th>New Average Rating</th>
                                <th>Associated Service</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(rating, index) in displayedRatings" :key="rating.id" :class="{ 'even-row': index % 2 === 1 }">
                                <td>{{ index + 1 }}</td>
                                <td>{{ formatTimestamp(rating.rated_at) }}</td>
                                <td>{{ rating.rating }}</td>
                                <td>{{ rating.new_avg_rating.toFixed(1) }}</td>
                                <td class="associated-service-cell">
                                    <router-link :to="`/listing/${rating.listing_id}`" class="listing-title" :title="rating.listing_title">
                                        {{ rating.listing_title }}
                                    </router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- View More Button -->
                <div class="btn-or-spinner">
                    <button v-if="hasMore" class="btn btn-secondary" @click="loadMore">
                        View More
                    </button>
                    <VueSpinner v-else-if="isLoadingMore" size="30" color="var(--secondary)"
                        :aria-label="`Loading more ratings received for ${activeTab} services you provided ...`"/> 
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc } from 'firebase/firestore';
import { getCurrentUser } from '@/auth.js';
import { VueSpinner } from 'vue3-spinners';
import EduIcon from '@/assets/education-icon.png';
import BuddyIcon from '@/assets/buddy-icon.png';
import SurvivalIcon from '@/assets/survival-icon.png';
import PageHeader from '@/components/PageHeader.vue';

const MAX_RATINGS_PER_LOAD = 20;

export default {
    name: 'RatingsHistory',

    components: {
        VueSpinner,
        PageHeader
    },

    data() {
        return {
            activeTab: 'Education',
            tabs: [
                { key: 'Education', label: 'Education' },
                { key: 'Buddy', label: 'Buddy' },
                { key: 'Survival', label: 'Survival' }
            ],
            allRatings: {
                Education: [],
                Buddy: [],
                Survival: []
            },
            lastDocs: {
                Education: null,
                Buddy: null,
                Survival: null
            },
            hasMoreDocs: {
                Education: false,
                Buddy: false,
                Survival: false
            },
            isPageLoading: true,
            isRatingsLoading: false,
            isLoadingMore: false,
            hasError: false,
            errorMessage: "",
            uid: "",
            username: "",
            icons: {
                Education: EduIcon,
                Buddy: BuddyIcon,
                Survival: SurvivalIcon
            }
        };
    },

    computed: {
        isPrivateProfile() {
            return this.$route.name === "MyRatingsHistory";
        },
        displayedRatings() {
            return this.allRatings[this.activeTab];
        },
        hasMore() {
            return this.hasMoreDocs[this.activeTab];
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

        async getUsername() {
            try {
                const userDoc = await getDoc(doc(db, 'users', this.uid));
                if (userDoc.exists()) {
                    this.username = userDoc.data().username || '';
                }
            } catch (e) {
                console.error('Error fetching username:', e);
            }
        },

        async fetchRatings(category) {
            this.isRatingsLoading = true;
            this.hasError = false;
            this.errorMessage = "";

            try {
                const q = query(
                    collection(db, 'ratings'),
                    where('receiver_id', '==', this.uid),
                    where('listing_category', '==', category),
                    orderBy('rated_at', 'desc'),
                    limit(MAX_RATINGS_PER_LOAD + 1) // + 1 for determining whether have more documents to load later
                );

                const snapshot = await getDocs(q);
                const docs = snapshot.docs;

                const hasMore = docs.length > MAX_RATINGS_PER_LOAD;
                this.hasMoreDocs[category] = hasMore;
                const sliced = hasMore ? docs.slice(0, MAX_RATINGS_PER_LOAD) : docs;
                this.lastDocs[category] = sliced.length > 0 ? sliced[sliced.length - 1] : null;
                this.allRatings[category] = sliced.map(doc => ({id: doc.id, ...doc.data()}));
            } catch (e) {
                console.error('Error fetching ratings:', e);
                this.hasError = true;
                this.errorMessage = `Failed to load ratings for ${category} services. Please try again.`;
            } finally {
                this.isRatingsLoading = false;
            }
        },

        async loadMore() {
            if (this.isLoadingMore || !this.hasMore) {
                return;
            }

            this.isLoadingMore = true;
            const category = this.activeTab;

            try {
                const q = query(
                    collection(db, 'ratings'),
                    where('receiver_id', '==', this.uid),
                    where('listing_category', '==', category),
                    orderBy('rated_at', 'desc'),
                    startAfter(this.lastDocs[category]),
                    limit(MAX_RATINGS_PER_LOAD + 1) // + 1 for determining whether have more documents to load later
                );

                const snapshot = await getDocs(q);
                const docs = snapshot.docs;

                const hasMore = docs.length > MAX_RATINGS_PER_LOAD;
                this.hasMoreDocs[category] = hasMore;
                const sliced = hasMore ? docs.slice(0, MAX_RATINGS_PER_LOAD) : docs;
                this.lastDocs[category] = sliced.length > 0 ? sliced[sliced.length - 1] : null;
                const newRatings = sliced.map(doc => ({id: doc.id, ...doc.data()}));
                this.allRatings[category] = [...this.allRatings[category], ...newRatings];
            } catch (e) {
                console.error('Error loading more ratings:', e);
                alert(`Failed to load more ratings for ${this.activeTab} services. Please try again.`);
            } finally {
                this.isLoadingMore = false;
            }
        },

        async switchTab(tab) {
            if (this.activeTab === tab) {
                return;
            }

            this.activeTab = tab;

            // Only fetch if not already loaded
            if (this.allRatings[tab].length === 0 && !this.isLoading) {
                await this.fetchRatings(tab);
            }
        },

        formatTimestamp(timestamp) {
            if (!timestamp) {
                return '-';
            }

            let date;
            if (timestamp.toDate) {
                date = timestamp.toDate();
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else {
                date = new Date(timestamp);
            }

            const pad = n => String(n).padStart(2, '0');
            const day = pad(date.getDate());
            const month = pad(date.getMonth() + 1);
            const year = date.getFullYear();
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
    },

    async created() {
        this.isPageLoading = true;

        this.uid = await this.getUid();

        // get username for public view of ratings history
        if (!this.isPrivateProfile) {
            await this.getUsername();
        }

        if (this.uid) {
            await this.fetchRatings(this.activeTab);
        } else {
            alert('User not found. You will be redirected to your profile page.');
            this.$router.push('/my-profile');
        }

        this.isPageLoading = false;
    },
};
</script>

<style scoped>
.page-loading {
    display: flex;
    margin-top: 30vh;
    justify-content: center;
}

.ratings-history-page {
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
}

.ratings-history-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

/* header */
.ratings-history-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.category-icon {
    width: 5vw;
    height: auto;
}

/* tabs */
.tabs-container {
    border-bottom: 1px solid #E5E9EF;
}

.category-tabs {
    margin: 0 auto;
    display: flex;
    gap: 0.25rem;
}

.tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.125rem;
    font-size: 0.875rem;
    font-weight: medium;
    color: var(--gray3);
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover:not(.active) { 
    color: var(--primary-hover); 
}

.tab-btn.active { 
    color: var(--primary); 
    font-weight: bold; 
    border-bottom-color: var(--primary); 
}

/* states */
.ratings-loading {
    display: flex;
    justify-content: center;
}

.error-state, .empty-state {
    text-align: center;
    padding: 2rem 0;
    font-weight: bold;
    font-size: 1.25rem;
}
.error-text {
    color: var(--error);
}

.empty-state {
    color: var(--black);
}

/* table */
.table-and-btn {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
}

.table-container {
    box-shadow: var(--card-shadow);
    overflow-x: auto;
}

.ratings-history-table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--white);
    font-size: 1rem;
    font-weight: bold;
}

.ratings-history-table thead tr {
    background-color: var(--primary);
    color: var(--white);
}

.ratings-history-table thead th {
    padding: 0.875rem 1.125rem;
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--primary);
    color: var(--white);
}

.ratings-history-table thead th:first-child {
    border-top-left-radius: var(--radius);
    border-bottom-left-radius: var(--radius);
}

.ratings-history-table thead th:last-child {
    border-top-right-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
}

.ratings-history-table tbody tr {
    background-color: var(--white);
    transition: background-color 0.15s;
}

.ratings-history-table tbody tr:hover {
    background-color: #f2f2f2;
}

.ratings-history-table tbody tr.row-even {
    background-color: rgba(224, 224, 224, 0.4);
}

.ratings-history-table tbody tr.row-even:hover {
    background-color: rgba(224, 224, 224, 0.6);
}

.ratings-history-table td {
    padding: 0.875rem 0.5rem;
    color: var(--gray2);
    vertical-align: middle;
}

.associated-service-cell {
    max-width: 60ch;
}

.listing-title {
    text-decoration: underline;
    font-weight: 600;
    white-space: nowrap;
    max-width: 60ch;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

.listing-title:hover {
    color: var(--gray1);
}

/* view more button */
.btn-or-spinner {
    width: 15vw;
    display: flex;
    align-items: center;
    justify-content: center;
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
</style>