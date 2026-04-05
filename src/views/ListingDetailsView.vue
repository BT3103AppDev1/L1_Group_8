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
                <hr>
                <!-- Edit + Delete buttons (only for lister) -->
                <div v-if="isLister" class="lister-actions">
                    <p> This is your listing! Feel free to edit or delete it at any time.</p>
                    <button @click="editListing">Edit Listing</button>
                    <button @click="deleteListing">Delete Listing</button>
                </div>
                <!-- Help Button (only for non-lister when listing is awaiting) -->
                <div v-if="canHelp" class="help-button">
                    <button class="help-btn" @click="offerHelp">I can help :)</button>
                    <p class="help-notice">
                        By clicking "I can help", you will be expressing your interest to help the lister
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'

// Firebase Imports
import { db } from '@/firebase'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
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

//Computed Property to check if the current user is the lister of this listing
const user = computed(() => auth.currentUser)
const isLister = computed(() => {
    return user.value && listing.value && user.value.uid === listing.value.lister_uid
})
const canHelp = computed(() => {
    if (!user.value || !listing.value) return false
    const isAwaiting = listing.value?.status?.toLowerCase() === "awaiting"
    return !isLister.value && isAwaiting
})

//button handlers
const editListing = () => {
    router.push(`/edit-listing/${listing.value.id}`)
}

const deleteListing = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing?")
    if (!confirmDelete) return
    await deleteDoc(doc(db, "listings", listing.value.id))
    router.push("/explore")
}

const offerHelp = () => {
    alert("You have offered to help! Contact the lister using the info provided.")
}

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

<style scoped>
/* Make sure that it is split into 2 columns */
.layout {
  display: flex;
  flex-direction: row;
  gap: 20px; 
}

/* Left column takes up slightly more */
.left-column {
  flex: 1.5;
}

/* Right column takes less space */
.right-column {
  flex: 1;
}

/* Make images behave nicely */
.listing-image,
.profile-picture {
  max-width: 100%;
  height: auto;
  display: block;
}
</style>