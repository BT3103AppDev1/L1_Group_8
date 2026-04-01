<template>
    <div id="edit-profile">
        <div v-if="isLoading" class="loading">
            <VueSpinner size="40" color="var(--secondary)" aria-label="Loading profile..." />
        </div>
        <div v-else class="edit-profile-content">
            <div class="profile-pic-section">
                <ProfilePicInput ref="profilePicInput" @status-object="onProfilePicStatusChange" 
                    :is-submitting="isSubmitting" :initial-url="initialProfilePicUrl"
                    :show-title="false" :profile-pic-size="'13vw'"/>
            </div>

            <div class="form-section">
                <UsernameInput ref="usernameInput" @status-object="onUsernameStatusChange" 
                    :is-submitting="isSubmitting" :initial-username="initialUsername"/>

                <ContactMethodsInput 
                    ref="contactMethodsInput" 
                    @contact-change="onContactChange"
                    :is-submitting="isSubmitting"
                    :initial-mobile="initialMobile"
                    :initial-country-code="initialCountryCode"
                    :initial-dial-code="initialDialCode"
                    :initial-accept-calls="initialAcceptCalls"
                    :initial-accept-messages="initialAcceptMessages"
                    :initial-accept-whatsapp="initialAcceptWhatsApp"
                    :initial-telegram="initialTelegram"
                />

                <div class="btn-or-spinner">
                    <button v-if="!isSubmitting" type="button" class="btn btn-secondary submit-btn" @click="handleSubmit">
                        Save Changes
                    </button>
                    <VueSpinner v-else size="40" color="var(--secondary)" aria-label="Saving..." /> 
                </div>

                <button v-if="isEmailPasswordProvider" type="button" class="btn text-link" :disabled="isSubmitting" @click="handleResetPassword">
                    Reset Password
                </button>
            </div>
        </div>
    </div>
</template>

<script>
const CLOUDINARY_CLOUD_NAME = "dwr4f7ae0";
const CLOUDINARY_UPLOAD_PRESET = "nusos-profile-pics";

import ProfilePicInput from '@/components/ProfilePicInput.vue';
import UsernameInput from '@/components/UsernameInput.vue';
import ContactMethodsInput from '@/components/ContactMethodsInput.vue';
import { VueSpinner } from 'vue3-spinners';
import { getCurrentUser } from '@/auth.js';
import { db } from '@/firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase.js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default {
    name: 'EditProfile',

    components: {
        ProfilePicInput,
        UsernameInput,
        ContactMethodsInput,
        VueSpinner,
    },

    data() {
        return {
            isLoading: true,
            isEmailPasswordProvider: false,

            initialProfilePicUrl: null,
            initialUsername: "",
            initialMobile: "",
            initialCountryCode: "SG",
            initialDialCode: "+65",
            initialAcceptCalls: false,
            initialAcceptMessages: false,
            initialAcceptWhatsApp: false,
            initialTelegram: "",

            username: "",
            usernameStatus: "idle", // idle or checking or valid or invalid
            profilePicStatus: "idle", // idle or ready
            profilePicBlob: null,
            contact: null,

            isSubmitting: false,
        }
    },

    async created() {
        await this.loadProfile();
        this.isLoading = false;
    },

    methods: {
        async loadProfile() {
            try {
                // TODO: remove comment when auth is available
                const user = await getCurrentUser();
                if (!user) {
                    throw new Error("No user found!");
                }
                const providerData = user.providerData || [];
                this.isEmailPasswordProvider = providerData.some(provider => provider.providerId === "password");
                const uid = user.uid;

                /* // Stimulate isEmailPasswordProvider for testing without auth
                this.isEmailPasswordProvider = true;

                // Simulate user ID for testing without auth
                const uid = "zrxX7Bt3kZSaPYpyBuaokbJz47i1"; */

                const userDocRef = doc(db, "users", uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) {
                    throw new Error("User document not found!");
                }
                
                const data = userDocSnap.data();
                this.initialProfilePicUrl = data.profile_pic_url || null;
                this.initialUsername = data.username || "";
                this.initialMobile = data.mobile_number || "";
                this.initialCountryCode = data.country_code || "SG";
                this.initialDialCode = data.dial_code || "+65";
                this.initialAcceptCalls = data.accept_calls || false;
                this.initialAcceptMessages = data.accept_messages || false;
                this.initialAcceptWhatsApp = data.accept_whatsapp || false;
                this.initialTelegram = data.telegram_handle || "";
            } catch (error) {
                console.error("Error loading profile:", error);
                alert("Something went wrong while loading your profile. You will be redirected to your profile page.");
                this.$router.replace("/my-profile");
            }
        },

        onUsernameStatusChange({ status, value}) {
            this.usernameStatus = status;
            this.username = value;
        },

        onProfilePicStatusChange({ status, blob }) {
            this.profilePicStatus = status;
            this.profilePicBlob = blob;
        },

        onContactChange(contactChange) {
            this.contact = contactChange;
        },

        async uploadToCloudinary(blob, uid) {
            const formData = new FormData();
            const publicId = `${uid}_${uuidv4()}`;
            formData.append("file", blob);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            formData.append("public_id", publicId);

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
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
                /*
                const user = getCurrentUser();
                if (!user) {
                    throw new Error("No user found!");
                }
                const uid = user.uid; 
                */
                
                // Simulate user ID for testing without auth
                const uid = "zrxX7Bt3kZSaPYpyBuaokbJz47i1";

                let profilePicUrl = this.initialProfilePicUrl;
                if (this.profilePicBlob) {
                    profilePicUrl = await this.uploadToCloudinary(this.profilePicBlob, uid);
                } else if (this.profilePicStatus === "idle" && !this.$refs.profilePicInput.profilePicUrl) {
                    profilePicUrl = null; // User reverted to default 
                }

                const userDocRef = doc(db, "users", uid);
                await updateDoc(userDocRef, {
                    username: this.username,
                    profile_pic_url: profilePicUrl,
                    country_code: this.contact.countryCode,
                    dial_code: this.contact.dialCode,
                    mobile_number: this.contact.mobile,
                    accept_calls: this.contact.acceptCalls,
                    accept_messages: this.contact.acceptMessages,
                    accept_whatsapp: this.contact.acceptWhatsApp,
                    telegram_handle: this.contact.telegram,
                });

                alert("Profile updated successfully! You will be redirected to your profile page.");
                
                this.$router.replace("/my-profile"); 
            } catch (error) {
                console.error("Error updating profile:", error);
                alert("Something went wrong while updating your profile. Please try again.");
            } finally {
                this.isSubmitting = false;
            }
        },

        async handleResetPassword() {
            try {
                const user = getCurrentUser();
                if (!user) {
                    throw new Error("No user found!");
                }
                await sendPasswordResetEmail(auth, user.email);
                alert("An email with password reset instructions has been sent to your email address. Please check your inbox and follow the instructions in the email.");
            } catch (error) {
                console.error("Error sending password reset email:", error);
                alert("Something went wrong while sending the password reset email. Please try again.");
            }
        }
    }
}
</script>

<style scoped>
.loading {
    display: flex;
    margin-top: 30vh;
    justify-content: center;
}

.edit-profile-content {
    display: flex;
    justify-content: space-between;
    gap: 4rem;
    padding: 0 4rem;
}

.profile-pic-section {
    display: flex;
    justify-content: center;
    align-self: flex-start;
    margin-top: 15vh;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 50vw;
}

.btn-or-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 2rem;
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

.text-link {
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: bold;
    color: var(--primary);
    cursor: pointer;
    text-align: center;
}

.text-link:hover:not(:disabled) {
    color: var(--primary-hover);
}

.submit-btn {
    font-size: 1rem;
}
</style>