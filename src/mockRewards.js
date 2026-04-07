import { db } from "@/firebase";
import { doc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";

function futureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return Timestamp.fromDate(date);
}

export async function seedRewards() {
    console.log("Seeding rewards...");
    const rewards = [
        {
            id: 'reward1',
            reward_name: 'Jollibee $5 Voucher',
            reward_details: '$5 off any meal at Jollibee NUS outlets. Valid for dine-in and takeaway.',
            redemption_instruction: '1. Show this reward card at the counter to redeem.\n2. Present your NUS student ID for verification.',
            terms_and_conditions: 'Valid for one-time use only. Cannot be combined with other offers.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward2',
            reward_name: 'Utown Meal Voucher',
            reward_details: '$3 off any meal at Utown eateries.',
            redemption_instruction: '1. Present this reward card at the cashier to redeem.\n2. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid on public holidays. \n • Cannot be combined with other promotions.',
            expiry_date: futureDate(60),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward3',
            reward_name: 'Starbucks 10% Off',
            reward_details: 'Get 10% off your total bill at Starbucks outlets in NUS.',
            redemption_instruction: '1. Show this reward card to the barista before placing your order.\n2. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other promotions.',
            expiry_date: futureDate(45),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward4',
            reward_name: 'NUS Bookstore 15% Off',
            reward_details: 'Enjoy 15% off on all items at the NUS Bookstore.',
            redemption_instruction: 'Present this reward card at checkout to redeem.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid on textbooks.',
            expiry_date: futureDate(90),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward5',
            reward_name: 'Food Court Free Drink',
            reward_details: 'Get a free drink with any meal purchase at NUS food courts.',
            redemption_instruction: '1. Show this reward card to the cashier when ordering your meal.\n2. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other offers.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
    ];

    for (const reward of rewards) {
        await setDoc(doc(db, 'rewards', reward.id), {
            reward_name: reward.reward_name,
            reward_details: reward.reward_details,
            redemption_instruction: reward.redemption_instruction,
            terms_and_conditions: reward.terms_and_conditions,
            expiry_date: reward.expiry_date,
            created_at: reward.created_at,
        })
    }

    const user = '5TLOFy0rScTP4DoIVS9IBzmjuc52';
    const redemptions = [
        { reward_id: 'reward1', status: 'NOT REDEEMED' },
        { reward_id: 'reward2', status: 'NOT REDEEMED' },
        { reward_id: 'reward3', status: 'REDEEMED', redeemed_at: Timestamp.now() },
        { reward_id: 'reward4', status: 'EXPIRED' },
        { reward_id: 'reward5', status: 'NOT REDEEMED' },
    ];

    for (const redemption of redemptions) {
        await addDoc(collection(db, 'reward_redemption'), {
            reward_id: redemption.reward_id,
            user_id: user,
            status: redemption.status,
            redeemed_at: redemption.redeemed_at ?? null,
        });
    }
}