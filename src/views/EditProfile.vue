<template>
    <div id="edit-profile">
        <div class="profile-pic-section">
            <ProfilePictureInput ref="profilePicInput" @status-object="onProfilePicStatusChange" 
                :isSubmitting="isSubmitting" :initial-url="initialProfilePicUrl"/>
        </div>

        <div id="form-section">
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
        </div>
    </div>
</template>

<script>
import ProfilePictureInput from '@/components/ProfilePicInput.vue';
import UsernameInput from '@/components/UsernameInput.vue';
import { getCurrentUser } from '@/auth.js';
import { db } from '@/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import ContactMethodsInput from '@/components/ContactMethodsInput.vue';

export default {
    name: 'EditProfile',

    components: {
        ProfilePictureInput,
        UsernameInput,
        ContactMethodsInput,
    },

    data() {
        return {
            initialProfilePicUrl: null,
            initialUsername: null,
            isSubmitting: false,
        }
    },
}
</script>