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
                    <p :class="listing?.category?.toLowerCase()">{{ listing?.category }}</p>
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
                    <p :class="listing?.status?.toLowerCase()">{{ listing?.status }}</p>
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
                    <button class="btn btn-primary" @click="editListing">Edit Listing</button>
                    <button class="btn btn-danger" @click="deleteListing">Delete Listing</button>
                </div>
                <!-- Help Button (only for non-lister when listing is awaiting) -->
                <div v-if="canHelp" class="help-button">
                    <button class="btn btn-secondary" @click="offerHelp">I can help :)</button>
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
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore'
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

const offerHelp = async () => {
    if (!user.value) return
    try {
        await updateDoc(doc(db, 'listings', listing.value.id), {
            applicants: arrayUnion(user.value.uid)
        })
        router.push('/my-gigs')
    } catch (e) {
        console.error('Failed to apply:', e)
        alert('Something went wrong. Please try again.')
    }
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

.listing-details-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 12px;
}

.layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.left-column {
  flex: 4;
}

.right-column {
  flex: 1.5;
  min-width: 380px;
  background: var(--white);
  padding: 28px;
  border-radius: var(--radius);
  box-shadow: var(--card-shadow);
  border: 1px solid rgba(0,0,0,0.06);
}

.image-section {
  max-height: 500px;
  overflow: hidden;
  border-radius: var(--radius);
}

.listing-image {
  width: 100%;
  height: 480px;
  object-fit: center;
}

.category p {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

/* Category colors */
.category p.education {
  background-color: var(--primary);
  color: var(--white);
}

.category p.buddy {
  background-color: var(--info);
  color: var(--white);
}

.category p.survival {
  background-color: var(--success);
  color: var(--white);
}

/* Meta section */
.meta-section p {
  color: var(--gray3);
  font-size: 0.9rem;
}

/* Lister profile */
.lister-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-picture {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
}

/* Contact info */
.contact-info p {
  margin: 4px 0;
}


</style>