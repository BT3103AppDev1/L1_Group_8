import { db } from "@/firebase.js";
import { collection, doc, Timestamp } from "firebase/firestore";

export function addCreateNotifToBatch(batch, {
    uid, 
    type,
    listing_id = null,
    listing_title = null,
    rating = null,
    increase_in_points = null,
    sgt_year_month = null,
}) {
    const notifRef = doc(collection(db, "notifications"));

    batch.set(notifRef, {
        uid,
        type,
        listing_id,
        listing_title,
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
    listing_id = null,
    listing_title = null,
    rating = null,
    increase_in_points = null,
    sgt_year_month = null,
}) {
    const notifRef = doc(collection(db, "notifications"));

    transaction.set(notifRef, {
        uid,
        type,
        listing_id,
        listing_title,
        rating,
        increase_in_points,
        sgt_year_month,
        is_sent: false,
        created_at: Timestamp.now(),
    })
}