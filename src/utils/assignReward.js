import { db } from '@/firebase'
import { collection, doc, getDocs, setDoc, addDoc, getDoc, Timestamp } from 'firebase/firestore'

function getLastMonthKey() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

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

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthSeed = lastMonth.getMonth();
    const reward = rewards[monthSeed % rewards.length];

    // 2. Get all users and find top 20 by absolute_rank
    const usersSnap = await getDocs(collection(db, 'users'));
    const winners = [];
    const allUserIds = [];

    usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        allUserIds.push(docSnap.id);

        const absoluteRank = data.absolute_rank?.[monthKey];
        if (absoluteRank !== null && absoluteRank !== undefined && absoluteRank <= 20) {
            winners.push({
                uid: docSnap.id,
                rank: absoluteRank,
            });
        }
    });

    // 3. Create reward card for each winner
    for (const uid of winners) {
        await addDoc(collection(db, 'reward_redemption'), {
            reward_id:   reward.id,
            user_id:     winner.uid,
            status:      'NOT REDEEMED',
            redeemed_at: null,
        });
    }

    // 4. Mark assignment as done
    await setDoc(flagRef, {
        assigned_at: Timestamp.now(),
        month:       monthKey,
        reward_id:   reward.id,
        winners:     winners.length,
    });
}