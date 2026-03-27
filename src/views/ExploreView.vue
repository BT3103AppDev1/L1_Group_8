<template>
  <div class="explore-container">
    <h1 class="page-title">Browse Listings</h1>

    <!--Search Bar-->
    <input v-model="search" type="text" placeholder="Search Listings" class="search-bar"/>

    <!--Category Filter-->
    <!--When categorical button is clicked, other buttons become 'grey' and unselected -->
    <div class="category-filter"> 
      <button v-for="cat in categories" :key="cat"  @click="toggleCategory(cat)" :class="['btn', 'btn-outline', categoryClass(cat)]">
        {{ cat }}
      </button>
    </div>

    <!--Listing Cards Imported from ListingCard component-->
    <div v-if = "filteredListings.length > 0" class="listing-grid"> 
      <ListingCard v-for="item in filteredListings" :key="item.id" :listing="item"/>
    </div>
    <!--Empty State where there is no relevant listings to display-->
    <div v-else class="empty-state">
      <p>No available listings...</p>
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
      //For search purposes to fit functional requirements, 
      // but this will not be displayed for users
      description: data.description?.trim(),
      //Normalisee category to ensure it fit category button 
      category: data.listing_category?.trim(),
      //This one must change because I need the legitimate user with user id 1
      //Make sure there is user table and then use the corresponding user_name
      listedBy: data.lister_id,
      //Update date format into something more readable
      postedOn: data.created_at?.toDate().toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      //Raw timestamp for sorting purposes, but this will not be displayed for users
      createdAt: data.created_at?.toDate(),
      //Location 
      location: data.location_text,
      //Status
      status: data.status?.trim()
    }
    //Sort the listings in descending order based on created_at. Most recent listing displayed first 
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

//Toggle category filter
// If same category is clicked again, it will deselect the filter
const toggleCategory = (cat) => {
  selectedCategory.value = selectedCategory.value === cat ? null : cat
}

const categoryClass = (cat) => {
  if (selectedCategory.value === null) {
    //No category selected, all buttons are coloured
    return `cat-${cat.toLowerCase()}`   
  }
  //None of the categories are selected, all buttons are grey
  if (selectedCategory.value === cat) {
    return `cat-${cat.toLowerCase()}`   
  }
  return 'neutral'                      
}

//Get the filtered listings based on search query and selected category
const filteredListings = computed(() => {
  return listings.value.filter((item) => {
    //Can only show listings that have status "awaiting"
    const matchesStatus = item.status === "Awaiting"
    //Can only show listing that have title that matches search query 
    const matchesSearch = 
      item.title.toLowerCase().includes(search.value.toLowerCase()) ||
      item.description.toLowerCase().includes(search.value.toLowerCase())
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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