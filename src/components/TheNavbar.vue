<template>
  <nav class="topnav">
    <!-- Logo -->
    <router-link class="nav-logo" to="/my-listings">
      <img src="@/assets/logomark.png" alt="NUSOS" class="logo-img" />
      <span class="logo-text">NUSOS</span>
    </router-link>

    <!-- Nav links -->
    <div class="nav-links">
      <router-link class="nav-link" to="/explore">Explore</router-link>
      <router-link class="nav-link" to="/create-listing">Add Listing</router-link>
      <router-link class="nav-link" to="/my-listings">My Listings</router-link>
      <router-link class="nav-link" to="/my-gigs">My Gigs</router-link>
      <router-link class="nav-link" to="/leaderboard">Leaderboard</router-link>
    </div>

    <!-- User avatar -->
    <div class="nav-avatar" title="My Profile">ZE</div>
  </nav>
</template>

<script>
export default {
  name: 'TheNavbar',
}
</script>

<style scoped>
.topnav {
  background: #003D7C;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(2rem, 7vw);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-img {
  height: 32px;
  width: auto;
  filter: brightness(0) invert(1);
}
.logo-text {
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 0.04em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}
.nav-link {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.nav-link:hover {
  color: #fff;
}
.nav-link.router-link-active {
  color: #fff;
  font-weight: 700;
  border-bottom-color: #EF7C00;
}

.nav-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #EF7C00;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  transition: transform 0.15s;
}
.nav-avatar:hover { transform: scale(1.08); }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .topnav { padding: 0 1rem; }
}
</style>
