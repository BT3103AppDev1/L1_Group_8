<template>
    <PageHeader title="My Rewards" />
    <div class="reward-grid">
        <div v-if="loading">Loading...</div>
        <div v-else-if="rewards.length === 0">No rewards available...</div>
        <RewardCard v-else 
            v-for="reward in rewards" :key="reward.redemption_id" :reward="reward" 
        />
    </div>
</template>

<script> 
//import { seedRewards } from '@/mockRewards';
import PageHeader from './PageHeader.vue';
import RewardCard from './RewardCard.vue';
import { db, auth } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default {
    components: {
        PageHeader,
        RewardCard
    },

    data() {
        return {
            rewards: [],
            loading: true
        }
    },

    async mounted() {
        //seedRewards(); // Seed rewards for testing purposes
        this.fetchRewards();
    },

    methods: {
        async fetchRewards() {
            this.loading = true;
            try {
                const currentUid = auth.currentUser?.uid;
                if (!currentUid) return; 

                const redemptionsSnap = await getDocs(query(collection(db, 'reward_redemption'), where('user_id', '==', currentUid)));

                const rewardPromises = redemptionsSnap.docs.map(async (redemptionDoc) => {
                    const redemption = redemptionDoc.data();
                    const rewardDoc = await getDoc(doc(db, 'rewards', String(redemption.reward_id)));

                    if (!rewardDoc.exists()) return null;
                    const reward = rewardDoc.data();

                    return {
                        redemption_id: redemptionDoc.id,
                        reward_id: redemption.reward_id,
                        status: redemption.status,
                        redeemed_at: redemption.redeemed_at,
                        reward_name: reward.reward_name,
                        reward_details: reward.reward_details,
                        redemption_instruction: reward.redemption_instruction,
                        terms_and_conditions: reward.terms_and_conditions,
                        expiry_date: reward.expiry_date,
                    };
                });

                const rewardsData = await Promise.all(rewardPromises);
                this.rewards = rewardsData;

            } catch (error) {
                console.error("Error fetching rewards: ", error);
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
    .reward-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }
</style>