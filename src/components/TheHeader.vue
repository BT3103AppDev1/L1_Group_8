<template>
    <header class="header">
        <div class="header-content">
            <!-- logotype -->
            <router-link to="/" class="header-logo" title="Go to Explore" aria-label="Go to Explore">
                <img src="@/assets/logotype.png" alt="NUSOS Logotype" 
                    class="logo-image"/>
            </router-link>

            <!-- hidden below 860px width -->
            <div class="header-nav-and-profile">
                <!-- navigation items -->
                <nav class="header-nav">
                    <router-link v-for="item in navItems" :key="item.name" 
                        :to="item.path" class="nav-item" active-class="active">
                        {{ item.name }}
                    </router-link>
                </nav>

                <!-- profile page nav -->
                <router-link to="/my-profile" class="header-profile" title="Go to Your Profile" aria-label="Go to Your Profile">
                    <img :src="picUrl" :alt="profilePicAltText" 
                        class="profile-pic"/>
                </router-link>
            </div>

            <!-- hidden above 860px width -->
            <div class="menu-container">
            <DropdownMenuRoot>
                <DropdownMenuTrigger as-child>
                    <button class="menu-button" title="Open navigation menu" aria-label="Open navigation menu">
                        <MenuIcon :size="28" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent class="menu-content">
                    <DropdownMenuItem v-for="item in menuItems" :key="item.name" as-child>
                        <router-link :to="item.path" class="menu-item" 
                            :class="{ active: isActive(item.path)}">
                                {{ item.name }}
                        </router-link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuRoot>
            </div>  
        </div>
    </header>
</template>

<script> 
import defaultProfilePic from '@/assets/default-profile-pic.png';
import { Menu as MenuIcon } from 'lucide-vue-next';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuRoot, DropdownMenuTrigger } from 'radix-vue';

export default {
    name: 'TheHeader',

    props: {
        profilePicUrl: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            navItems: [
                { name: 'Explore', path: '/' },
                { name: 'Add Listing', path: '/add-listing' },
                { name: 'My Listings', path: '/my-listings' },
                { name: 'My Gigs', path: '/my-gigs' },
                { name: 'Leaderboard', path: '/leaderboard' },
            ],
        }
    },

    computed: {
        picUrl() {
            return this.profilePicUrl || defaultProfilePic;
        }, 

        profilePicAltText() {
            return this.profilePicUrl ? 'Your Profile Picture' : 'Default Profile Picture';
        },

        menuItems() {
            return [
                { name: 'My Profile', path: '/my-profile' },
                ...this.navItems
            ];
        }
    },

    components: {
        DropdownMenuRoot,
        DropdownMenuTrigger,
        DropdownMenuContent,
        DropdownMenuItem,
        MenuIcon,
    },

    methods: {
        isActive(path) {
            return this.$route.path === path || 
                this.$route.path.startsWith(path + '/');
        }
    }
}
</script>

<style scoped>
.header {
    width: 100%;
    position: fixed;
    top: 0;
    height: 4.5rem;
    padding-top: 0.5rem;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem max(2rem, 7vw) 0.5rem max(2rem, 7vw);
    background-color: #fff;
}

.logo-image {
    height: 3.5rem;
    width: auto;
}

.header-nav-and-profile {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nav-item {
    font-size: 1rem;
    color: #000;
    padding: 0.5rem 1rem;
    margin: 0.25rem;
    text-decoration: none;
}

.nav-item.active, .menu-button.open {
    font-weight: bold;
    background-color: #CCD8E5;
}

.nav-item.active, .menu-button.open {
    border: 0.0625rem solid #002B57;
    border-radius: 0.5rem;
}

.nav-item:hover, .menu-button:hover {
    font-weight: bold;
    background-color: #99B1CB;
    border: 0.0625rem solid #4D77A3;
    border-radius: var(--radius);
}

.profile-pic {
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
}

.menu-container {
    position: relative;
    flex-shrink: 0;
}

.menu-button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    width: 2.75rem;
    height: 2.75rem;
}

.menu-button svg {
    margin: auto;
    vertical-align: middle;
}

@media (min-width: 912px) {
    .menu-container {
        display: none;
    }
}

@media (max-width: 912px) {
    .header-nav-and-profile {
        display: none;
    }
}
</style>

<style>
.menu-content {
    margin-top: 0.25rem;
    margin-right: max(2rem, 7vw);
    background-color: #fff;
    border: 1px solid #8C8C8C;
    border-radius: var(--radius);
    box-shadow: var(--card-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;
    outline: none;
}

.menu-item {
    display: block;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    color: #000;
    text-decoration: none;
    text-align: center;
}

.menu-item.active {
    font-weight: bold;
    background-color: #CCD8E5;
}

.menu-item[data-highlighted] {
    font-weight: bold;
    background-color: #99B1CB;
}
</style>
