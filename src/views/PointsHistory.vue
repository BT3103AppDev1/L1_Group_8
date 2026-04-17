<template>
    <div class="points-history-page">
        <!-- Page Header -->
        <PageHeader title="My Points History"/>    
        
        <transition name="fade" mode="out-in">
            <div :key="lastFetchedAt" class="points-history-content">
                <p v-if="lastFetchedAt" class="fetch-time-text"> 
                    Last fetched at: {{ formatTimestamp(lastFetchedAt) }} (SGT). Unable to see your latest ratings? 
                    <button class="refresh-button" @click="refresh">Click to Refresh</button>
                </p>

                <!-- Loading State -->
                <div v-if="isLoading" class="loading">
                    <VueSpinner size="30" color="var(--secondary)" aria-label="Loading points history..." />
                </div>

                <!-- Error State -->
                <div v-else-if="hasError" class="error-state">
                    <p>{{ errorMessage }}</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="pointsLogs.length === 0" class="empty-state">
                    <p>You have not received any points yet for this month.</p>
                </div>

                <div v-else class="table-and-btn">
                <div class="table-and-text">
                    <!-- Points Table -->
                        <div class="table-container" :key="this.lastFetchedAt">
                            <table class="points-history-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Timestamp (SGT)</th>
                                        <th>Points Change</th>
                                        <th>New Total Points</th>
                                        <th>Associated Service</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(pointsLog, index) in pointsLogs" :key="pointsLog.id" :class="{ 'even-row': index % 2 === 1 }">
                                        <td :title="`No: ${index + 1}`">{{ index + 1 }}</td>
                                        <td :title="`Timestamp (SGT): ${formatTimestamp(pointsLog.time)}`">{{ formatTimestamp(pointsLog.time) }}</td>
                                        <td :title="`Points Change: ${pointsLog.increase_in_points}`">{{ pointsLog.increase_in_points }}</td>
                                        <td :title="`New Total Points: ${pointsLog.new_total_points}`">{{ pointsLog.new_total_points }}</td>
                                        <td class="associated-service-cell">
                                            <router-link :to="`/listing/${pointsLog.listing_id}`" class="listing-title" :title="`Associated Service: ${pointsLog.listing_title}`">
                                                {{ pointsLog.listing_title }}
                                            </router-link>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- View More Button -->
                    <div class="btn-or-spinner">
                        <VueSpinner v-if="isLoadingMore" size="30" color="var(--secondary)"
                            aria-label="Loading more points history..."/> 
                        <button v-else-if="hasMoreDocs" class="btn btn-secondary" @click="loadMore">
                            View More
                        </button>
                    </div>
                </div>
            </div>
        </transition>   
    </div>
</template>

<script>
import { db } from '@/firebase';
import { collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc } from 'firebase/firestore';
import { getCurrentUser } from '@/auth.js';
import { VueSpinner } from 'vue3-spinners';
import PageHeader from '@/components/PageHeader.vue';
import { formatTimestamp, getSgtYearMonth, getMsToSgtNextMonth } from '@/utils/formatSgtTime.js';
import { last } from 'firebase/firestore/pipelines';

const MAX_LOGS_PER_LOAD = 20;

export default {
    name: 'PointsHistory',

    components: {
        VueSpinner,
        PageHeader
    },

    data() {
        return {
            refreshTimer: null,
            pointsLogs: [],
            lastDocs: null,
            hasMoreDocs: false,
            isLoading: true,
            isLoadingMore: false,
            hasError: false,
            errorMessage: "",
            uid: "",
            currYearMonth: getSgtYearMonth(),
            lastFetchedAt: null,
        };
    },

    methods: {
        formatTimestamp,

        scheduleMonthlyRefresh() {
            const msToNextMonth = getMsToSgtNextMonth();
            this.refreshTimer = setTimeout(() => {
                this.fetchPointsLogs(); 
            }, msToNextMonth);
        },

        async getUid() {
            const user = await getCurrentUser();
            return user ? user.uid : null;
        },

        async fetchPointsLogs() {
            this.isLoading = true;
            this.pointsLogs = [];
            this.hasError = false;
            this.errorMessage = "";
            this.lastDocs = null;
            this.hasMoreDocs = false;

            try {
                const q = query(
                    collection(db, 'pointsLogs'),
                    where('uid', '==', this.uid),
                    where('sgt_year_month', '==', this.currYearMonth),
                    orderBy('time', 'desc'),
                    limit(MAX_LOGS_PER_LOAD + 1) // + 1 for determining whether have more documents to load later
                );

                const snapshot = await getDocs(q);
                const docs = snapshot.docs;

                const hasMore = docs.length > MAX_LOGS_PER_LOAD;
                this.hasMoreDocs = hasMore;
                const sliced = hasMore ? docs.slice(0, MAX_LOGS_PER_LOAD) : docs;
                this.lastDocs = sliced.length > 0 ? sliced[sliced.length - 1] : null;
                this.pointsLogs = sliced.map(doc => ({id: doc.id, ...doc.data()}));
                this.lastFetchedAt = new Date();
            } catch (e) {
                console.error('Error fetching points history:', e);
                this.hasError = true;
                this.errorMessage = `Failed to load points history. Please try again.`;
            } finally {
                this.isLoading = false;
            }
        },

        async loadMore() {
            if (this.isLoadingMore || !this.hasMoreDocs) {
                return;
            }

            this.isLoadingMore = true;
            
            try {
                const q = query(
                    collection(db, 'pointsLogs'),
                    where('uid', '==', this.uid),
                    where('sgt_year_month', '==', this.currYearMonth),
                    orderBy('time', 'desc'),
                    startAfter(this.lastDocs),
                    limit(MAX_LOGS_PER_LOAD + 1) // + 1 for determining whether have more documents to load later
                );

                const snapshot = await getDocs(q);
                const docs = snapshot.docs;

                const hasMore = docs.length > MAX_LOGS_PER_LOAD;
                this.hasMoreDocs = hasMore;
                const sliced = hasMore ? docs.slice(0, MAX_LOGS_PER_LOAD) : docs;
                this.lastDocs = sliced.length > 0 ? sliced[sliced.length - 1] : null;
                const newLogs = sliced.map(doc => ({id: doc.id, ...doc.data()}));
                this.pointsLogs = [...this.pointsLogs, ...newLogs];
            } catch (e) {
                console.error('Error loading more points logs:', e);
                alert(`Failed to load more points logs. Please try again.`);
            } finally {
                this.isLoadingMore = false;
            }
        },

        async refresh() {
            await this.fetchPointsLogs();
        }
    },

    async created() {
        this.isLoading = true;

        this.scheduleMonthlyRefresh();

        this.uid = await this.getUid();

        if (this.uid) {
            await this.fetchPointsLogs();
        } else {
            alert('User not found. You will be redirected to your profile page.');
            this.$router.push('/my-profile');
        }

        this.isLoading = false;
    },

    beforeUnmount() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    }
};
</script>

<style scoped>
.points-history-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

.points-histtory-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

/* states */
.loading {
    display: flex;
    justify-content: center;
}

.error-state, .empty-state {
    text-align: center;
    padding: 2rem 0;
    font-weight: bold;
    font-size: 1.25rem;
}

.error-state {
    color: var(--error);
}

.empty-state {
    color: var(--black);
}

/* fetch time text */
.fetch-time-text {
    width: 100%;
    text-align: left;
    font-size: 0.875rem;
    color: var(--gray2);
    margin-bottom: 1rem;
}

/* refresh button */
.refresh-button {
    background-color: transparent;
    border: none;
    color: var(--primary);
    font-size: 0.875rem;
    font-weight: bold;
    cursor: pointer;
}

.refresh-button:hover {
    color: var(--primary-hover);
}

.table-and-text {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

/* table */
.table-and-btn {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
}

.table-container {
    box-shadow: var(--card-shadow);
    overflow-x: auto;
    width: 100%;
}

.points-history-table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--white);
    font-size: 1rem;
    font-weight: 500;
    table-layout: fixed;
}

.points-history-table thead tr {
    background-color: var(--primary);
    color: var(--white);
}

.points-history-table thead th {
    padding: 0.875rem;
    text-align: left;
    background-color: var(--primary);
    color: var(--white);
}

.points-history-table thead th:first-child {
    padding-left: 1.5rem;
    border-top-left-radius: var(--radius);
    border-bottom-left-radius: var(--radius);
    width: 8%;
}

.points-history-table thead th:nth-child(2) {
    width: 19%;
}

.points-history-table thead th:nth-child(3) {
    width: 19%;
}

.points-history-table thead th:nth-child(4) {
    width: 19%;
}

.points-history-table thead th:last-child {
    padding-right: 1.5rem;
    border-top-right-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
    width: 40%;
}

.points-history-table tbody tr {
    background-color: var(--white);
    transition: background-color 0.15s;
}

.points-history-table tbody tr.even-row {
    background-color: rgba(224, 224, 224, 0.4);
}

.points-history-table td {
    padding: 0.875rem;
    color: var(--gray2);
    vertical-align: middle;
}

.points-history-table tbody td:first-child {
    padding-left: 1.5rem;
}

.points-history-table tbody td:last-child {
    padding-right: 1.5rem;
}

.listing-title {
    text-decoration: underline;
    text-decoration-color: var(--gray2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: var(--gray2);
    font-weight: 500;
    display: block;
    width: 100%;
}

.listing-title:hover {
    color: var(--primary-hover);
    text-decoration-color: var(--primary-hover);
}

/* view more button */
.btn-or-spinner {
    width: 15vw;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn {
    padding: 0.75rem 0;
    width: 15vw;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>