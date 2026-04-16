<template>
    <div>
        <ConfirmationModal :showModal="showRatingModal" @update:show-modal="onModalClose">
        
        <h1>Rate the Service Provider</h1>
        <!-- star rating timeee -->
        <div class="rating_stars">
            <span v-for="star in 5" :key ="star" class="star" :class="{ active: star <= selectedRating }" @click="selectedRating= star">★</span>

        </div>
        
        <p>Rating is compulsory and can only be done once</p>

        <!-- done button -->
        <template #buttons>
        <button class="btn-secondary" :disabled="selectedRating === 0" @click="confirmRating">Done</button>
        </template>

        </ConfirmationModal>
    </div>
    
</template>

<script>
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { addRatingsAndPoints } from "@/utils/points.js"
import { db } from '@/firebase.js'
import { doc, updateDoc } from 'firebase/firestore'

export default {
    components: { ConfirmationModal },

    data() {
        return {
            showRatingModal: true,
            selectedRating: 0,
        };
    },

    methods: {
        onModalClose() {
            // Rating is compulsory — closing without rating returns to My Listings.
            // The listing stays Ongoing so the lister can trigger rating again.
            this.$router.push('/my-listings');
        },

        async confirmRating() {
            const { listingId, providerId } = this.$route.query;
            try {
                // Write status + rating atomically — only mark Completed if rating succeeds
                await Promise.all([
                    addRatingsAndPoints(providerId, this.selectedRating, listingId),
                    updateDoc(doc(db, 'listings', listingId), { status: 'Completed' }),
                ]);
                this.showRatingModal = false;
                this.$router.push('/my-listings');
            } catch (e) {
                console.error('Failed to save rating:', e);
                alert('An error occurred while saving your rating. Please try again.');
            }
        }
    },
};

</script>

<style scoped>
.rating_stars {
    font-size: 50px;
    display: flex;
    gap: 2px;
}

.star {
    cursor: pointer;
    color: gray;
}

.star.active {
    color: yellow;
}
</style>