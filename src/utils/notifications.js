import { db } from "@/firebase.js";
import { collection, doc, getDoc, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { getSgtYearMonth, getLastMonthKey } from "./formatSgtTime";

export function addCreateNotifToBatch(batch, {
    uid, 
    type,
    listing_title = null,
    listing_id = null,
    rating = null,
    increase_in_points = null,
    sgt_year_month = null,
}) {
    const notifRef = doc(collection(db, "notifications"));

    batch.set(notifRef, {
        uid,
        type,
        listing_title,
        listing_id,
        rating,
        increase_in_points,
        sgt_year_month,
        is_sent: false,
        created_at: Timestamp.now(),
    })
}

export function addCreateNotifToTransaction(transaction, {
    uid, 
    type,
    listing_title = null,
    listing_id = null,
    rating = null,
    increase_in_points = null,
    sgt_year_month = null,
}) {
    const notifRef = doc(collection(db, "notifications"));

    transaction.set(notifRef, {
        uid,
        type,
        listing_title,
        listing_id,
        rating,
        increase_in_points,
        sgt_year_month,
        is_sent: false,
        created_at: Timestamp.now(),
    })
}

export async function addResetPointNotifs() {
    const currentMonthKey = getSgtYearMonth();
    const lastMonthKey = getLastMonthKey();

    // check if already created reset notifs for this month to avoid duplicates
    const flagRef = doc(db, 'resetNotifsFlags', currentMonthKey);
    const flagSnap = await getDoc(flagRef);
    if (flagSnap.exists()) {
        return;
    }

    const usersSnapshot = await getDocs(collection(db, "users"));
    const batch = writeBatch(db);
    usersSnapshot.forEach(userDoc => {
        const data = userDoc.data();
        const lastMonthPoints = data.total_points?.[lastMonthKey] ?? 0;

        // only notify if user had points last month to reduce noise for users who are not active
        if (lastMonthPoints > 0) {
            const uid = userDoc.id;
            addCreateNotifToBatch(batch, {
                uid,
                type: 'points_reset',
                sgt_year_month: currentMonthKey,
            });
        }
    });

    batch.set(flagRef, { sgt_year_month: currentMonthKey });
    await batch.commit();
}

function findEarliestTimestamp(existing, newNotifs) {
    return existing ? existing.timestamp : newNotifs.reduce((earliest, notif) => {
        return notif.created_at.seconds < earliest.seconds
            ? notif.created_at : earliest
    }, newNotifs[0].created_at);
}

export function mergeApplicantNotifs(existing, newNotifs) {
    const listings = existing ? existing.listings.map(l => ({...l})) : [];
    const refs = existing ? [...existing.refs] : [];

    newNotifs.forEach(notif => {
        const existed = listings.find(l => l.listing_id === notif.listing_id);
        if (existed) {
            existed.count += 1;
        } else {
            listings.push({
                listing_id: notif.listing_id,
                count: 1,
                title: notif.listing_title,
            });
        }
        refs.push(notif.ref);
    });

    const timestamp = findEarliestTimestamp(existing, newNotifs);
    return {type: 'receive_applicant', listings, refs, timestamp};
}

export function mergeApplicationStatusNotifs(existing, newNotifs, type) {
    let refs = existing ? [...existing.refs] : [];
    let listings = existing ? [...existing.listings] : [];
    newNotifs.forEach(notif => {
        listings.push(notif.listing_title);
        refs.push(notif.ref);
    });
    const timestamp = findEarliestTimestamp(existing, newNotifs);
    return {type, listings, refs, timestamp};
}

export function mergeReceiveRewardNotifs(existing, newNotifs) {
    let refs = existing ? [...existing.refs] : [];
    let months = existing ? [...existing.months] : [];
    newNotifs.forEach(notif => {
        months.push(notif.sgt_year_month);
        refs.push(notif.ref);
    });
    const timestamp = findEarliestTimestamp(existing, newNotifs);
    return {type: 'receive_reward', months, refs, timestamp};
}

export function mergePointsChangeNotifs(existing, newNotifs) {
    const refs = [...(existing?.refs ?? []), ...newNotifs.map(n => n.ref),];

    // find latest reset notif among newNotifs to determine sgtYearMonth for this batch of notifications
    const resetNotifs = newNotifs.filter(n => n.type === 'points_reset');
    const newSgtYearMonth = resetNotifs.length > 0 ? resetNotifs.reduce((latest, notif) => {
        return notif.sgt_year_month > latest
            ? notif.sgt_year_month : latest
    }, resetNotifs[0].sgt_year_month) : null;
    
    const existingSgtYearMonth = existing?.sgtYearMonth;
    let sgtYearMonth;
    let reset;
    let receive;
    let timestamp;
    if (newSgtYearMonth && (!existingSgtYearMonth || newSgtYearMonth > existingSgtYearMonth)) {
        // existing is from an older month, so we can discard it
        sgtYearMonth = newSgtYearMonth;
        reset = true;
        timestamp = resetNotifs.find(n => n.sgt_year_month === newSgtYearMonth)?.created_at;
        newNotifs.filter(n => n.type === 'receive_rating' && n.sgt_year_month === newSgtYearMonth)
            .forEach(n => {
                if (!receive) {
                    receive = {
                        'rating': n.rating, 
                        'listing_title': n.listing_title,
                        'ratingCounts': 1, 
                        'points': n.increase_in_points
                    };
                } else {
                    receive['rating'] = null; // if multiple ratings then we won't show specific rating, just show total count and points
                    receive['listing_title'] = null; // if multiple listings then we won't show specific listing title
                    receive['ratingCounts'] += 1;
                    receive['points'] += n.increase_in_points;
                }
            });
    } else {
        // in the case where there is no existing month and no new reset notif, we will use the earliest month from new notifs
        const backupSgtYearMonth = newNotifs.reduce((latest, notif) => {
            return notif.sgt_year_month > latest
                ? notif.sgt_year_month : latest
        }, newNotifs[0].sgt_year_month);
        // if no reset notifs or all reset notifs are from an older month, then we keep existing month and aggregate receive_rating notifs from newNotifs that are from the same month as existing month
        sgtYearMonth = existingSgtYearMonth || newSgtYearMonth || backupSgtYearMonth;
        reset = existing?.reset ? true : false; 
        timestamp = existing?.timestamp;
        receive = existing?.receive ? {...existing.receive} : null;
        newNotifs.forEach(n => {
            if (n.sgt_year_month === sgtYearMonth) {
                if (n.type === 'points_reset') {
                    // this covers the case where existing month is the same as latest month of the new notifs
                    reset = true;
                    timestamp = n.created_at;
                } else {
                    if (!receive) {
                        receive = {
                            'rating': n.rating,
                            'listing_title': n.listing_title,
                            'ratingCounts': 1,
                            'points': n.increase_in_points
                        };
                    } else {
                        receive['rating'] = null; // if multiple ratings then we won't show specific rating, just show total count and points
                        receive['listing_title'] = null; // if multiple listings then we won't show specific listing title
                        receive['ratingCounts'] += 1;
                        receive['points'] += n.increase_in_points;
                    }
                    if (!timestamp) {
                        timestamp = n.created_at;
                    } else {
                        timestamp = n.created_at.seconds < timestamp.seconds
                            ? n.created_at : timestamp;
                    }
                }
            }
        })
    } 
    return {type: 'points_change', refs, reset, receive, sgtYearMonth, timestamp};
}