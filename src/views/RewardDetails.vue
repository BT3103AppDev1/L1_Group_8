<template> 
    <PageHeader title="Reward Details"/>
    <div class="reward-detail-page">
        <div class="reward-detail-box">
            <div class="reward-name-box">
                <h2 class="reward-name">reward.reward_name</h2>
                <p class="information">Valid till reward.expiry_date </p>
            </div>
            <hr class="divider">


            <div class="reward-detail">
                <h2 class="section-title">REWARD DETAILS</h2>
                <p class="information">reward.reward_details</p>
            </div>
            <hr class="divider">


            <div class="redemption-instruction">
                <h2 class="section-title">REDEMPTION INSTRUCTION</h2>
                <p class="information">reward.redemption_instruction</p>
            </div>
            <hr class="divider">


            <div class="terms-and-conditions">
                <h2 class="section-title">TERMS AND CONDITIONS</h2>
                <p class="information">reward.terms_and_conditions</p>
            </div>
        </div>
        
        <div class="redeem-button-section">
            <button class="btn btn-secondary btn-secondary:hover" @click="redeemReward">Redeem</button>
        </div>
    </div>

</template>

<script>
import PageHeader from '@/components/PageHeader.vue';

</script>

<style scoped>
    .reward-detail-page {
        display: flex;
        gap: 10px;
    }

    .reward-detail-box {
        background-color: #DDEBFB;
        flex-direction: column;
        border-radius: var(--radius);
        border-color: var(--black1);;
        padding: 15px;
    }

    .reward-detail, .redemption-instruction, .terms-and-conditions {
        padding: 10px 0px 10px 0px;
    }

    .reward-name-box {
        padding: 0px 0px 10px 0px;
    }

    .reward-name {
        color: var(--primary) ;
    }

    .section-title {
        font-size: 15px;
        font-weight: bold;
    }

    .information {
        font-size: 12px;
    }

    .redeem-button-section {
        bottom: 0;
    }
</style>