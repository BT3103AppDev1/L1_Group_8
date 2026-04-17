import { db } from '@/firebase'
import { doc, increment, getDocs, collection, writeBatch, Timestamp, runTransaction } from 'firebase/firestore'
import { getSgtYearMonth } from './formatSgtTime'
import { addCreateNotifToTransaction } from './notifications'

//convert ratings to respeective point based on our point system
export function ratingToPoints(rating) {
    if (rating <= 2) return 0
    if (rating === 3) return 10
    if (rating === 4) return 20
    if (rating === 5) return 30
    return 0
}

export async function addRatingsAndPoints(receiverUid, rating, listing_id) {
    const pointsEarned = ratingToPoints(rating);
    if (pointsEarned === 0) return;

    const monthKey = getSgtYearMonth(); // Always update points for current month

    await runTransaction(db, async (transaction) => {
        // Read current ratings and points
        const userSnap = await transaction.get(doc(db, 'users', receiverUid));
        const listingSnap = await transaction.get(doc(db, 'listings', listing_id));
        const listing_title = listingSnap.data()?.title;
        const listing_cat = listingSnap.data()?.listing_category;
        const listing_cat_abbrev = listing_cat === 'Education' ? 'edu' : (listing_cat === 'Buddy' ? 'buddy' : 'survival');
        const currentPoints = userSnap.data()?.total_points?.[monthKey] ?? 0;
        const currentAvgRating = userSnap.data()?.[`${listing_cat_abbrev}_avg_rating`] ?? null;
        const currentRatingCount = userSnap.data()?.[`${listing_cat_abbrev}_rating_count`] ?? 0;
        
        // Update values
        const newTotalPoints = currentPoints + pointsEarned;
        const newRatingCount = currentRatingCount + 1;
        const newAvgRating = currentAvgRating ? ((currentAvgRating * currentRatingCount) + rating) / newRatingCount : rating;

        // Step 1: update this user's points and rating stats
        transaction.update(doc(db, 'users', receiverUid), {
            [`total_points.${monthKey}`]: increment(pointsEarned),
            [`${listing_cat_abbrev}_avg_rating`]: newAvgRating,
            [`${listing_cat_abbrev}_rating_count`]: newRatingCount,
        });

        // Step 2: update the listing's rating_given
        transaction.update(doc(db, 'listings', listing_id), {
            rating_given: rating,
        });

        // Step 3: create ratings doc
        transaction.set(doc(collection(db, 'ratings')), {
            receiver_id: receiverUid,
            rating,
            new_avg_rating: newAvgRating,
            listing_id,
            listing_category: listing_cat,
            listing_title,
            rated_at: Timestamp.now(),
        });

        // Step 4: create points log entry
        transaction.set(doc(collection(db, 'pointsLogs')), {
            uid: receiverUid,
            listing_id,
            listing_title,
            increase_in_points: pointsEarned,
            new_total_points: newTotalPoints,
            sgt_year_month: monthKey,
            time: Timestamp.now(),
        });

        // Step 5: send notification to user about rating received and points earned
        addCreateNotifToTransaction(transaction, {
            uid: receiverUid,
            type: 'receive_rating',
            listing_title: listing_title,
            listing_id: listing_id,
            rating,
            increase_in_points: pointsEarned,
            sgt_year_month: monthKey,
        });
    });

    // Step 6: recalculate everyone's rank for this month
    await updateRankings(monthKey);
}

//update the ranking for the users once they have received points
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