<template>
    <div class="profile-page">
        <div v-if="isPrivateProfile" class="private-profile-header">
            <PageHeader title="My Profile" />
            <router-link to="/edit-profile" class="edit-icon" aria-label="Edit profile">
                <SquarePen :size="28" color="var(--secondary)"/>
            </router-link>
        </div>
    </div>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue';
import { SquarePen } from 'lucide-vue-next';

export default {
    name: 'Profile',
    components: {
        PageHeader,
        SquarePen
    },
    computed: {
        isPrivateProfile() {  
            return this.$route.name === "PrivateProfile";
        }
    }
}
</script>

<style scoped>
.private-profile-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.edit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: opacity 0.3s ease;
}

.edit-icon:hover {
    color: var(--primary-hover);
}
</style>