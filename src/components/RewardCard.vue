<template>
    <div class="reward-card">
        <div class="reward-content">
            <!-- Reward title is reward_name in firestore -->
            <h2 class="reward-title">title</h2>
            <!-- expiry_date in firestore -->
            <h3 class="expiry-date">Expiry Date: date </h3>
            <!-- under reward redemption in firestore as status -->
            <h3 class="redemption-status">Status: status </h3>
        </div>
        <button class="reward-detail-button" @click="viewRewardDetail">View Details</button>
    </div>
</template>

<script>
    import { doc, updateDoc, increment } from "firebase/firestore"
    import { db } from "@/firebase"
    import { useRouter } from "vue-router"

    const router = useRouter();

    const viewRewardDetail = async () => {
        router.push()
    }
</script>

<style scoped>
    .reward-card {
        background: var(--white);
        border: 1px solid var(--black3);
        border-radius: var(--radius);
        box-shadow: var(--card-shadow);
        display: flex;
        flex-direction: column;
        width: 240px;
        gap: 0.55rem;
        overflow: hidden;
        min-height: 240px;
        margin: 10px 0px 0px 0px;
    }

    .reward-content {
        padding: 1.2rem 1.4rem;
        flex-direction: column;
        display: flex;
    }

    .reward-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--black2);
        margin-bottom: 0.2rem;
    }

    .expiry-date, .redemption-status {
        font-size: 1rem;
        color: var(--black3);
        line-height: 1.35;
    }

    .reward-detail-button {
        margin-top: auto; 
        width: 100%;
        padding: 14px 0;
        font-size: 1rem;
        font-weight: 600;
        background: var(--secondary);
        color: var(--white);
        border: none;
        cursor: pointer;
        transition: 0.15s ease;
    }



</style>