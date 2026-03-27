<template>
  <div class="listing-card">

    <!-- Title -->
    <h2 class="listing-title">{{ listing.title }}</h2>

    <!-- Category tag -->
    <span class="listing-category" :class="categoryClass(listing.category)">
      {{ listing.category }}
    </span>

    <!-- Info group (with all the relevant information) -->
    <div class="listing-info-group">
      <p class="listing-info"><strong>Listed By:</strong> {{ listing.listedBy }}</p>
      <p class="listing-info"><strong>Posted On:</strong> {{ listing.postedOn }}</p>

      <!-- Location with blue icon -->
      <p class="listing-info location-line">
        <span class="location-icon">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <!--Location pin icon was inspired from My Listings Page-->
            <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 118 4.25a1.75 1.75 0 010 3.5z" fill="var(--primary)"/>
          </svg>
        </span>
        {{ listing.location }}
      </p>
      <p class="listing-info"><strong>Status:</strong> {{ listing.status }}</p>
    </div>
    <!-- Button -->
    <button class="listing-btn">
      View Listing Details
    </button>

  </div>
</template>

<script setup>
defineProps({
  listing: {
    type: Object,
    required: true
  }
})

const categoryClass = (cat) => {
  if (cat === "Education") return "education"
  if (cat === "Buddy") return "buddy"
  if (cat === "Survival") return "survival"
  return ""
}
</script>

<style scoped>
/* Card container */
.listing-card {
  background: var(--white);
  border: 1px solid var(--black3);
  border-radius: var(--radius);
  padding: 1rem 1.2rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.2rem; 
}

/* Title */
.listing-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--black2);
  margin-bottom: 0.1rem;
}

/* Category tag */
.listing-category {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  width: fit-content;
  color: var(--white);
  margin-bottom: 0.3rem;
}

/* Category Tag colors */
.listing-category.education {
  background: var(--primary);
}
.listing-category.buddy {
  background: var(--info);
}
.listing-category.survival {
  background: var(--success);
}

/* Info group */
.listing-info-group {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
}

.listing-info {
  font-size: 0.85rem;
  color: var(--gray3);
  line-height: 1.28;
}

/* Button */
.listing-btn {
  margin-top: 0.8rem;
  padding: 9px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  background: var(--secondary);
  color: var(--white);
  border: none;
  cursor: pointer;
  transition: 0.15s ease;
}
.listing-btn:hover {
  opacity: 0.5;
}
</style>