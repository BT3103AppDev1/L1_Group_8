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
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

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

                const now = new Date();
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

                const rewardPromises = redemptionsSnap.docs.map(async (redemptionDoc) => {
                    const redemption = redemptionDoc.data();
                    const rewardDoc = await getDoc(doc(db, 'rewards', String(redemption.reward_id)));

                    if (!rewardDoc.exists()) return null;
                    const reward = rewardDoc.data();

                    const expiryDate = reward.expiry_date?.toDate();

                    const isInactive = redemption.status === 'EXPIRED' || redemption.status === 'REDEEMED';
                    if (isInactive && expiryDate < threeMonthsAgo) {
                        await deleteDoc(doc(db, 'reward_redemption', redemptionDoc.id));
                        return null;
                    }

                    if (redemption.status === "NOT_REDEEMED" && expiryDate < now) {
                        await updateDoc(doc(db, 'reward_redemption', redemptionDoc.id), { status: "EXPIRED" });
                        redemption.status = "EXPIRED";
                    }

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
                        expiry_date_raw: expiryDate //for sorting purposes
                    };
                });

                const rewardsData = await Promise.all(rewardPromises);

                this.rewards = rewardsData.sort((a, b) => {
                    const aInactive = a.status === 'EXPIRED' || a.status === 'REDEEMED';
                    const bInactive = b.status === 'EXPIRED' || b.status === 'REDEEMED';

                    if (aInactive && !bInactive) return 1;
                    if (!aInactive && bInactive) return -1;
                    return (a.expiry_date_raw ?? 0) - (b.expiry_date_raw ?? 0);
                });

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