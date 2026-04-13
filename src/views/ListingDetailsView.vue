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

                <!-- Analytics (only for lister) -->
                <div v-if="isLister" class="analytics-card">
                    <div class="analytics-total">
                        <span class="analytics-number">{{ totalClicks }}</span>
                        <span class="analytics-label">Total Views</span>
                    </div>
                    <p class="analytics-subtitle">No. of times people clicked to view your listing details</p>
                    <div class="chart-toggle">
                        <button :class="['toggle-btn', { active: activeView === 'today' }]" @click="activeView = 'today'">Today</button>
                        <button :class="['toggle-btn', { active: activeView === 'week' }]" @click="activeView = 'week'">Last 7 Days</button>
                    </div>
                    <Line v-if="activeView === 'week'" :data="weekChartData" :options="chartOptions" />
                    <Line v-else :data="todayChartData" :options="chartOptions" />
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
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)
import { addCreateNotifToBatch } from '@/utils/notifications.js'

// Firebase Imports
import { db } from '@/firebase'
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, increment, writeBatch } from 'firebase/firestore'
import { getSgtDateKey, getSgtHourKey } from '@/utils/formatSgtTime'
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
const clicksByDay = ref({})
const clicksByHour = ref({})
const activeView = ref('week')

const totalClicks = computed(() => Object.values(clicksByDay.value).reduce((sum, v) => sum + v, 0))

const weekChartData = computed(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
        days.push(key)
    }
    return {
        labels: days.map(date => {
            const [,, day] = date.split('-')
            return `${parseInt(day)} ${new Date(date).toLocaleString('en-GB', { month: 'short' })}`
        }),
        datasets: [{
            data: days.map(date => clicksByDay.value[date] ?? 0),
            borderColor: '#003D7C',
            backgroundColor: 'rgba(0,61,124,0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
        }],
    }
})

const todayChartData = computed(() => {
    const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
    return {
        labels: hours.map(h => {
            const hr = parseInt(h)
            if (hr === 0) return '12am'
            if (hr < 12) return `${hr}am`
            if (hr === 12) return '12pm'
            return `${hr - 12}pm`
        }),
        datasets: [{
            data: hours.map(h => clicksByHour.value[`${todayKey}_${h}`] ?? 0),
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124,58,237,0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
        }],
    }
})

const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }

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
        const batch = writeBatch(db);
        batch.update(doc(db, 'listings', listing.value.id), {
            applicants: arrayUnion(user.value.uid),
            [`applied_at.${user.value.uid}`]: new Date(),
        });
        addCreateNotifToBatch(batch, {
            uid: listing.value.lister_uid,
            type: 'receive_applicant',
            listing_title: listing.value.title,
            listing_id: listing.value.id,
        })
        await batch.commit();
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
    clicksByDay.value = listingData.clicks_by_day ?? {}
    clicksByHour.value = listingData.clicks_by_hour ?? {}

    // Record click for non-listers
    if (auth.currentUser && auth.currentUser.uid !== listingData.lister_id) {
        updateDoc(doc(db, 'listings', listingId), {
            [`clicks_by_day.${getSgtDateKey()}`]: increment(1),
            [`clicks_by_hour.${getSgtHourKey()}`]: increment(1),
        }).catch(() => {})
    }

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

.analytics-card {
  margin-top: 20px;
  background: #F8F9FB;
  border: 1px solid #E5E9EF;
  border-radius: 8px;
  padding: 16px;
}
.analytics-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}
.analytics-number {
  font-size: 36px;
  font-weight: 700;
  color: #003D7C;
  line-height: 1;
}
.analytics-label {
  font-size: 14px;
  font-weight: 600;
  color: #6E6E6E;
}
.analytics-subtitle {
  font-size: 11px;
  color: #9CA3AF;
  margin-bottom: 12px;
}
.no-data {
  color: #9CA3AF;
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
}
.chart-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.toggle-btn {
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #003D7C;
  border-radius: 999px;
  background: none;
  color: #003D7C;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.toggle-btn.active {
  background: #003D7C;
  color: #fff;
}
</style>