import { db } from '@/firebase'
import { doc, increment, getDocs, collection, writeBatch, Timestamp } from 'firebase/firestore'
import { getSgtYearMonth } from './formatSgtTime'
import { addCreateNotifToBatch } from './notifications'

export function ratingToPoints(rating) {
    if (rating <= 2) return 0
    if (rating === 3) return 10
    if (rating === 4) return 20
    if (rating === 5) return 30
    return 0
}

export async function addPointsForRating(receiverUid, rating, listing_id, listing_title) {
    const pointsEarned = ratingToPoints(rating);
    if (pointsEarned === 0) return;

    const monthKey = getSgtYearMonth(); // Always update points for current month

    // Read current points
    const userSnap = await getDocs(doc(db, 'users', receiverUid));
    const currentPoints = userSnap.data()?.total_points?.[monthKey] ?? 0;
    const newTotalPoints = currentPoints + pointsEarned;

    const batch = writeBatch(db);

    // Step 1: update this user's points
    batch.update(doc(db, 'users', receiverUid), {
        [`total_points.${monthKey}`]: increment(pointsEarned)
    });

    // Step 2: update points log
    batch.set(doc(collection(db, 'pointsLog')), {
        uid: receiverUid,
        listing_id,
        listing_title,
        increase_in_points: pointsEarned,
        new_total_points: newTotalPoints,
        sgt_year_month: monthKey,
        time: Timestamp.now(),
    });

    // Step 3: send notification to user about rating received and points earned
    addCreateNotifToBatch(batch, {
        uid: receiverUid,
        type: 'receive_rating',
        listing_title: listing_title,
        listing_id: listing_id,
        rating: rating,
        increase_in_points: pointsEarned,
        sgt_year_month: monthKey,
    }); 

    await batch.commit();

    // Step 4: recalculate everyone's rank for this month
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

    const batch = writeBatch(db);

    // 4. Update each user's rank in their doc
    const updates = allUsers.map(async (user) => {
        const position = sorted.findIndex(u => u.uid === user.uid);

        let absoluteRank, percentageRank;

        if (position === -1) {
            // User has no points this month
            absoluteRank = null;
            percentageRank = null;
        } else {
            absoluteRank = sorted.filter(u => u.totalPoints > user.totalPoints).length + 1;
            percentageRank = Math.round(((position + 1) / totalRanked) * 100);
        }

        batch.update(doc(db, 'users', user.uid), {
            [`absolute_rank.${monthKey}`]:    absoluteRank,
            [`percentage_rank.${monthKey}`]:  percentageRank,
        }); 
    });

    await batch.commit();
}