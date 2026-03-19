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
import { ref, computed } from 'vue'
import ListingCard from '@/components/ListingCard.vue'

//Intiialise reactive variables for search, category selection, and listings data
const search = ref('')
const selectedCategory = ref(null)
const categories = ['Education', 'Buddy', 'Survival']

//Tempory data for listings - to be replaced with API calls in future
const listings = ref([
  {
    id: 1,
    title: 'Get rid of Lizards!',
    category: 'Survival',
    listedBy: 'oheohe67',
    postedOn: '29 February 2026',
    location: 'Pioneer House',
    status: 'Awaiting'
  },
  {
    id: 2,
    title: 'CareerFest Buddy',
    category: 'Buddy',
    listedBy: 'sher78',
    postedOn: '29 February 2026',
    location: 'UTown',
    status: 'Awaiting'
  },
  {
    id: 3,
    title: 'CS2030 Project Help!!',
    category: 'Education',
    listedBy: 'AmyLee88',
    postedOn: '29 February 2026',
    location: 'Sheares Hall',
    status: 'Awaiting'
  }
])

//Toggle category filter - if same category is clicked again, it will deselect the filter
const toggleCategory = (cat) => {
  selectedCategory.value = selectedCategory.value === cat ? null : cat
}

//Get the filtered listings based on search query and selected category
const filteredListings = computed(() => {
  return listings.value.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const matchesCategory = selectedCategory.value === null || item.category === selectedCategory.value
    return matchesSearch && matchesCategory
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