import { db } from '@/firebase'
import { collection, doc, getDocs, setDoc, getDoc, Timestamp, writeBatch } from 'firebase/firestore'
import { getLastMonthKey } from '@/utils/formatSgtTime';
import { addCreateNotifToBatch } from '@/utils/notifications';

export async function assignMonthlyRewardsIfNeeded() {
    const monthKey = getLastMonthKey();

    // Check if already done for last month
    const flagRef = doc(db, 'reward_assignments', monthKey);
    const flagSnap = await getDoc(flagRef);
    if (flagSnap.exists()) return;

    // 1. Get last month's reward
    const rewardsSnap = await getDocs(collection(db, 'rewards'));
    const rewards = rewardsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.id.localeCompare(b.id));

    if (rewards.length === 0) return;

    const [year, month] = monthKey.split('-').map(Number);
    const monthSeed = month - 1;
    const reward = rewards[monthSeed % rewards.length];

    // 2. Get all users and find top 20 by absolute_rank
    const usersSnap = await getDocs(collection(db, 'users'));
    const winners = [];

    usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        const absoluteRank = data.absolute_rank?.[monthKey];
        if (absoluteRank !== null && absoluteRank !== undefined && absoluteRank <= 20) {
            winners.push({
                uid: docSnap.id,
                rank: absoluteRank,
            });
        }
    });

    // 3. Assign reward + create notification for each winner
    const batch = writeBatch(db);
    for (const winner of winners) {
        // Create reward_redemption
        const rewardRedemptionRef = doc(collection(db, 'reward_redemption'));
        batch.set(rewardRedemptionRef, {
            reward_id:   reward.id,
            user_id:     winner.uid,
            status:      'NOT REDEEMED',
            redeemed_at: null,
        });

        // Create notification
        addCreateNotifToBatch(batch, {
            uid: winner.uid,
            type: 'receive_reward',
            sgt_year_month: monthKey,
        });
    }

    // 4. Mark assignment as done
    batch.set(flagRef, {
        assigned_at: Timestamp.now(),
        month: monthKey,
        reward_id: reward.id,
        winners: winners.length,
    });

    await batch.commit();
}