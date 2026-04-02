<template>
    <div class="listing-details-container">
        <h1>Listing Details</h1>
        <!-- Main Layout with the left and right sections-->
        <div class="layout">
            <!--Left Column-->
            <div class="left-column">
                <div class="image-section">
                    <img :src="listing?.photoURL" alt="Listing Image" class="listing-image"/>
                </div>
                <div class="category">
                    <p>{{ listing?.category }}</p>
                </div>
                <div class="title">
                    <h2>{{ listing?.title }}</h2>
                </div>
                <!--Meta Section-->
                <div class="meta-section">
                    <p>
                        Posted by {{ listing?.lister_name }} •
                        {{ listing?.postedOn }} •
                        {{ listing?.location }}
                    </p>
                </div>
                <hr>
                <div class="description">
                    <h3>Description</h3>
                    <p>{{ listing?.description }}</p>
                </div>
                <div class="payment-section">
                    <h3>Payment Mode</h3>
                    <p>{{ listing?.payment_mode }}</p>
                </div>
                <div class="status-section">
                    <h3>Service Status</h3>
                    <p>{{ listing?.status }}</p>
                </div> 
            </div>
            <!-- Right Column -->
            <div class="right-column">
                <div class="lister-info">
                    <h3>Lister Information</h3>
                    <div class="lister-profile">
                        <img :src="listing?.profile_picture" alt="Profile Picture" class="profile-picture"/>
                        <p>{{ listing?.lister_name }}</p>
                    </div>
                </div>
                <hr>
                <div class="contact-info">
                    <h3>Contact Information</h3>
                    <p><strong>Phone:</strong> {{ listing?.dial_code }} {{ listing?.phone_number }}</p>
                    <p><strong>Telegram:</strong> {{ listing?.telegram_handle }}</p>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'

// Firebase Imports
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Router Imports
import { useRouter, useRoute } from "vue-router"

// Import Router + Auth
const router = useRouter()
const route = useRoute()
const auth = getAuth()

// Listing Data
const listing = ref(null)
const defaultImage = "@/assets/default-listing.jpg"

onMounted(async () => {

    // Get listing ID from URL
    const listingId = route.params.id
    //Fetch the listing document from Firestore using the listing ID
    const listingSnapShot = await getDoc(doc(db, "listings", listingId))
    //Error handling if listing document does not exist.
    //Will redirect back into the explore page
    if (!listingSnapShot.exists()) {
        console.error("Listing not found")
        router.push("/")   
        return
    }
    //Listing data here
    const listingData = listingSnapShot.data()

    //Fetch the user document
    const userSnapShot = await getDoc(doc(db, "users", listingData.lister_id))
    //Again, redirect back to explore page if user dont exist anymore
    if (!userSnapShot.exists()) {
        console.error("User not found")
        router.push("/")
        return
    }
    const userData = userSnapShot.data()

    //Merge listing and user data into one single object for easier handling 
    listing.value = {

        // Listing fields
        id: listingId,
        title: listingData.title?.trim(),
        description: listingData.description?.trim(),
        category: listingData.listing_category?.trim(),
        location: listingData.location_text,
        status: listingData.status?.trim(),
        photoURL: listingData.picture_url || defaultImage,
        payment_mode: listingData.payment_mode?.trim() || "N/A",

        // Format created_at into readable date
        postedOn: listingData.created_at
            ?.toDate()
            .toLocaleDateString("en-SG", {
                year: "numeric",
                month: "short",
                day: "numeric"
            }),
        createdAt: listingData.created_at?.toDate(),

        // User fields
        lister_uid: listingData.lister_id,
        lister_name: userData.username?.trim() || "Unknown",
        profile_picture: userData.profile_pic_url || defaultImage,
        dial_code: userData.dial_code || "+65",
        phone_number: userData.mobile_number || "N/A",
        telegram_handle: userData.telegram_handle || "N/A"
    }
})
</script>