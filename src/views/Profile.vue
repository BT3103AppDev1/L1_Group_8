<template>
    <div class="profile-page">
        <div v-if="isPrivateProfile" class="private-profile-header">
            <PageHeader title="My Profile" />
            <router-link to="/edit-profile" class="edit-icon" aria-label="Edit profile">
                <SquarePen :size="28" color="var(--secondary)"/>
            </router-link>
        </div>

        <div v-if="isPrivateProfile" class="sign-out-section">
            <button class="btn btn-danger" @click="showSignOutModal = true">
                Sign Out
            </button>
        </div>

        <!-- sign out confirmation modal -->
        <confirmation-modal v-model:showModal="showSignOutModal" title="Sign out?">
            Are you sure you want to sign out?

            <template #buttons>
                <button class="btn cancel-btn modal-btn" 
                    :disabled="isSigningOut" @click="showSignOutModal = false">
                        Cancel
                </button>
                <div class="btn-or-spinner">
                    <button class="btn btn-danger modal-btn" v-if="!isSigningOut" @click="handleSignOut">
                        Confirm
                    </button>
                    <VueSpinner v-else size="30" color="var(--secondary)" aria-label="Signing out..." />
                </div>
            </template>
        </confirmation-modal>
    </div>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue';
import { SquarePen } from 'lucide-vue-next';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { VueSpinner } from 'vue3-spinners';
import { auth } from '@/firebase.js';
import { signOut } from 'firebase/auth';

export default {
    name: 'Profile',
    components: {
        PageHeader,
        SquarePen,  
        ConfirmationModal,
        VueSpinner,
    },
    data() {
        return {
            showSignOutModal: false,
            isSigningOut: false,
        };
    },
    computed: {
        isPrivateProfile() {  
            return this.$route.name === "PrivateProfile";
        }
    },
    methods: {
        async handleSignOut() {
            this.isSigningOut = true;
            try {
                await signOut(auth);
                this.$router.replace('/sign-in');
            } catch (error) {
                console.error('Error signing out:', error);
                alert("Something went wrong while signing out. Please try again.")
            } finally {
                this.isSigningOut = false;
                this.showSignOutModal = false;
            }
        }
    }
}
</script>

<style scoped>
.profile-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.25rem;
}

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

.sign-out-section {
    display: flex;
    justify-content: flex-end;
}

.btn {
    display: flex;
    justify-content: center;
    align-content: center;
    padding: 0.75rem 0;
    width: 15vw;
}

.btn:disabled {
    background-color: var(--gray5);
    border: var(--gray5);
    color: var(--white);
    cursor: not-allowed;
}

.btn-or-spinner {
    width: 15vw;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cancel-btn {
    background: var(--gray4);
    color: var(--white);
}

.cancel-btn:hover {
    background-color: var(--gray5);
}

.modal-btn {
    width: 15vw;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>