<template>
    <PublicPageLayout>
        <h3 class="consent-title">User Consent Form</h3>
        
        <div class="consent-content">
            <section class="consent-section">
                <h4 class="section-title">1. Data Subject Consent</h4>
                <p>I consent to NUSOS processing my personal data (by 
                    itself or with the assistance of a data intermediary) 
                    specified in Section 2 for the purposes described in 
                    Section 3 of this declaration.</p>
            </section>

            <section class="consent-section">
                <h4 class="section-title">2. Personal Data</h4>
                <p>2.1 The following types of personal data may be processed 
                    by the Organisation:</p>
                <ul class="data-list">
                    <li>2.1.1 Username,</li>
                    <li>2.1.2 Profile Picture,</li>
                    <li>2.1.3 Mobile Number,</li>
                    <li>2.1.4 Telegram Handle,</li>
                    <li>2.1.5 And Location.</li>
                </ul>
            </section>

            <section class="consent-section">
                <h4 class="section-title">3. Purpose of Processing</h4>
                <p>3.1	The Organisation may process my personal data 
                    for the following purposes:</p>
                <ul class="data-list">
                    <li>3.1.1 To uniquely identify each user within the web 
                        application and display the username and profile picture 
                        to other users, </li>
                    <li>3.1.2 To enable communication between users who request
                        services and users who provide services, </li>
                    <li>3.1.3 And to facilitate entering service locations and 
                        filtering service listings by proximity. </li>
                </ul>
            </section>

            <section class="consent-section">
                <h4 class="section-title">4. Processing of Data Overseas</h4>
                <p>4.1 Note: No personal data will be processed and transferred 
                    outside of the Republic of Singapore.</p>
            </section>

            <section class="consent-section">
                <h4 class="section-title">5. Withdrawal of Consent</h4>
                <p class="withdrawal-content">5.1 The consent to processing of my personal data and the 
                    provision of the above-mentioned data are voluntary and I may, 
                    on giving reasonable notice to the Organisation, withdraw any consent given, 
                    or deemed to have been given. </p>
                <p class="withdrawal-content">5.2 On receipt of any notice of withdrawal, the Organisation shall inform 
                    me of the likely consequences of withdrawing my consent and shall cease
                    (and cause its data intermediaries and agents to cease) processing my 
                    personal data.</p>
                <p>5.3	I acknowledge that my withdrawal of consent does not affect the 
                    lawfulness of the processing of the personal data before its withdrawal.</p>
            </section>

            <section class="consent-section">
                <h4 class="section-title">6. Declaration</h4>
                <p>6.1	I have read and understood this declaration of consent and its provisions 
                    and consent to the processing of my personal data listed in Section 2 for the 
                    purposes listed in Section 3 and in accordance with the remainder of this 
                    declaration of consent. </p>
            </section>

            <p class="consent-note">If you have any questions with regard to this declaration of 
                consent and/or the processing of your personal data by NUSOS, please contact 
                <a href="mailto:nusos.project@gmail.com">nusos.project@gmail.com</a></p>
            <p class="consent-note">Further information on the processing of your personal data 
                by NUSOS can be found in the privacy policy available at NUSOS’s website.</p>
        </div>

        <!-- buttons -->
        <div class="consent-buttons">
            <button class="btn btn-secondary-outline" 
                :disabled="isLoadingAccept" @click="showDeclineModal = true">
                    Decline
            </button>
            <div class="btn-or-spinner">
                <button v-if="!isLoadingAccept" class="btn btn-secondary" @click="handleAccept">
                    Accept
                </button>
                <VueSpinner v-else size="30" color="var(--secondary)" /> 
            </div>
        </div>

        <p class="warning-note">
            Consent is required to use this web application. If you decline the User Consent 
            Form, you will not be able to proceed with onboarding or use the application.
        </p>
    </PublicPageLayout>
    
    <!-- decline confirmation modal -->
    <div v-if="showDeclineModal" class="modal-overlay">
        <div class="confirmation-modal">
            <button class="close-modal" @click="showDeclineModal = false">
                &times;
            </button>
            <h3 class="modal-title">Are you sure you want to decline?</h3>
            <p class="modal-body">Your personal data is necessary for NUSOS to function.
                If you choose to decline, your account will be <strong>permanently deleted 
                immediately</strong>. This action cannot be undone.
            </p>
            <div class="confirmation-buttons">
                <button class="btn cancel-btn modal-btn" 
                    :disabled="isLoadingDecline" @click="showDeclineModal = false">
                        Cancel
                </button>
                <div class="btn-or-spinner">
                    <button class="btn btn-danger modal-btn" v-if="!isLoadingDecline" @click="handleDecline">
                        Confirm Decline
                    </button>
                    <VueSpinner v-else size="30" color="var(--secondary)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { VueSpinner } from 'vue3-spinners';
import { db } from '@/firebase.js';
import { deleteUser } from 'firebase/auth';
import { getCurrentUser } from '@/auth.js';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import PublicPageLayout from '@/components/PublicPageLayout.vue';

export default {
    name: 'ConsentForm',
    components: {
        VueSpinner,
        PublicPageLayout,
    },

    data() {
        return {
            isLoadingAccept: false,
            isLoadingDecline: false,
            showDeclineModal: false,
        }
    },

    methods: {
        async handleAccept() {
            this.isLoadingAccept = true;

            try {
                /* // TODO: remove comment after authentication is set up
                const user = getCurrentUser();
                if (!user) {
                    throw new Error('User not authenticated');
                }
                */

                // stimulate user.uid
                let user = {uid: "user1"};

                await updateDoc(doc(db, 'users', user.uid), {
                    granted_consent: true,
                });

                this.$router.replace('/onboarding');
            } catch (error) {
                console.error('Error updating consent status:', error);
                alert("Something went wrong. Please try again.");
            } finally {
                this.isLoadingAccept = false;
            }
        },

        async handleDecline() {
            this.isLoadingDecline = true;

            try {
                const user = getCurrentUser();
                if (!user) {
                    throw new Error('User not authenticated');
                }

                // snapshot user data before deletion 
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                const userData = userDocSnap.exists() ? userDocSnap.data() : null;

                // delete Firestore document 
                await deleteDoc(userDocRef);

                try {
                    // delete Firebase Auth account
                    await deleteUser(user);
                } catch (authError) {
                    console.error('Error deleting user from Firebase Auth:', authError);

                    // restore Firestore document if Auth deletion fails
                    if (userData) {
                        await setDoc(userDocRef, userData);
                    }

                    throw authError; // rethrow to be caught by outer catch
                }

                this.$router.replace('/sign-up');
            } catch (error) {
                console.error('Error deleting account:', error);
                alert("Something went wrong. Please try again.");
            } finally {
                this.isLoadingDecline = false;
                this.showDeclineModal = false;
            }
        },
    }
}
</script>

<style scoped> 
.consent-page {
    display: flex;
    padding: 2rem;
    background-color: var(--primary);
}

.bg-decoration {
    width: 100vw;
    height: auto;
    position: absolute;
    top: 10vh;
    left: 0;
    z-index: 0;
    pointer-events: none;
}

.logo-container, .consent-container {
    z-index: 1;
}

.logo-container {
    position: absolute;
    top: 15vh;
    left: 15vw;
    width: 25vw;
    display: flex;
    align-items: center;
    justify-content: center; 
    top: 25vh;
}

.logo-content {
    width: 20vw;
    height: 20vw;
    border-radius: 50%;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--card-shadow);
}

.logo {
    width: 15vw;
    object-fit: contain;
}

.consent-container {
    padding-left: 45vw;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
}

.consent-card {
    background-color: var(--white);
    border-radius: var(--radius);
    padding: 2.75rem;
    box-shadow: var(--card-shadow);
    width: 40vw;
}

.consent-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--secondary);
    margin-bottom: 1rem;
}

.consent-section {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.section-title {
    font-size: 0.875rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.data-list {
    font-size: 0.875rem;
    list-style: none;
    padding-left: 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.data-list li {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.withdrawal-content {
    margin-bottom: 0.5rem;
}

.consent-note {
    font-size: 0.875rem;
    font-style: italic;
    margin-bottom: 0.5rem;
}

.consent-buttons {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3rem;
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

.warning-note {
    margin-top: 1rem;
    color: var(--gray3);
    font-size: 0.875rem;
}

.accept-spinner, .decline-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(181, 181, 181, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999; 
}

.confirmation-modal {
    position: relative;
    background: var(--white);
    border-radius: var(--radius);
    width: 50vw;
    padding: 2rem;
}

.close-modal {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 1.875rem;
    height: 1.875rem;
    border-radius: var(--radius);
    background: var(--gray4);
    border: none;
    color: var(--white);
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cancel-btn {
    background: var(--gray4);
    color: var(--white);
}

.close-modal:hover, .cancel-btn:hover {
    background-color: var(--gray5);
}

.modal-btn {
    width: 15vw;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.modal-body {
    font-size: 0.875rem;
    margin-bottom: 2rem;
}

.confirmation-buttons { 
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    padding: 0 3.5rem;
}
</style>