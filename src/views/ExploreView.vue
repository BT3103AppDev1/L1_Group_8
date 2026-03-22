<template>
  <div class="explore-container">
    <h1 class="page-title">Browse Listings</h1>

    <!--Search Bar-->
    <input v-model="search" type="text" placeholder="Search Listings" class="search-bar"/>

    <!--Category Filter-->
    <div class="category-filter"> 
      <button v-for="cat in categories" :key="cat" @click="toggleCategory(cat)":class="['filter-btn', selectedCategory === cat ? 'active' : '']">
        {{ cat }}
      </button>
    </div>

    <!--Listing Cards Imported from ListingCard component-->
    <div class="listing-grid"> 
      <ListingCard v-for="item in filteredListings" :key="item.id" :listing="item"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ListingCard from '@/components/ListingCard.vue'

//Firebase imports
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

//Intiialise reactive variables for search, category selection, and listings data
const search = ref('')
const selectedCategory = ref(null)
const categories = ['Education', 'Buddy', 'Survival']

//Listings data from Firestore instead of previously dummy data
const listings = ref([])

//Fetch listings from Firestore
onMounted(async () => {
  const snapshot = await getDocs(collection(db, 'listings'))

  listings.value = snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      //Normalise title for the search 
      title: data.title?.trim(),
      //Normalie category to ensure it fit category button 
      category: data.listing_category?.trim(),
      //This one must change because I need the legitimate user with user id 1
      listedBy: data.lister_id,
      //Convert timestamp to readable date
      postedOn: data.created_at?.toDate().toLocaleDateString(),
      location: data.location_text,
      status: data.status?.trim()
    }
  })
})

//Toggle category filter
// If same category is clicked again, it will deselect the filter
const toggleCategory = (cat) => {
  selectedCategory.value = selectedCategory.value === cat ? null : cat
}

//Get the filtered listings based on search query and selected category
const filteredListings = computed(() => {
  return listings.value.filter((item) => {
    //Can only show listings that have status "awaiting"
    const matchesStatus = item.status === "Awaiting"
    //Can only show listing that have title that matches search query 
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.value.toLowerCase())
    //Can only show listing that have category that matches selected category, or if no category is selected, show all
    const matchesCategory =
      selectedCategory.value === null ||
      item.category === selectedCategory.value

    return matchesStatus && matchesSearch && matchesCategory
  }) 
})
</script>

<style scoped>
.explore-container {
  padding: 2rem 3rem;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #003d7c;
}

.search-bar {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1.5rem;
  font-size: 15px;
}

.category-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 2rem;
}

.filter-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.filter-btn:hover {
  background: #f5f5f5;
}

.filter-btn.active {
  background: #ef7c00;
  color: white;
  border-color: #ef7c00;
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
</style>