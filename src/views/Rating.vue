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
import { doc, updateDoc, addDoc, collection, runTransaction } from 'firebase/firestore';
import { ratingToPoints } from "@/utils/points.js"
import ListingDetailsView from './ListingDetailsView.vue'; //import from ruoyi side
import { formatTimestamp, getSgtYearMonth, getMsToSgtNextMonth } from '@/utils/formatSgtTime.js'; //for the yr month, ref from PointsHistory
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

            // to point to listing and provider
            const listingRef = doc(db, "listings", listingId)
            const provideRef = doc(db, "listings", providerId)

            //convert the ratings to points
            const pointsGot = ratingToPoints(this.selectedRating);

            try {
                await runTransaction(db, async(transaction) => {
                    // fetch data
                    const listingSnapshot = await transaction.get(listingRef);
                    const providerSnapshot = await transaction.get(provideRef);

                    //to object
                    const listingDataObj = listingSnapshot.data()
                    const providerDataObj = providerSnapshot.data()

                    // get the category & title 
                    const listing_category= listingDataObj.listing_category
                    const listing_title = listingDataObj.title

                    // must select the rating field for the relevant category 
                    let ave_rating = "";
                    let rating_count = "";

                    if (listing_category == "Education") {
                        ave_rating = "edu_avg_rating";
                        rating_count = "edu_rating_count";
                    } 

                    if (listing_category == "Buddy") {
                        ave_rating = "buddy_avg_rating";
                        rating_count = "buddy_rating_count";
                    } 

                    if (listing_category == "Survival") {
                        ave_rating = "survival_avg_rating";
                        rating_count = "survival_rating_count";
                    } 


                    //update the rating fields calculation
                    const past_ave_rating = providerSnapshot[ave_rating];
                    const past_rating_count = providerSnapshot[rating_count];

                    const update_ave_rating = ((past_ave_rating*past_rating_count) + this.selectedRating) / update_count;
                    const update_count = past_rating_count + 1;

                    // update provider's rating
                    transaction.update(provideRef, {
                        [ave_rating]: update_ave_rating,
                        [rating_count]: update_count,
                    });

                    // rating record 
                    const ratingRef = doc(collection(db,"ratings"));
                    transaction.set(ratingRef, {
                        receiver_id: providerId,
                        rating: this.selectedRating,
                        new_avg_rating: update_ave_rating,
                        listing_id: listingId,
                        listing_category: listing_category,
                        listing_title: listing_title,
                        rated_at: new Date(),
                    })

                    // for the pointsLog
                    const pointsLogRef = doc(collection(db, "pointsLogs"));
                    transaction.set(pointsLogRef), {
                        uid: providerId,
                        listing_id: listingId,
                        listing_title: listing_title,
                        increase_in_points: pointsGot,
                        // new_total_points: not sure how to generate this...
                        sgt_year_month: this.currYearMonth,
                        time: new Date()

                    }
                })
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