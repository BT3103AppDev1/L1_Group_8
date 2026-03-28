<template>
    <PublicPageLayout>
        <h3 class="onboarding-title">Onboarding</h3>

        <form novalidate @submit.prevent="handleSubmit" class="onboarding-form">
            <!-- Username -->
            <UsernameInput ref="usernameInput" @status-object="onUsernameStatusChange" 
                :is-submitting="isSubmitting"/>

            <!-- Profile Picture -->
            <ProfilePictureInput ref="profilePicInput" @status-object="onProfilePicStatusChange" 
                :is-submitting="isSubmitting"/>

            <!-- Contact Methods -->
            <ContactMethodsInput ref="contactMethodsInput" @contact-change="onContactChange"
                :is-submitting="isSubmitting"/>
            
            <button type="submit" class="btn btn-secondary submit-btn" :disabled="isSubmitting">
                Finish Setup
            </button>
        </form>
    </PublicPageLayout>
</template>

<script>
const CLOUDINARRY_CLOUD_NAME = "dwr4f7ae0";
const CLOUDINARY_UPLOAD_PRESET = "nusos-profile-pics";

import PublicPageLayout from '@/components/PublicPageLayout.vue';
import UsernameInput from '@/components/UsernameInput.vue';
import ProfilePictureInput from '@/components/ProfilePicInput.vue';
import ContactMethodsInput from '@/components/ContactMethodsInput.vue';
import { getCurrentUser } from '@/auth.js';
import { db } from '@/firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import axios from 'axios';

export default {
    name: 'Onboarding',

    components: {
        PublicPageLayout,
        UsernameInput,
        ProfilePictureInput,
        ContactMethodsInput,
    },

    data() {
        return {
            username: "",
            usernameStatus: "idle", // idle or checking or valid or invalid
            profilePicStatus: "idle", // idle or ready 
            profilePicBlob: null,
            contact: null,
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

        onContactChange(contactChange) {
            this.contact = contactChange;
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

            const contactValid = this.$refs.contactMethodsInput.triggerValidation();
            if (!contactValid) {
                return;
            }

            this.isSubmitting = true;

            try {
                /* TODO: remove comment when auth is available
                const user = await getCurrentUser();
                if (!user) {
                    throw new Error("No user found!");
                }
                const uid = user.uid; 
                */

                // Simulate user ID for testing without auth
                const uid = "zrxX7Bt3kZSaPYpyBuaokbJz47i1";

                let profilePicUrl = null;
                if (this.profilePicBlob) {
                    profilePicUrl = await this.uploadToCloudinary(this.profilePicBlob, uid);
                }

                await setDoc(doc(db, "users", uid), {
                    username: this.username,
                    profilePicUrl: profilePicUrl,
                    country_code: this.contact.countryCode,
                    dial_code: this.contact.dialCode,
                    mobile_number: this.contact.mobile,
                    accept_calls: this.contact.acceptCalls,
                    accept_messages: this.contact.acceptMessages,
                    accept_whatsapp: this.contact.acceptWhatsApp,
                    telegram_handle: this.contact.telegram,
                    onboarded: true,
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
    margin-bottom: 1.5rem;
}

.onboarding-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.btn {
    display: flex;
    justify-content: center;
    align-content: center;
    padding: 1rem 0;
    width: 100%;
}

.btn:disabled {
    background-color: var(--gray5);
    border: var(--gray5);
    color: var(--white);
    cursor: not-allowed;
}

.submit-btn {
    font-size: 1rem;
}
</style>