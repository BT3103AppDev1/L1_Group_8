<template>
    <PublicPageLayout>
        <h3 class="onboarding-title">Onboarding</h3>

        <form novalidate @submit.prevent="handleSubmit">
            <!-- Username -->
            <UsernameInput ref="usernameInput" @status-object="onUsernameStatusChange"/>
        </form>
    </PublicPageLayout>
</template>

<script>
import PublicPageLayout from '@/components/PublicPageLayout.vue';
import UsernameInput from '@/components/UsernameInput.vue';
import { getCurrentUser } from '@/auth.js';
import { setDoc } from 'firebase/firestore';

export default {
    name: 'Onboarding',

    components: {
        PublicPageLayout,
        UsernameInput,
    },

    data() {
        return {
            username: "",
            usernameStatus: "idle", // idle or checking or valid or invalid
            isSubmitting: false,
        }
    },

    methods: {
        onUsernameStatusChange({status, value}) {
            // handle the status object from the UsernameInput component
            this.usernameStatus = status;
            this.username = value;
        },
    },

    async handleSubmit() {
        if (this.usernameStatus !== "valid") {
            const usernameValid = await this.$refs.usernameInput.fullValidation();
            if (!usernameValid) {
                return;
            }
        }

        this.isSubmitting = true;

        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error("No user found!");
                return; 
            }
            const uid = user.uid;

            await setDoc(doc(db, "users", uid), {
                username: this.username,
                onboarded: true,
            }, { merge: true });
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Something went wrong while saving your profile. Please try again.");
        } finally {
            this.isSubmitting = false;
        }
    },
}
</script>

<style scoped>
.onboarding-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--secondary);
    margin-bottom: 1rem;
}
</style>