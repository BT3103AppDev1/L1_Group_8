<template>
  <div class="explore-container">
    <div class="explore-header">
        <PageHeader title="Awaiting Listings" />
    </div>

    <!--Search Bar-->
    <input v-model="search" type="text" placeholder="Search Listings" class="search-bar" :disabled="isLoading"/>

    <!--Category Filter-->
    <!--When categorical button is clicked, other buttons become 'grey' and unselected -->
    <div class="category-filter"> 
      <button v-for="cat in categories" :key="cat"  @click="toggleCategory(cat)" :class="['btn', 'btn-outline', categoryClass(cat)]" :disabled="isLoading">
        {{ cat }}
      </button>
    </div>

    <!-- loading spinner -->
    <div v-if="isLoading">
        <div v-if="isLoading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" :aria-label="`Loading ${username}'s awaiting listings...`" />
        </div>
    </div>
    <!--Listing Cards Imported from ListingCard component-->
    <div v-else-if = "filteredListings.length > 0" class="listing-grid"> 
      <ListingCard v-for="item in filteredListings" :key="item.id" :listing="item"/>
    </div>
    <div v-else-if="!isLoading && hasError" class="error-state">
      <p class="error-text">Error loading {{ username }}'s awaiting listings. Please try again later.</p>
    </div>
    <!--Empty State where there is no relevant listings to display-->
    <div v-else class="empty-state">
      <p class="empty-text">{{ username }} doesn't have any awaiting listings yet</p>
    </div>
  </div>
</template>

<script>
import ListingCard from '@/components/ListingCard.vue';
import { VueSpinner } from 'vue3-spinners';
import PageHeader from '@/components/PageHeader.vue';

//Firebase imports
import { db } from '@/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default {
    name: 'AwaitingListings',

    components: {
        ListingCard,
        VueSpinner,
        PageHeader
    },

    props: {
        uid: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            isLoading: true,
            search: '',
            selectedCategory: null,
            categories: ['Education', 'Buddy', 'Survival'],
            listings: [],
            hasError: false
        }
    },

    computed: {
        filteredListings() {
            return this.listings.filter((item) => {
                //only show listings that have status "awaiting"
                const matchesStatus = item.status === "Awaiting"
                //only show listing that have title that matches search query 
                const matchesSearch =
                (item.title ?? "").toLowerCase().includes(this.search.toLowerCase()) ||
                (item.description ?? "").toLowerCase().includes(this.search.toLowerCase())
                //only show listing that have category that matches selected category, or if no category is selected, show all
                const matchesCategory =
                    this.selectedCategory === null ||
                    item.category === this.selectedCategory

                return matchesStatus && matchesSearch && matchesCategory
            }) 
        }
    },

    methods: {
        async fetchListings(uid) {
            this.isLoading = true
            this.hasError = false
            this.listings = []

            try {
                const q = query(collection(db, 'listings'), 
                    where('lister_id', '==', uid))
                const snapshot = await getDocs(q)

                this.listings = snapshot.docs.map(doc => {
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
                        //Make sure there is user table and then use the corresponding user_name
                        lister_name: data.lister_name ?? "Unknown User",
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
            } catch (error) {
                console.error("Error fetching listings:", error)
                this.hasError = true
            } finally {
                this.isLoading = false  
            }
        },

        toggleCategory(cat) {
            this.selectedCategory = this.selectedCategory === cat ? null : cat
        },

        categoryClass(cat) {
            if (this.selectedCategory === null) {
                //No category selected, all buttons are coloured
                return `cat-${cat.toLowerCase()}`   
            }
            //None of the categories are selected, all buttons are grey
            if (this.selectedCategory === cat) {
                return `cat-${cat.toLowerCase()}`   
            }
            return 'neutral'                      
        }
    },

    mounted() {
        this.fetchListings(this.uid)
    }, 
}
</script>

<style scoped>
.explore-container {
  padding: 0 0 2rem 0;
}

.explore-header {
  margin-bottom: 1.5rem;
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

.search-bar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.category-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 2rem;
}

.loading {
    display: flex;
    margin-top: 3rem;
    justify-content: center;
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

.error-state {
  text-align: center;
  padding: 2rem 0;
}

.empty-text {
  font-weight: bold;
  font-size: 1.25rem;
  color: var(--black);
}

.error-text {
  font-weight: bold;
  font-size: 1.25rem;
  color: var(--error);
}

.btn:disabled {
  background-color: var(--gray5);
  border: 1px solid var(--gray5);
  color: var(--white);
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .listing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 850px) {
  .listing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 550px) {
  .listing-grid {
    grid-template-columns: 1fr;
  }
} 
</style>