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
import { addRatingsAndPoints } from "@/utils/points.js"
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
                await addRatingsAndPoints(providerId, this.selectedRating, listingId);
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