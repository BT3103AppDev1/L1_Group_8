<template>
    <div class="leaderboard">
        <div class="headerRow">
            <PageHeader title="Leaderboard" />
            <button class="viewRewardButton" @click="viewReward=true">View Reward</button>
        </div>
        
        <InfoModal v-model:showModal="viewReward">
            <div class="modalDetail">
                <h2 class="modalTitle">Current Month Reward</h2>
                <div v-if="currentMonthReward">
                    <p class="modalLabel">{{ currentMonthReward.reward_name }}</p>
                    <p class="modalText">{{ currentMonthReward.reward_details }}</p>
                    <p class="modalText">Eligibility: Top 20 users of the month</p>
                </div>
                <div v-else>
                    <p class="modalText">No reward information available for this month.</p>
                </div>
            </div>
        </InfoModal>

        <div class="monthNavigation">
            <button class="navigationArrow" @click="previousMonth">&lt;</button>
            <span class="currentMonth">{{ currentMonth }}</span>
            <button class="navigationArrow" @click="nextMonth">&gt;</button>
        </div>

        <div class="tableContainer">
            <div class="leaderboardTable">
                <div class="tableHeaders">
                    <span class="headerRank">Rank</span>
                    <span class="headerName">User</span>
                    <span class="headerPoints">Total Points</span>
                </div>

                <div class="scrollableRows" ref="scrollContainer">

                    <div v-if="loading" class="noWinnerState">
                            Loading.....
                    </div>

                    <div v-else-if="rankedUser.length === 0" class="noWinnerState">
                        No winners for {{ currentMonth }} yet. 
                    </div>

                    <div
                        v-else 
                        v-for="(user, index) in rankedUser" 
                        :key="user.rank"
                        class="leaderboardTableRow" 
                        :class="{ isCurrentUser: user.isCurrentUser, isEvenRank: index % 2 !== 0 && !user.isCurrentUser }"
                        :ref="user.isCurrentUser ? 'currentUserRow' : undefined">

                        <span class="colRank">{{ ordinal(user.rank) }}</span>
                        <span class="colName">
                            <img 
                                :src="user.profilePic || defaultProfilePic"
                                class="profilePic"
                                :class="{ currentUserProfilePic: user.isCurrentUser }"
                                alt="profile"
                            />
                            <span class="username">{{ user.isCurrentUser ? 'You' : user.username }}</span>
                        </span>
                        <span class="colPoints">{{ user.totalPoints }}</span>
                    </div>
                </div>
            </div>

            <div v-if="showUserBar" class="currentUserBar">
                <span class="myRank">{{ currentUserRank }}</span>
                <span class="myName">
                    <img 
                        :src="currentUserProfilePic || defaultProfilePic"
                        class="profilePic currentUserProfilePic"
                        alt="your profile"
                    />
                    {{ currentUsername }}
                </span>
                <span class="myPoints">{{ currentUserPoints }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import PageHeader from "../components/PageHeader.vue";
import { db, auth } from '@/firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore' 
import InfoModal from "@/components/InfoModal.vue";
import { getMonthKeyFromOffset } from "@/utils/points";
import defaultProfilePic from '@/assets/default-profile-pic.png'

function buildMonthLabels() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    return [months[new Date(now.getFullYear(), now.getMonth() - 2, 1).getMonth()],
            months[new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth()],
            months[now.getMonth()]];
}

function getMonthRange(offset) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
    return { start, end };
}

const MONTH_LABELS = buildMonthLabels();
const CURRENT_MONTH_INDEX = 2; 
const DISPLAY_LIMIT = 20;

export default {
    name: "Leaderboard",
    components: { PageHeader, InfoModal },

    data() {
        return {
            defaultProfilePic,
            currentUserProfilePic: '',
            viewReward: false,
            currentMonthIndex: CURRENT_MONTH_INDEX,
            currentUserRowVisible: false,
            observer: null,
            loading: false,

            rankedUser: [],

            currentUserStatus: null,
            currentMonthReward: null,
        };
    },

    computed: {
        currentMonth() {
            return MONTH_LABELS[this.currentMonthIndex];
        },

        monthOffset() {
            return this.currentMonthIndex - CURRENT_MONTH_INDEX;
        },

        currentUserEntry() {
            return this.rankedUser.find(user => user.isCurrentUser) || null;
        },

        currentUsername() {
            return this.currentUserEntry ? this.currentUserEntry.username : "You";
        },

        currentUserRank() {
            if (this.currentUserEntry) return this.ordinal(this.currentUserEntry.rank);
            return this.currentUserStatus?.rank ?? "N/A"; 
        }, 

        currentUserPoints() {
            if (this.currentUserEntry) return this.currentUserEntry.totalPoints;
            return this.currentUserStatus?.points ?? 0;
        },

        showUserBar() {
            if (!this.currentUserEntry) return true;
            return !this.currentUserRowVisible;
        }
    },

    watch: {
        currentMonthIndex() {
            this.currentUserRowVisible = false;
            this.fetchLeaderboardData();
        }
    },

    mounted() {
        this.fetchLeaderboardData();
        this.fetchCurrentMonthReward();
    },

    beforeUnmount() {
        this.teardownObserver();
    },

    methods: {
        ratingToPoints(rating) {
            if (rating <= 2 ) return 0
            if (rating === 3 ) return 10
            if (rating === 4 ) return 20
            if (rating === 5 ) return 30
            return 0
        },

        async fetchLeaderboardData() {
            this.loading = true;
            this.rankedUser = [];
            this.currentUserStatus = null;
            const currentUid = auth.currentUser?.uid ?? null;

            const monthKey = getMonthKeyFromOffset(this.monthOffset);

            try {
                const usersSnap = await getDocs(collection(db, 'users'));
                const currentUserData = usersSnap.docs.find(d => d.id === currentUid)?.data();
                this.currentUserProfilePic = currentUserData?.profile_pic_url || '';

                const allUsers = [];
                usersSnap.forEach(docSnap => {
                    const data = docSnap.data();
                    const monthPoints = data.total_points?.[monthKey] ?? 0;
                    const absoluteRank = data.absolute_rank?.[monthKey] ?? null;
                    if (monthPoints > 0) {
                        allUsers.push({
                            uid: docSnap.id,
                            username: data.username || "Unknown User",
                            totalPoints: monthPoints,
                            rank: absoluteRank,
                            profilePic: data.profile_pic_url || defaultProfilePic,
                            isCurrentUser: docSnap.id === currentUid,
                        });
                    }
                });

                // Sort and display top 20
                const sorted = allUsers.sort((a, b) => b.totalPoints - a.totalPoints);
                const displayList = sorted.slice(0, DISPLAY_LIMIT);
                this.rankedUser = displayList;

                // Current user bar
                const currentUser = sorted.find(u => u.uid === currentUid);
                const isInDisplayList = displayList.some(u => u.uid === currentUid);

                if (currentUid && !isInDisplayList) {
                    if (!currentUser) {
                        this.currentUserStatus = { rank: "N/A", points: 0 };
                    } else {
                        const usersData = usersSnap.docs.find(d => d.id === currentUid)?.data();
                        const pct = usersData?.percentage_rank?.[monthKey] ?? null;
                        this.currentUserStatus = {
                            rank: pct ? `${pct} %` : "N/A",
                            points: currentUser.totalPoints,
                        };
                    }
                }

            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }

            this.loading = false;
            this.$nextTick(() => this.setupObserver());
        },

        setupObserver() {
            this.teardownObserver();
            const scrollContainer = this.$refs.scrollContainer;
            const rowRef = this.$refs.currentUserRow;
            const row = Array.isArray(rowRef) ? rowRef[0] : rowRef;

            if (!row || !scrollContainer) return;

            this.observer = new IntersectionObserver(
                ([entry]) => {
                    this.currentUserRowVisible = entry.isIntersecting;
                },
                {
                    root: scrollContainer,
                    threshold: 0.5
                }
            );

            this.observer.observe(row);
        },

        teardownObserver() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
        },

        previousMonth() {
            if (this.currentMonthIndex > 0) {
                this.currentMonthIndex--;
            }
        },

        nextMonth() {
            if (this.currentMonthIndex < MONTH_LABELS.length - 1) {
                this.currentMonthIndex++;
            }
        },

        ordinal(n) {
            if (typeof n !== "number") return n;
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        },

        async fetchCurrentMonthReward() {
            try {
                const rewardsSnap = await getDocs(collection(db, 'rewards'));
                const rewards = rewardsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => a.id.localeCompare(b.id));

                if (rewards.length === 0) return;

                const monthSeed = new Date().getMonth();
                const index = monthSeed % rewards.length;
                this.currentMonthReward = rewards[index];

            } catch (error) {
                console.error('Error fetching current month reward:', error);
            }
        }
    }
}
</script>

<style scoped>
    .leaderboard {
        padding: 20px;
    }

    .headerRow {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .viewRewardButton {
        background-color: var(--secondary);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
    }

    .viewRewardButton:hover {
        opacity: 0.8;
    }

/*    .viewRewardModalOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(181, 181, 181, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .viewRewardContent {
        background-color: #F0F0F0;
        padding: 20px;
        border-radius: 8px;
        position: relative;
        width: 450px;
        height: 220px;
        overflow-y: auto;
    }

    .closeButton {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: var(--grey4);
        border: none;
        border-radius: 8px;
        font-size: 16px;
        color: white;
        cursor: pointer;
        width: 20px;
        height: 20px;
    }

    .closeButton:hover {
        opacity: 0.8;
    } */

    .modalTitle {
        color: var(--primary);
        font-size: 24px;
        text-align: center;
    }

    .modalDetail {
        margin: 10px 20px 10px 20px;
        align-content: center;
    }

    .modalLabel {
        font-size: 18px;
        font-weight: bold;
    }

    .modalText {
        font-size: 14px;
    }

    .monthNavigation {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--primary);
        padding: 10px;
        margin: 20px 0px 0px 0px;
    }

    .navigationArrow {
        font-size: 24px;
        font-weight: bold;
        background-color: transparent;
        border: none;
        color: white;
    }
    
    .navigationArrow:hover {
        color: var(--secondary);
        cursor: pointer;
    }

    .currentMonth {
        font-size: 20px;
        font-weight: bold;
        margin: 0 10px 0 10px;
        color: white;
    }

    .noWinnerState {
        text-align: center;
        font-size: 18px;
        color: black;
        padding: 60px 20px;
        background-color: #E0E0E0;
    }

    .currentUserBar {
        background-color: var(--secondary);
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        display: flex;
        flex-shrink: 0;
    }

    .myRank, .myName, .myPoints {
        color: white;
        font-size: 18px;
        font-weight: bold;
    }

    .tableContainer {
        display: flex;
        flex-direction: column;
        max-height: 500px;
    }

    .leaderboardTable {
        background-color: var(--primary);
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        min-height: 0;
    }

    .tableHeaders {
        display: flex;
        justify-content: space-between;
        border: none;
        flex-shrink: 0;
        padding: 10px 16px;
    }

    .headerRank, .headerName, .headerPoints {
        color: white;
        font-size: 18px;
        font-weight: bold;
    }

    .leaderboardTableRow {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        background-color: white;
        justify-content: space-between;
    }

    .scrollableRows {
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }

    .leaderboardTableRow.isCurrentUser {
        background-color: var(--secondary);
    }

    .leaderboardTableRow.isCurrentUser .colRank,
    .leaderboardTableRow.isCurrentUser .username,
    .leaderboardTableRow.isCurrentUser .colPoints {
        color: white;
        font-weight: bold;
    }

    .leaderboardTableRow.isEvenRank {
        background-color: #E0E0E0;
    }

    .colRank, .username, .colPoints {
        font-size: 16px;
        padding: 10px 0;
        color: black;
    }

    .profilePic, .currentUserProfilePic {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 10px;
        object-fit: cover;
        border: 1px solid var(--gray5);
    }

</style>