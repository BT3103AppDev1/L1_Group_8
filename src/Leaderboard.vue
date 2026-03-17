<template>
    <div class="leaderboard">
        <div class="headerRow">
            <PageHeader title="Leaderboard" />

            <button class="viewRewardButton" @click="viewReward=true">View Reward</button>

            <div v-if="viewReward" class="viewRewardModalOverlay" @click.self="viewReward = false">
                <div class="viewRewardContent">
                    <h2>Reward Details</h2>
                    <p>Here are the details of the reward...</p>
                    <p>More information about the reward can be displayed here.</p>
                    <button class="closeButton" @click="viewReward = false">X</button>
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
        padding: 30px;
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