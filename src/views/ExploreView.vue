<template>
  <div class="explore-container">
    <div class="header">
      <PageHeader title="Browse Listings" />
    </div>

    <!--Search Bar-->
    <input v-model="search" type="text" placeholder="Search Listings" class="search-bar"/>

    <!--Category Filter-->
    <!--When categorical button is clicked, other buttons become 'grey' and unselected -->
    <div class="category-filter"> 
      <button v-for="cat in categories" :key="cat"  @click="toggleCategory(cat)" :class="['btn', 'btn-outline', categoryClass(cat)]">
        {{ cat }}
      </button>
    </div>

    <!-- loading spinner -->
    <div v-if="isLoading">
        <div v-if="isLoading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" :aria-label="`Loading all awaiting listings...`" />
        </div>
    </div>
    <!--Listing Cards Imported from ListingCard component-->
    <div v-else-if = "filteredListings.length > 0" class="listing-grid"> 
      <ListingCard v-for="item in filteredListings" :key="item.id" :listing="item"/>
    </div>
    <!-- Error State -->
    <div v-else-if="!isLoading && hasError" class="error-state">
      <p class="error-text">Error loading awaiting listings. Please try again later.</p>
    </div>
    <!--Empty State where there is no relevant listings to display-->
    <div v-else class="empty-state">
      <p>No awaiting listings...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ListingCard from '@/components/ListingCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { VueSpinner } from 'vue3-spinners'

// Firebase imports
import { db } from '@/firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { formatListingDate } from '@/utils/formatSgtTime'

// Reactive variables
const search = ref('')
const selectedCategory = ref(null)
const categories = ['Education', 'Buddy', 'Survival']

const listings = ref([])
const isLoading = ref(true)
const hasError = ref(false)

// Fetch listings
onMounted(async () => {
  try {
    const snapshot = await getDocs(collection(db, 'listings'))
    const temp = []

    for (const d of snapshot.docs) {
      const data = d.data()

      // Fetch username from users/{lister_id}
      let username = "Unknown User"
      if (data.lister_id) {
        const userSnap = await getDoc(doc(db, "users", data.lister_id))
        if (userSnap.exists()) {
          const userData = userSnap.data()
          username = String(userData.username ?? "Unknown User").trim()
        }
      }

      // Normalize created_at safely
      let createdAt = null
      if (data.created_at?.toDate) {
        createdAt = data.created_at.toDate()
      }

      temp.push({
        id: d.id,
        title: String(data.title ?? "").trim(),
        description: String(data.description ?? "").trim(),
        category: String(data.listing_category ?? "").trim(),
        lister_name: username,
        postedOn: formatListingDate(createdAt),
        createdAt: createdAt,
        location: String(data.location_text ?? "").trim() || "No location provided",
        status: String(data.status ?? "").trim()
      })
    }

    // Safe sorting
    listings.value = temp.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : 0
      const dateB = b.createdAt ? new Date(b.createdAt) : 0
      return dateB - dateA
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})

// Toggle category
const toggleCategory = (cat) => {
  selectedCategory.value = selectedCategory.value === cat ? null : cat
}

const categoryClass = (cat) => {
  if (selectedCategory.value === null) return `cat-${cat.toLowerCase()}`
  if (selectedCategory.value === cat) return `cat-${cat.toLowerCase()}`
  return 'neutral'
}

// Filtering
const filteredListings = computed(() => {
  const searchTerm = search.value.toLowerCase()

  return listings.value.filter((item) => {
    const statusStr = String(item.status ?? "").toLowerCase()
    const titleStr = String(item.title ?? "").toLowerCase()
    const descStr = String(item.description ?? "").toLowerCase()
    const categoryStr = String(item.category ?? "").toLowerCase()
    const selectedCatStr = String(selectedCategory.value ?? "").toLowerCase()

    const matchesStatus = statusStr.includes("awaiting")
    const matchesSearch = titleStr.includes(searchTerm) || descStr.includes(searchTerm)
    const matchesCategory =
      selectedCategory.value === null || categoryStr === selectedCatStr

    return matchesStatus && matchesSearch && matchesCategory
  })
})
</script>

<style scoped>
.loading {
  display: flex;
  margin-top: 3rem;
  justify-content: center;
}

.error-state {
  text-align: center;
  padding: 2rem 0;
}

.error-text {
  font-weight: bold;
  font-size: 1.25rem;
  color: var(--error);
}

.header {
  margin-bottom: 1rem;
}

.search-bar {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1.5rem;
  font-size: 15px;
}
 
.search-bar:focus {
  outline: 2px solid #002B57;
  border: 1px solid transparent;
} 

.category-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 1.75rem;
}

/* Selected category colors */
.cat-education {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
}

.cat-buddy {
  background: var(--info);
  color: var(--white);
  border-color: var(--info);
}

.cat-survival {
  background: var(--success);
  color: var(--white);
  border-color: var(--success);
}
/* Unselected category style */
.neutral {
  background: var(--gray3);
  color: var(--white);
  border: 1px solid #ccc;
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  row-gap: 22px;
}

/* Empty state styling */
.empty-state {
  text-align: center;
  padding: 2rem 0;
}

.empty-text {
  font-weight: bold;
  font-size: 60px;
  color: var(--black);
}
</style>