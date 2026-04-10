<template>
    <div>
        <ConfirmationModal :showModal="showRatingModal" @update:show-modal= "showRatingModal = $event">
        
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
import "@/assets/main.css";
import { db } from '@/firebase.js';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

export default {
    components: { ConfirmationModal },

    data() {
        return {
            showRatingModal: true,
            selectedRating: 0,
        };
    },

    methods: {
        async confirmRating() {
            const { listingId, providerId } = this.$route.query;
            try {
                await Promise.all([
                    updateDoc(doc(db, 'listings', listingId), {
                        rating_given: this.selectedRating,
                    }),
                    addDoc(collection(db, 'ratings'), {
                        receiver_id: providerId,
                        rating: this.selectedRating,
                        rated_at: new Date(),
                        listing_id: listingId,
                    }),
                ]);
                this.showRatingModal = false;
                this.$router.push('/my-listings');
            } catch (e) {
                console.error('Failed to save rating:', e);
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