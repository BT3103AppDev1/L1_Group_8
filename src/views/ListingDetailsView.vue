<template>
    <h1> Listing Details </h1>
    <p>{{ listing?.title }}</p>
    <p>{{ listing?.description }}</p>
    <p>{{ listing?.category }}</p>
    <p>{{ listing?.location }}</p>
    <p>{{ listing?.status }}</p>
    <p>{{ listing?.lister_name }}</p>
    <p>{{ listing?.postedOn }}</p>
    <p> {{ listing?.photoURL }}</p>
    <p>{{ listing?.profile_picture }}</p>
    <p>{{ listing?.dial_code }}</p>
    <p>{{ listing?.phone_number }}</p>  
    <p>{{ listing?.telegram_handle }}</p>
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