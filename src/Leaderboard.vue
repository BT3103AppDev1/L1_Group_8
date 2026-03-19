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
            viewReward: false
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
</style>