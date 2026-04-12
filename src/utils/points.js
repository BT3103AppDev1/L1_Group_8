import { db } from '@/firebase'
import { doc, updateDoc, increment, getDocs, collection } from 'firebase/firestore'

export function ratingToPoints(rating) {
    if (rating <= 2) return 0
    if (rating === 3) return 10
    if (rating === 4) return 20
    if (rating === 5) return 30
    return 0
}

export function getMonthKeyFromOffset(offset) {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
}

export async function addPointsForRating(receiverUid, rating) {
    const pointsEarned = ratingToPoints(rating);
    if (pointsEarned === 0) return;

    const monthKey = getMonthKeyFromOffset(0); // Always update points for current month

    // Step 1: update this user's points
    await updateDoc(doc(db, 'users', receiverUid), {
        [`total_points.${monthKey}`]: increment(pointsEarned)
    });

    // Step 2: recalculate everyone's rank for this month
    await updateRankings(monthKey);
}

async function updateRankings(monthKey) {
    // 1. Fetch all users
    const usersSnap = await getDocs(collection(db, 'users'));

    // 2. Build list of users with points this month
    const allUsers = [];
    usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        const monthPoints = data.total_points?.[monthKey] ?? 0;
        allUsers.push({
            uid: docSnap.id,
            totalPoints: monthPoints,
        });
    });

    // 3. Sort by points descending
    const sorted = allUsers
        .filter(u => u.totalPoints > 0)
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const totalRanked = sorted.length;

    // 4. Update each user's rank in their doc
    const updates = allUsers.map(async (user) => {
        const position = sorted.findIndex(u => u.uid === user.uid);

        let absoluteRank, percentageRank, isInTop20;

        if (position === -1) {
            // User has no points this month
            absoluteRank = null;
            percentageRank = null;
            isInTop20 = false;
        } else {
            absoluteRank = sorted.filter(u => u.totalPoints > user.totalPoints).length + 1;
            percentageRank = Math.round(((position + 1) / totalRanked) * 100);
            isInTop20 = position < 20;
        }

        await updateDoc(doc(db, 'users', user.uid), {
            [`absolute_rank.${monthKey}`]:    absoluteRank,
            [`percentage_rank.${monthKey}`]:  percentageRank,
            [`is_in_top_20.${monthKey}`]:     isInTop20,
        });
    });

    await Promise.all(updates);
}