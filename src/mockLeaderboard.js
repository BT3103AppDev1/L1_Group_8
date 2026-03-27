import { db } from '@/firebase'
import { collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore'

function monthDate(monthOffset, day = 15) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, day)
}

export function ratingToPoints(rating) {
    if (rating <= 2 ) return 0
    if (rating === 3 ) return 10
    if (rating === 4 ) return 20
    if (rating === 5 ) return 30
    return 0
}

export async function seedAll() {
    const users = [
        {uid: 'user001', username: 'alice', profile_pic_url: ''},
        {uid: 'user002', username: 'bob', profile_pic_url: ''},
        {uid: 'user003', username: 'charlie', profile_pic_url: ''},
        {uid: 'user004', username: 'dave', profile_pic_url: ''},
        {uid: 'user005', username: 'eve', profile_pic_url: ''},
        {uid: 'user006', username: 'frank', profile_pic_url: ''},
        {uid: 'user007', username: 'grace', profile_pic_url: ''},
        {uid: 'user008', username: 'heidi', profile_pic_url: ''},
        {uid: 'user009', username: 'ivan', profile_pic_url: ''},
        {uid: 'user010', username: 'judy', profile_pic_url: ''},
        {uid: 'user011', username: 'jhjh', profile_pic_url: ''},
        {uid: 'user012', username: 'lklkklk', profile_pic_url: ''},
        {uid: 'user013', username: 'hehehhe', profile_pic_url: ''},
        {uid: 'user014', username: 'hahhaha', profile_pic_url: ''},
        {uid: 'user015', username: 'kkkkkk', profile_pic_url: ''},
        {uid: 'user016', username: 'whatttt', profile_pic_url: ''},
        {uid: 'user017', username: 'llolll', profile_pic_url: ''},
        {uid: 'user018', username: 'yayyyy', profile_pic_url: ''},
        {uid: 'user019', username: 'meeiaa', profile_pic_url: ''},
        {uid: 'user020', username: 'baiiii', profile_pic_url: ''},
        {uid: 'user021', username: 'test1', profile_pic_url: ''},
        {uid: 'user022', username: 'test2', profile_pic_url: ''},
        {uid: 'user023', username: 'test3', profile_pic_url: ''},
        {uid: 'user024', username: 'test4', profile_pic_url: ''},
        {uid: 'user025', username: 'test5', profile_pic_url: ''},
        {uid: 'user026', username: 'test6', profile_pic_url: ''},
        {uid: 'user027', username: 'test7', profile_pic_url: ''},
        {uid: 'user028', username: 'test8', profile_pic_url: ''},
        {uid: 'user029', username: 'test9', profile_pic_url: ''},
        {uid: 'user030', username: 'test10', profile_pic_url: ''},
    ]

    for (const u of users) {
        await setDoc(doc(db, 'users', u.uid), {
            username: u.username,
            profile_pic_url: u.profile_pic_url,
            total_points: 0,
            absolute_rank: 0, 
            percentage_rank: 0,
            is_in_top_1_percent: false,
            average_rating: 0,
            number_of_ratings: 0,
        })
    }

    const mockRatings = [
        { receiver_id: 'user001', rating: 5, listing_id: 'listing_001', rated_at: monthDate(0) },
        { receiver_id: 'user002', rating: 4, listing_id: 'listing_002', rated_at: monthDate(0) },
        { receiver_id: 'user003', rating: 3, listing_id: 'listing_003', rated_at: monthDate(0) },
        { receiver_id: 'user004', rating: 2, listing_id: 'listing_004', rated_at: monthDate(0) },
        { receiver_id: 'user005', rating: 2, listing_id: 'listing_005', rated_at: monthDate(0) },
        { receiver_id: 'user006', rating: 5, listing_id: 'listing_006', rated_at: monthDate(0) },
        { receiver_id: 'user007', rating: 3, listing_id: 'listing_007', rated_at: monthDate(0) },
        { receiver_id: 'user008', rating: 2, listing_id: 'listing_008', rated_at: monthDate(0) },
        { receiver_id: 'user009', rating: 5, listing_id: 'listing_009', rated_at: monthDate(0) },
        { receiver_id: 'user010', rating: 5, listing_id: 'listing_010', rated_at: monthDate(0) },
        { receiver_id: 'user011', rating: 5, listing_id: 'listing_001', rated_at: monthDate(0) },
        { receiver_id: 'user012', rating: 4, listing_id: 'listing_002', rated_at: monthDate(0) },
        { receiver_id: 'user013', rating: 3, listing_id: 'listing_003', rated_at: monthDate(0) },
        { receiver_id: 'user014', rating: 2, listing_id: 'listing_004', rated_at: monthDate(0) },
        { receiver_id: 'user015', rating: 2, listing_id: 'listing_005', rated_at: monthDate(0) },
        { receiver_id: 'user016', rating: 5, listing_id: 'listing_006', rated_at: monthDate(0) },
        { receiver_id: 'user017', rating: 3, listing_id: 'listing_007', rated_at: monthDate(0) },
        { receiver_id: 'user018', rating: 2, listing_id: 'listing_008', rated_at: monthDate(0) },
        { receiver_id: 'user019', rating: 5, listing_id: 'listing_009', rated_at: monthDate(0) },
        { receiver_id: 'user020', rating: 5, listing_id: 'listing_010', rated_at: monthDate(0) },
        { receiver_id: 'user021', rating: 5, listing_id: 'listing_001', rated_at: monthDate(0) },
        { receiver_id: 'user022', rating: 4, listing_id: 'listing_002', rated_at: monthDate(0) },
        { receiver_id: 'user023', rating: 3, listing_id: 'listing_003', rated_at: monthDate(0) },
        { receiver_id: 'user024', rating: 2, listing_id: 'listing_004', rated_at: monthDate(0) },
        { receiver_id: 'user025', rating: 2, listing_id: 'listing_005', rated_at: monthDate(0) },
        { receiver_id: 'user026', rating: 5, listing_id: 'listing_006', rated_at: monthDate(0) },
        { receiver_id: 'user027', rating: 3, listing_id: 'listing_007', rated_at: monthDate(0) },
        { receiver_id: 'user028', rating: 2, listing_id: 'listing_008', rated_at: monthDate(0) },
        { receiver_id: 'user029', rating: 5, listing_id: 'listing_009', rated_at: monthDate(0) },
        { receiver_id: 'user030', rating: 5, listing_id: 'listing_010', rated_at: monthDate(0) },

        { receiver_id: 'user001', rating: 4, listing_id: 'listing_011', rated_at: monthDate(-1) },
        { receiver_id: 'user002', rating: 1, listing_id: 'listing_012', rated_at: monthDate(-1) },
        { receiver_id: 'user003', rating: 2, listing_id: 'listing_013', rated_at: monthDate(-1) },
        { receiver_id: 'user004', rating: 5, listing_id: 'listing_014', rated_at: monthDate(-1) },
        { receiver_id: 'user005', rating: 2, listing_id: 'listing_015', rated_at: monthDate(-1) },
        { receiver_id: 'user006', rating: 3, listing_id: 'listing_016', rated_at: monthDate(-1) },
        { receiver_id: 'user007', rating: 2, listing_id: 'listing_017', rated_at: monthDate(-1) },
        { receiver_id: 'user008', rating: 3, listing_id: 'listing_018', rated_at: monthDate(-1) },
        { receiver_id: 'user009', rating: 2, listing_id: 'listing_019', rated_at: monthDate(-1) },
        { receiver_id: 'user010', rating: 3, listing_id: 'listing_020', rated_at: monthDate(-1) },
        { receiver_id: 'user011', rating: 5, listing_id: 'listing_011', rated_at: monthDate(-1) },
        { receiver_id: 'user012', rating: 3, listing_id: 'listing_012', rated_at: monthDate(-1) },
        { receiver_id: 'user013', rating: 1, listing_id: 'listing_013', rated_at: monthDate(-1) },
        { receiver_id: 'user014', rating: 5, listing_id: 'listing_014', rated_at: monthDate(-1) },
        { receiver_id: 'user015', rating: 2, listing_id: 'listing_015', rated_at: monthDate(-1) },
        { receiver_id: 'user016', rating: 3, listing_id: 'listing_016', rated_at: monthDate(-1) },
        { receiver_id: 'user017', rating: 2, listing_id: 'listing_017', rated_at: monthDate(-1) },
        { receiver_id: 'user018', rating: 3, listing_id: 'listing_018', rated_at: monthDate(-1) },
        { receiver_id: 'user019', rating: 2, listing_id: 'listing_019', rated_at: monthDate(-1) },
        { receiver_id: 'user020', rating: 3, listing_id: 'listing_020', rated_at: monthDate(-1) },
        { receiver_id: 'user021', rating: 5, listing_id: 'listing_011', rated_at: monthDate(-1) },
        { receiver_id: 'user022', rating: 3, listing_id: 'listing_012', rated_at: monthDate(-1) },
        { receiver_id: 'user023', rating: 1, listing_id: 'listing_013', rated_at: monthDate(-1) },
        { receiver_id: 'user024', rating: 5, listing_id: 'listing_014', rated_at: monthDate(-1) },
        { receiver_id: 'user025', rating: 2, listing_id: 'listing_015', rated_at: monthDate(-1) },
        { receiver_id: 'user026', rating: 3, listing_id: 'listing_016', rated_at: monthDate(-1) },
        { receiver_id: 'user027', rating: 2, listing_id: 'listing_017', rated_at: monthDate(-1) },
        { receiver_id: 'user028', rating: 3, listing_id: 'listing_018', rated_at: monthDate(-1) },
        { receiver_id: 'user029', rating: 2, listing_id: 'listing_019', rated_at: monthDate(-1) },
        { receiver_id: 'user030', rating: 3, listing_id: 'listing_020', rated_at: monthDate(-1) },
    ]

    for (const r of mockRatings) {
        await addDoc(collection(db, 'ratings'), {
            receiver_id: r.receiver_id,
            rating: r.rating,
            listing_id: r.listing_id,
            rated_at: Timestamp.fromDate(r.rated_at),
        })

        await addDoc(collection(db, 'points'), {
            uid: r.receiver_id,
            increase_in_points: ratingToPoints(r.rating),
            new_total_points: 0, 
            time: Timestamp.fromDate(r.rated_at),
        })
    }
    console.log('Mock data seeded successfully!')
}
