<template>
  <div class="listing-card">

    <!-- Title -->
    <h2 class="listing-title">{{ listing.title }}</h2>

    <!-- Category tag -->
    <span class="listing-category" :class="categoryClass(listing.category)">
      {{ listing.category }}
    </span>
    <!-- Info group -->
    <div class="listing-info-group">
      <p class="listing-info"><strong>Listed By:</strong> {{ listing.listedBy }}</p>
      <p class="listing-info"><strong>Posted On:</strong> {{ listing.postedOn }}</p>

      <!-- Location with blue icon -->
      <p class="listing-info location-line">
        <span class="location-icon">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
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
  padding: 1.2rem 1.4rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  font-size: 1rem;
  overflow: hidden; 
}

/* Title */
.listing-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--black2);
  margin-bottom: 0.2rem;
}

/* Category tag */
.listing-category {
  font-size: 0.9rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;
  color: var(--white);
  margin-bottom: 0.4rem;
}

/* Category Tag colors */
.listing-category.education { background: var(--primary); }
.listing-category.buddy { background: var(--info); }
.listing-category.survival { background: var(--success); }

/* Info group */
.listing-info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.listing-info {
  font-size: 1rem;
  color: var(--black3);
  line-height: 1.35;
}

/* Button — clean full-width footer */
.listing-btn {
  margin-top: 1rem;
  margin-left: -1.4rem;
  margin-right: -1.4rem;
  margin-bottom: -1.2rem;
  width: calc(100% + 2.8rem);
  padding: 14px 0;
  font-size: 1rem;
  font-weight: 600;
  background: var(--secondary);
  color: var(--white);
  border: none;
  cursor: pointer;
  transition: 0.15s ease;
  border-radius: 0 0 var(--radius) var(--radius);
}

.listing-btn:hover {
  opacity: 0.5;
}
</style>