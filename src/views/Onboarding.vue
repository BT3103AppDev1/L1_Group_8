<template>
    <PublicPageLayout>
        <h3 class="onboarding-title">Onboarding</h3>

        <form novalidate @submit.prevent="handleSubmit" class="onboarding-form">
            <!-- Username -->
            <UsernameInput ref="usernameInput" @status-object="onUsernameStatusChange" 
                :isSubmitting="isSubmitting"/>

            <ProfilePictureInput ref="profilePicInput" @status-object="onProfilePicStatusChange" 
                :isSubmitting="isSubmitting"/>
        </form>
    </PublicPageLayout>
</template>

<script>
const CLOUDINARRY_CLOUD_NAME = "dwr4f7ae0";
const CLOUDINARY_UPLOAD_PRESET = "nusos-profile-pics";

import PublicPageLayout from '@/components/PublicPageLayout.vue';
import UsernameInput from '@/components/UsernameInput.vue';
import ProfilePictureInput from '@/components/ProfilePicInput.vue';
import { getCurrentUser } from '@/auth.js';
import { setDoc } from 'firebase/firestore';
import axios from 'axios';

export default {
    name: 'Onboarding',

    components: {
        PublicPageLayout,
        UsernameInput,
        ProfilePictureInput,
    },

    data() {
        return {
            username: "",
            usernameStatus: "idle", // idle or checking or valid or invalid
            profilePicStatus: "idle", // idle or ready 
            profilePicBlob: null,
            isSubmitting: false,
        }
    },

    methods: {
        onUsernameStatusChange({status, value}) {
            // handle the status object from the UsernameInput component
            this.usernameStatus = status;
            this.username = value;
        },

        onProfilePicStatusChange({status, blob}) {
            // handle the status object from the ProfilePictureInput component
            this.profilePicStatus = status;
            this.profilePicBlob = blob;
        },

        async uploadToCloudinary(blob, uid) {
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("public_id", `${uid}`);

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARRY_CLOUD_NAME}/image/upload`,
                formData,
            );

            if (response.status !== 200) {
                throw new Error("Cloudinary upload failed");
            }

            const data = response.data;
            return data.secure_url; 
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

                let profilePicUrl = null;
                if (this.profilePicBlob) {
                    profilePicUrl = await this.uploadToCloudinary(this.profilePicBlob, uid);
                }

                await setDoc(doc(db, "users", uid), {
                    username: this.username,
                    onboarded: true,
                    profilePicUrl: profilePicUrl,
                }, { merge: true });

                this.$router.replace("/");
            } catch (error) {
                console.error("Onboarding error:", error);
                alert("Something went wrong while saving your profile. Please try again.");
            } finally {
                this.isSubmitting = false;
            }
        },
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

.onboarding-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}
</style>