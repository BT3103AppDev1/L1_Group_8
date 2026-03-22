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
            <button class="navigationArrow" @click="previousMonth"><</button>
            <span class="currentMonth">{{ currentMonth }}</span>
            <button class="navigationArrow" @click="nextMonth">></button>
        </div>

        <div class="leaderboardTable">
            <div class="tableHeaders">
                <span class="headerRank">Rank</span>
                <span class="headerName">User</span>
                <span class="headerPoints">Total Points</span>
            </div>
        </div>

        <div v-if="rankedUsers.length === 0" class="noWinnerState">
            No winners in current month....
        </div>

        <div class="currentUserBar">
            <span class="myRank">{{ currentUserRank }}</span>
            <span class="myName">{{ currentUsername }}</span>
            <span class="myPoints">{{ currentUserPoints }}</span>
        </div>
    </div>

</template>

<script>
import PageHeader from "./PageHeader.vue";

export default {
    name: "Leaderboard",
    components: {
        PageHeader
    },

    data() {
        return {
            viewReward: false,
            currentMonth: "June",

            mockData: {
                "July": [
                    { rank: 1, username: "Alice", totalPoints: 3000, isCurrentUser: false },
                    { rank: 2, username: "Bob", totalPoints: 2500, isCurrentUser: false },
                    { rank: 3, username: "Charlie", totalPoints: 2000, isCurrentUser: false },
                    { rank: 4, username: "David", totalPoints: 1800, isCurrentUser: false },
                    { rank: 5, username: "Eve", totalPoints: 1700, isCurrentUser: false },
                    { rank: 6, username: "Frank", totalPoints: 1600, isCurrentUser: false },
                    { rank: 7, username: "Grace", totalPoints: 1550, isCurrentUser: false },
                    { rank: 8, username: "Heidi", totalPoints: 1520, isCurrentUser: false },
                    { rank: 9, username: "Ivan", totalPoints: 1510, isCurrentUser: false },
                    { rank: 10, username: "John Doe", totalPoints: 1500, isCurrentUser: true }
                ],
                "June": [
                    { rank: 1, username: "Alice", totalPoints: 2800, isCurrentUser: false },
                    { rank: 2, username: "Bob", totalPoints: 2600, isCurrentUser: false },
                    { rank: 3, username: "Charlie", totalPoints: 2200, isCurrentUser: false },
                    { rank: 4, username: "David", totalPoints: 1900, isCurrentUser: false },
                    { rank: 5, username: "Eve", totalPoints: 1800, isCurrentUser: false },
                    { rank: 6, username: "Frank", totalPoints: 1700, isCurrentUser: false },
                    { rank: 7, username: "Grace", totalPoints: 1600, isCurrentUser: false },
                    { rank: 8, username: "Heidi", totalPoints: 1550, isCurrentUser: false },
                    { rank: 9, username:"Ivan", totalPoints :1520 ,isCurrentUser:false},
                    {rank :10 ,username:"John Doe", totalPoints: 1500, isCurrentUser: true}
                ], 
                "May": []
            }
        }
    },
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
        background-color: #EF7C00;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 16px;
    }

    .viewRewardButton:hover {
        opacity: 0.8;
        cursor: pointer;
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
    }

    .currentUserBar {
        background-color: #EF7C00;
        justify-content: space-between;
        padding: 10px;
    }

    .myRank, .myName, .myPoints {
        color: white;
        font-size: 18px;
        font-weight: bold;
    }

    .leaderboardTable {
        padding: 10px;
        background-color: #003D7C;
    }

    .tableHeaders {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        border: none;
    }

    .headerRank, .headerName, .headerPoints {
        color: white;
        font-size: 18px;
    }

</style>