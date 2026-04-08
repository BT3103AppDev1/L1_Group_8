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
            redemption_instruction: '1. Show this reward card at the counter to redeem.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: 'Valid for one-time use only. Cannot be combined with other offers.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward2',
            reward_name: 'Utown Meal Voucher',
            reward_details: '$3 off any meal at Utown eateries.',
            redemption_instruction: '1. Present this reward card at the cashier to redeem.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid on public holidays. \n • Cannot be combined with other promotions.',
            expiry_date: futureDate(60),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward3',
            reward_name: 'Starbucks 10% Off',
            reward_details: 'Get 10% off your total bill at Starbucks outlets in NUS.',
            redemption_instruction: '1. Show this reward card to the barista before placing your order.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other promotions.',
            expiry_date: futureDate(45),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward4',
            reward_name: 'NUS Bookstore 15% Off',
            reward_details: 'Enjoy 15% off on all items at the NUS Bookstore.',
            redemption_instruction: '1. Present this reward card at checkout to redeem.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid on textbooks.\n • Cannot be combined with other discounts.',
            expiry_date: futureDate(90),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward5',
            reward_name: 'Food Court Free Drink',
            reward_details: 'Get a free drink with any meal purchase at NUS food courts.',
            redemption_instruction: '1. Show this reward card to the cashier when ordering your meal.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other offers.\n • Free drink is limited to soft drinks and cannot be exchanged for cash.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward6',
            reward_name: 'NUS Gym Free Pass',
            reward_details: 'Enjoy a free day pass to the NUS gym facilities.',
            redemption_instruction: '1. Present this reward card at the gym reception to redeem.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other offers.\n • Pass is non-transferable and cannot be exchanged for cash.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward7',
            reward_name: 'NUS Library Study Room Booking Priority',
            reward_details: 'Get priority booking for study rooms at the NUS library.',
            redemption_instruction: '1. Show this reward card at the library service desk to redeem.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other offers.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward8',
            reward_name: 'bubble tea 1-for-1',
            reward_details: 'Enjoy a 1-for-1 bubble tea offer at participating outlets in NUS.',
            redemption_instruction: '1. Show this reward card to the cashier when ordering your bubble tea.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other offers.\n • 1-for-1 offer is limited to standard bubble tea flavors and cannot be exchanged for cash.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward9',
            reward_name: 'Acai Bowl Discount',
            reward_details: 'Get 20% off on all acai bowls at participating outlets in NUS.',
            redemption_instruction: '1. Show this reward card to the cashier when ordering your acai bowl.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other offers.\n • Discount is limited to acai bowls and cannot be exchanged for cash.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        },
        {
            id: 'reward10',
            reward_name: 'Free Movie Ticket',
            reward_details: 'Get a free movie ticket for any show at participating cinemas in Singapore.',
            redemption_instruction: '1. Show this reward card at any faculty office to redeem.\n2. Click redeem button when ready.\n3. Present your NUS student ID for verification.\n4. Collect your movie ticket from the faculty office.',
            terms_and_conditions: '• Valid for one-time use only. \n • Not valid with other offers.\n • Ticket is non-transferable and cannot be exchanged for cash.',
            expiry_date: futureDate(30),
            created_at: Timestamp.now(),
        }
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
        { reward_id: 'reward6', status: 'NOT REDEEMED' },
        { reward_id: 'reward7', status: 'NOT REDEEMED' },
        { reward_id: 'reward8', status: 'NOT REDEEMED' },
        { reward_id: 'reward9', status: 'NOT REDEEMED' },
        { reward_id: 'reward10', status: 'NOT REDEEMED' },
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