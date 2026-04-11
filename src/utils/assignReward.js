import { db } from '@/firebase'
import { collection, doc, getDocs, setDoc, addDoc, getDoc, Timestamp } from 'firebase/firestore'

export async function assignMonthlyRewardsIfNeeded() {
    const now = new Date();

    // Get last month's key in "YYYY-MM" format
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    // Check if rewards already assigned for last month
    // Store a flag in Firestore to prevent duplicate assignments
    const assignedFlagRef = doc(db, 'reward_assignments', monthKey);
    const assignedFlagSnap = await getDoc(assignedFlagRef);

    //means rewards for this month already assigned, skip
    if (assignedFlagSnap.exists()) {
        return;
    }

    // 1. Get the reward for last month
    const rewardsSnap = await getDocs(collection(db, 'rewards'));
    const rewards = rewardsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.id.localeCompare(b.id));

    if (rewards.length === 0) return;

    const monthSeed = lastMonth.getMonth();
    const reward = rewards[monthSeed % rewards.length];

    // 2. Get all winners from last month
    const usersSnap = await getDocs(collection(db, 'users'));
    const winners = [];
    usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.absolute_rank <= 20) {
            winners.push(docSnap.id);
        }
    });

    // 3. Create reward card for each winner
    for (const uid of winners) {
        await addDoc(collection(db, 'reward_redemption'), {
            reward_id:   reward.id,
            user_id:     uid,
            status:      'NOT REDEEMED',
            redeemed_at: null,
        });
    }

    // 4. Mark as assigned so it doesn't run again
    await setDoc(assignedFlagRef, {
        assigned_at: Timestamp.now(),
        month:       monthKey,
        reward_id:   reward.id,
        winners:     winners.length,
    });
}