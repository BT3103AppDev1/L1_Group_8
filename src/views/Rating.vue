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

export default {
    components: { ConfirmationModal },

    data() {
        return {
        showRatingModal: true,
        selectedRating: 0,
        };
    },

    methods: {
    openMarkComplete() {
        this.showRatingModal = true;
    },

    confirmRating() {
        console.log("Rating is", this.selectedRating);
        this.showRatingModal = false 
    }
}
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