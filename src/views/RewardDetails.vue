<template> 
    <div>
        <PageHeader title="Reward Details"/>

        <div v-if="loading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" aria-label="Loading reward details ..." />
        </div>
        <div v-else-if="reward" class="reward-detail-page">
            <div class="reward-detail-box detail-box">
                <div class="reward-name-box">
                    <h2 class="reward-name">{{ reward.reward_name }}</h2>
                    <p class="information">Valid till {{ formattedExpiryDate }} </p>
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
                    class="btn btn-secondary"
                    :disabled="reward.status !== 'NOT REDEEMED'"
                    @click="showConfirmModal = true"
                >
                    {{ reward.status === 'REDEEMED' ? 'Redeemed' : reward.status === 'EXPIRED' ? 'Expired' : 'Redeem' }}
                </button>
            </div>

            <ConfirmationModal
                :showModal="showConfirmModal"
                :title="`Redeem ${reward?.reward_name || ''}?`"
                @update:showModal="showConfirmModal = $event"
            >
                This action cannot be undone.

                <template #buttons>
                    <button class="btn cancel-btn modal-btn" @click="showConfirmModal = false">Cancel</button>
                    <button class="btn btn-secondary modal-btn" @click="confirmRedeem">Confirm</button>
                </template>
            </ConfirmationModal>
        </div>
    </div>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { db } from '@/firebase';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useToast } from 'vue-toastification';
import { VueSpinner } from 'vue3-spinners';

export default {
    components: {
        PageHeader,
        ConfirmationModal,
        VueSpinner
    },

    data() {
        return {
            reward: null,
            loading: true,
            showConfirmModal: false,
        }
    },

    mounted() {
        this.fetchRewardDetails();
    },

    computed: {
        // Format expiry date to "DD Month YYYY" format, e.g. "15 September 2024"
        formattedExpiryDate() {
            if (!this.reward?.expiry_date) return 'N/A';
            const date = this.reward.expiry_date.toDate?.() ?? new Date(this.reward.expiry_date);
            return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    },

    methods: {
        // Fetch reward details based on redemption ID from route params
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

        async confirmRedeem() {
            this.showConfirmModal = false;
            await this.redeemReward();
        },

        async redeemReward() {
            if (this.reward.status !== 'NOT REDEEMED') return;

            try {
                await updateDoc(doc(db, 'reward_redemption', this.reward.redemption_id), {
                    status: 'REDEEMED',
                    redeemed_at: Timestamp.now(),
                });
                this.reward.status = 'REDEEMED';
                const toast = useToast();
                toast.success(`Redeemed "${this.reward.reward_name}" successfully!`);

            } catch (error) {
                console.error('Error redeeming reward:', error);
                const toast = useToast();
                toast.error('Failed to redeem reward. Please try again later.');
            }
        }
    }
}

</script>

<style scoped>
    .loading {
        margin-top: 20px;
        display: flex;
        align-content: center;
        justify-content: center;
    }

    .reward-detail-page {
        margin-top: 12px;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: 20px;
    }

    .reward-detail-box {
        flex-direction: column;
        width: 600px;
        flex-shrink: 0;
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
        white-space: pre-line;
    }

    .redeem-button-section {
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
    }

    .cancel-btn {
        background: var(--gray4);
        color: var(--white);
    }

    .cancel-btn:hover {
        background-color: var(--gray5);
    }

    .modal-btn {
        width: 15vw;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>