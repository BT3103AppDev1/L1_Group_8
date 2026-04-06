<template> 
    <PageHeader title="Reward Details"/>
    <div v-if="loading">Loading...</div>
    <div v-else-if="reward" class="reward-detail-page">
        <div class="reward-detail-box">
            <div class="reward-name-box">
                <h2 class="reward-name">{{ reward.reward_name }}</h2>
                <p class="information">Valid till {{ reward.expiry_date }} </p>
            </div>
            <hr class="divider">

            <div class="reward-detail">
                <h2 class="section-title">REWARD DETAILS</h2>
                <p class="information">{{ reward.reward_details }}</p>
            </div>
            <hr class="divider">

            <div class="redemption-instruction">
                <h2 class="section-title">REDEMPTION INSTRUCTION</h2>
                <p class="information">{{ reward.redemption_instruction }}</p>
            </div>
            <hr class="divider">  
            
            <div class="terms-and-conditions">
                <h2 class="section-title">TERMS AND CONDITIONS</h2>
                <p class="information">{{ reward.terms_and_conditions }}</p>
            </div>            
        </div>  

        <div class="redeem-button-section">
            <button 
                class="btn btn-secondary btn-secondary:hover" 
                :disabled="reward.status !== 'NOT REDEEMED'"
                @click="redeemReward"
            >
                {{  reward.status === 'REDEEMED' ? 'Redeemed' : reward.status === 'EXPIRED' ? 'Expired' : 'Redeem' }}
            </button>
        </div>
    </div>

</template>

<script>
import PageHeader from '@/components/PageHeader.vue';
import { db, auth } from '@/firebase';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';

export default {
    components: {
        PageHeader
    },

    data() {
        return {
            reward: null,
            loading: true
        }
    },

    mounted() {
        this.fetchRewardDetails();
    },

    methods: {
        async fetchRewardDetails() {
            console.log("fetching reward details");
            this.loading = true;
            try {
                const redemptionId = this.$route.params.redemptionId;

                const redemptionDoc = await getDoc(doc(db, 'reward_redemption', redemptionId));
                if (!redemptionDoc.exists()) {
                    console.error('Redemption not found');
                    return;
                }
                const redemptionData = redemptionDoc.data();

                const rewardDoc = await getDoc(doc(db, 'rewards', String(redemptionData.reward_id)));
                if (!rewardDoc.exists()) {
                    console.error('Reward not found');
                    return;
                }
                const rewardData = rewardDoc.data();

                this.reward = {
                    redemption_id: redemptionId,
                    reward_id: redemptionData.reward_id,
                    status: redemptionData.status,
                    reward_name: rewardData.reward_name,
                    reward_details: rewardData.reward_details,
                    redemption_instruction: rewardData.redemption_instruction,
                    terms_and_conditions: rewardData.terms_and_conditions,
                    expiry_date: rewardData.expiry_date,
                };

            } catch (error) {
                console.error('Error fetching reward details:', error);
            } finally {
                this.loading = false;
            }
        },

        async redeemReward() {
            if (this.reward.status !== 'NOT REDEEMED') return;

            try {
                await updateDoc(doc(db, 'reward_redemption', this.reward.redemption_id), {
                    status: 'REDEEMED',
                    redeemed_at: Timestamp.now(),
                });
                this.reward.status = 'REDEEMED';
                alert('Redeemed reward successfully!')
            } catch (error) {
                console.error('Error redeeming reward:', error);
            }
        }
    }
}

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