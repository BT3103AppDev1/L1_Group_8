<template>
    <div class="leaderboard">
        <div class="headerRow">
            <PageHeader title="Leaderboard" />
            <button class="viewRewardButton" @click="viewReward=true">View Reward</button>
        </div>
        
        <div v-if="viewReward" class="viewRewardModalOverlay" @click.self="viewReward = false">
            <div class="viewRewardContent">
                <button class="closeButton" @click="viewReward = false">X</button>

                <h2 class="modalTitle">Current Month Reward</h2>
                <div class="modalDetail">
                    <p class="modalLabel">Reward Name</p>
                    <p class="modalText">Reward examples....</p>    
                </div>
            </div>
        </div>

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
                        :class="{ isCurrentUser: user.isCurrentUser, isEvenRank: index % 2 !== 0 }"
                        :ref="user.isCurrentUser ? 'currentUserRow' : undefined">

                        <span class="colRank">{{ ordinal(user.rank) }}</span>
                        <span class="colName">
                            <span class="profilePic" :class="{ 'currentUserProfilePic': user.isCurrentUser }"></span>
                            <span class="username">{{ user.isCurrentUser ? 'You' : user.username }}</span>
                        </span>
                        <span class="colPoints">{{ user.totalPoints }}</span>
                    </div>
                </div>
            </div>

            <div v-if="showUserBar" class="currentUserBar">
                <span class="myRank">{{ currentUserRank }}</span>
                <span class="profilePic currentUserProfilePic"></span>
                <span class="myName">{{ currentUsername }}</span>
                <span class="myPoints">{{ currentUserPoints }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import PageHeader from "./PageHeader.vue";
import { db, auth } from '@/firebase'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore' 
import { ratingToPoints } from "./mockLeaderboard.js";

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

export default {
    name: "Leaderboard",
    components: { PageHeader },

    data() {
        return {
            viewReward: false,
            currentMonthIndex: CURRENT_MONTH_INDEX,
            currentUserRowVisible: false,
            observer: null,
            loading: false,

            rankedUser: [],

            currentUserStatus: null,
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
            this.$nextTick(() => this.setupObserver());
        }
    },

    mounted() {
        this.fetchLeaderboardData();
    },

    beforeUnmount() {
        this.teardownObserver();
    },

    methods: {
        async fetchLeaderboardData() {
            this.loading = true;
            this.rankedUser = [];
            this.currentUserStatus = null;

            try {
                const { start, end } = getMonthRange(this.monthOffset);
                const currentUid = auth.currentUser?.uid;

                const ratingsSnap = await getDocs(query(collection(db, 'ratings'), where('rated_at', '>=', Timestamp.fromDate(start)), where('rated_at', '<', Timestamp.fromDate(end))));

                const pointsMap = {};
                ratingsSnap.forEach(docSnap => {
                    const { receiver_id, rating } = docSnap.data();
                    pointsMap[receiver_id] = (pointsMap[receiver_id] || 0) + ratingToPoints(rating);
                })

                if (Object.keys(pointsMap).length === 0) {
                    this.loading = false;
                    return;
                }

                const uids = Object.keys(pointsMap);
                const usersSnap = await getDocs(collection(db, "users"));
                const usersMap = {};
                usersSnap.forEach(docSnap => {
                    if (uids.includes(docSnap.id)) {
                        usersMap[docSnap.id] = { uid: docSnap.id, ...docSnap.data()};
                    }
                });

                const sorted = uids.map(uid => ({
                    uid,
                    username: usersMap[uid]?.username || "Unknown User",
                    totalPoints: pointsMap[uid],
                })).sort((a, b) => b.totalPoints - a.totalPoints);

                const top1Count = Math.max(1, Math.ceil(sorted.length * 0.10));
                const top1 = sorted.slice(0, top1Count);

                this.rankedUser = top1.map((u, i) => ({
                    rank: i + 1,
                    uid: u.uid,
                    username: u.username,
                    totalPoints: u.totalPoints,
                    isCurrentUser: u.uid === currentUid
                }));

                const currentUserPosition = sorted.findIndex(u => u.uid === currentUid);
                const isInTop = currentUserPosition !== -1 && currentUserPosition < top1Count;

                if (currentUid && !isInTop) {
                    if (currentUserPosition === -1) {
                        this.currentUserStatus = { rank : "N/A", points: 0 };
                    } else {
                        const pct = Math.round(((currentUserPosition + 1) / sorted.length) * 100);
                        this.currentUserStatus = {
                            rank: `${pct}%~`,
                            points: sorted[currentUserPosition].totalPoints,
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
        }
    }
};
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
        background-color: #EF7C00;
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

    .viewRewardModalOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(181, 181, 181, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .viewRewardContent {
        background-color: #F0F0F0;
        padding: 20px;
        border-radius: 8px;
        position: relative;
        width: 400px;
        height: 200px;
        overflow-y: auto;
    }

    .closeButton {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #8C8C8C;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        color: white;
        cursor: pointer;
    }

    .closeButton:hover {
        opacity: 0.8;
    }

    .modalTitle {
        color: #003D7C;
        font-size: 24px;
        text-align: center;
    }

    .modalDetail {
        margin: 0 20px 10px 20px;
        align-content: flex-start;
    }

    .modalLabel {
        font-size: 18px;
        font-weight: bold;
    }

    .modalText {
        font-size: 16px;
    }

    .monthNavigation {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #003D7C;
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
        color: #EF7C00;
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
        background-color: #EF7C00;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
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
        background-color: #003D7C;
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
        padding: 10px;
    }

    .headerRank, .headerName, .headerPoints {
        color: white;
        font-size: 18px;
        font-weight: bold;
    }

    .leaderboardTableRow {
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: white;
        justify-content: space-between;
    }

    .scrollableRows {
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }

    .leaderboardTableRow.isCurrentUser {
        background-color: #EF7C00;
    }

    .leaderboardTableRow.isEvenRank {
        background-color: #E0E0E0;
    }

    .colRank, .username, .colPoints {
        font-size: 16px;
        padding: 10px;
        color: black;
    }
</style>