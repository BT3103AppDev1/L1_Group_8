<template>
  <div class="card">
    <h2 class="card-title">{{ listing.title }}</h2>

    <span class="card-category">
      {{ listing.category }}
    </span>

    <p class="card-info"><strong>Listed By:</strong> {{ listing.listedBy }}</p>
    <p class="card-info"><strong>Posted On:</strong> {{ listing.postedOn }}</p>
    <p class="card-info">{{ listing.location }}</p>

    <p class="card-status">
      Status: <span class="status-text">{{ listing.status }}</span>
    </p>

    <button class="card-btn">
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
</script>