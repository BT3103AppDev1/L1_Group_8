<template>
    <div class="reward-card" :class="{ expired: isExpired, redeemed: isRedeemed}">
        <div class="reward-content">
            <h2 class="reward-title">{{ reward.reward_name }}</h2>
            <p class="expiry-date">Expiry Date: {{ formattedExpiryDate }}</p>
            <p class="redemption-status">Status: <strong>{{ reward.status }}</strong></p>
        </div>
        <button 
            class="reward-detail-button" 
            :class="{ 'reward-detail-button-inactive': isExpired || isRedeemed }"
            @click="viewRewardDetail">
            View Details
        </button>
    </div>
</template>

<script>
export default {
    name: 'RewardCard',
    props: {
        reward: {
            type: Object,
            required: true
        }
    },

    computed: {
        formattedExpiryDate() {
            if (!this.reward.expiry_date) return 'N/A';
            const date = this.reward.expiry_date.toDate?.() ?? new Date(this.reward.expiry_date);
            return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });
        },

        isExpired() {
            return this.reward.status === 'EXPIRED';
        },

        isRedeemed() {
            return this.reward.status === 'REDEEMED';
        }
    },

    methods: {
        viewRewardDetail() {
            this.$router.push({
                name: 'RewardDetails',
                params: { redemptionId: this.reward.redemption_id }
            })
        }
    }
}


</script>

<style scoped>
    .reward-card {
        background: var(--white);
        border: 1px solid var(--black3);
        border-radius: var(--radius);
        box-shadow: var(--card-shadow);
        display: flex;
        flex-direction: column;
        width: 240px;
        gap: 0.55rem;
        overflow: hidden;
        min-height: 240px;
        margin: 10px 0px 0px 0px;
    }

    .reward-card.expired, .reward-card.redeemed { 
        background-color: var(--gray5);
    }

    .reward-content {
        padding: 1.2rem 1.4rem;
        flex-direction: column;
        display: flex;
    }

    .reward-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--black2);
        margin-bottom: 0.75rem;
        line-height: 1.3;
    }

    strong {
        font-weight: 600;
    }

    .expiry-date, .redemption-status {
        font-size: 1rem;
        color: var(--black3);
        line-height: 1.5;
    }

    .reward-detail-button {
        margin-top: auto; 
        width: 100%;
        padding: 14px 0;
        font-size: 1rem;
        font-weight: 600;
        background: var(--secondary);
        color: var(--white);
        border: none;
        cursor: pointer;
        transition: 0.15s ease;
    }

    .reward-detail-button-inactive {
        background: var(--gray4);
        cursor: default;
    }


</style>